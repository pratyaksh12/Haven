using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Haven.Core.Crypto;
using Haven.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NSec.Cryptography;

namespace Haven.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HavenDbContext _db;
        private static readonly Dictionary<string, byte[]> _challenges = new();
        public AuthController(HavenDbContext db)
        {
            _db = db;
        }

        // client asks for salt to derive the keys, if user is not registered we register them on the spot
        [HttpGet("salt/{username}")]
        public IActionResult GetSalt(string username)
        {
            var user = _db.Users.Find(username);
            if(user is null)
            {
                var salt = RandomNumberGenerator.GetBytes(16);
                user = new UserRecord()
                {
                    Username = username,
                    SaltHex = Convert.ToHexStringLower(salt)
                };
                
                _db.Users.Add(user);
                _db.SaveChanges();
            }

            return Ok(new {salt = user.SaltHex});
        }

        // For client we give them a random challenge to sign
        [HttpPost("challenge")]
        public IActionResult RequestChallenge([FromBody] LoginRequest request)
        {
            // Validate User
            var user = _db.Users.Find(request.Username);
            if(user is null) return NotFound("User not found");

            // if first time logging in. save the public key
            if (string.IsNullOrEmpty(user.PublicKeyHex))
            {
                user.PublicKeyHex = request.PublicKey;
                _db.SaveChanges();
            }
            else if(user.PublicKeyHex != request.PublicKey)
            {
                return BadRequest("Public Key mismatch! You are a snaike mate!");
            }

            var challenge = RandomNumberGenerator.GetBytes(32);
            _challenges[request.Username] = challenge;

            return Ok(new {challenge = Convert.ToHexStringLower(challenge)});
        }

        [HttpPost("verify")]
        public IActionResult VerifySignature([FromBody] VerifyRequest request)
        {
            if(!_challenges.TryGetValue(request.Username, out var challenge)){ return BadRequest("No challenges hm.... sus.");}

            var user = _db.Users.Find(request.Username);
            if(user == null) return Unauthorized();

            var pubKeyBytes = Convert.FromHexString(user.PublicKeyHex);
            var sigBytes = Convert.FromHexString(request.Signature);

            var publicKey = PublicKey.Import(
                SignatureAlgorithm.Ed25519,
                pubKeyBytes,
                KeyBlobFormat.RawPublicKey
            );

            if(CryptoLib.Identity.Verify(publicKey, challenge, sigBytes))
            {
                _challenges.Remove(request.Username);

                var token = GenerateJwtToken(user.Username);
                return Ok(new {token});
            }
            return Unauthorized("Nah you really are fake.");
        }

        [Authorize]
        [HttpPut("root")]
        public async Task<IActionResult> UpdateRoot([FromBody] UpdateRootRequest req)
        {
            var username = User.Identity?.Name;
            if(string.IsNullOrEmpty(username)) return Unauthorized();

            var user = await _db.Users.FindAsync(username);
            if(user == null)return Unauthorized();

            user.RootCid = req.RootCid;
            await _db.SaveChangesAsync();

            return Ok();

        }

        [Authorize]
        [HttpGet("root")]
        public async Task<IActionResult> GetRoot()
        {
            var username = User.Identity?.Name;
            if(string.IsNullOrEmpty(username)) return Unauthorized();

            var user = await _db.Users.FindAsync(username);
            return Ok(new {rootCid = user?.RootCid});
        }

        private string GenerateJwtToken(string username)
        {
            // I will put it in appsetting later
            var jwtKey = "SuperSecretKeyIGNOIDEAWHATTHISEXACTLYISBUTFORPRODUSEenvfiles";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim("role", "User")
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
public class UpdateRootRequest
{
    public string RootCid { get; set; } = "";
}

public class LoginRequest
{
    public string Username { get; set; } = null!;
    public string PublicKey { get; set; } =null!;
}
public class VerifyRequest
{
    public string Username { get; set; } = null!;
    public string Signature { get; set; } = null!;
}
