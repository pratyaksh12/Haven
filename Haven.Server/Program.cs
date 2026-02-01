using System.Text;
using Haven.Core.Storage;
using Haven.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
var data = Path.Combine(Directory.GetCurrentDirectory(), "Data");
builder.Services.AddSingleton<IBlockStorage>(new FileBlockStorage(data));
// add userRepository here
builder.Services.AddSingleton<UserRepository>(new UserRepository(data));

// jwt config
var jwtKey = "SuperSecretKeyIGNOIDEAWHATTHISEXACTLYISBUTFORPRODUSEenvfiles";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(
    options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    }
);

var app = builder.Build();
app.MapControllers();
app.UseAuthentication();
app.UseAuthentication();
app.Run();

public partial class Program { }
