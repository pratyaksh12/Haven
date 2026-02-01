using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Haven.Core.Crypto;
using Haven.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NSec.Cryptography;

namespace Haven.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository _users;

        // will change to redis, for now memory is fine ig
        private static readonly Dictionary<string, byte[]> _pendingChallenges = new();

        public AuthController(UserRepository users)
        {
            _users = users;
        }

        // client asks for salt to derive the keys, if user is not registered we register them on the spot

        [HttpGet("salt/{username}")]
        public IActionResult GetSalt(string username)
        {
            var user = _users.Get(username);
            if(user is null)
            {
                // new user 
                var salt = RandomNumberGenerator.GetBytes(32);
                user = new UserRecord()
                {
                    Username = username,
                    SaltHex = Convert.ToHexStringLower(salt)
                };
                _users.Save(user);
            }

            return Ok(new {salt = user.SaltHex});
        }

        // For client we give them a random challenge to sign
        [HttpPost("challenge")]
        public IActionResult RequestChallenge([FromBody] LoginRequest request)
        {
            // Validate User
            var user = _users.Get(request.Username);
            if(user is null) return NotFound("User not found");

            // if first time logging in. save the public key
            if (string.IsNullOrEmpty(user.PublicKeyHex))
            {
                user.PublicKeyHex = request.PublicKey;
                _users.Save(user);
            }
            else if(user.PublicKeyHex != request.PublicKey)
            {
                return BadRequest("Public Key mismatch! You are a snaike mate!");
            }

            var challenge = RandomNumberGenerator.GetBytes(32);
            _pendingChallenges[request.Username] = challenge;

            return Ok(new {challenge = Convert.ToHexStringLower(challenge)});
            
        }

        [HttpPost("verify")]
        public IActionResult VerifySignature([FromBody] VerifyRequest request)
        {
            if(!_pendingChallenges.TryGetValue(request.Username, out var challenge)){ return BadRequest("No challenges hm.... sus.");}

            var user = _users.Get(request.Username);
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
                _pendingChallenges.Remove(request.Username);

                // Generate JWT
                var token = GenerateJwtToken(user.Username);
                return Ok(new {token});
            }

            return Unauthorized("Nah you really are fake.");

        }

        private string GenerateJwtToken(string username)
        {
            var jwtKey = "SuperSecretKeyIGNOIDEAWHATTHISEXACTLYISBUTFORPRODUSEenvfiles"; //I know i know it has to be in appsetting, but this is just a demo dude chill.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim("role", "User")
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),//a week is a long enough time for demo
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
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
