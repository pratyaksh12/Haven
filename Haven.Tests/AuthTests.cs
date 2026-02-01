using System;
using System.Net.Http.Json;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using Haven.Core.Crypto;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Haven.Tests;

public class AuthTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task FullLoginFlowWithJwtTokenReturn()
    {
        var username = "testuser_" + Guid.NewGuid().ToString();

        // get salt
        var saltResponse = await _client.GetFromJsonAsync<JsonElement>($"api/auth/salt/{username}");
        var SaltHex = saltResponse.GetProperty("salt").GetString();
        var salt = Convert.FromHexString(SaltHex!);

        // client: generate identity using password and salt
        // for now lets think that the password and salt hash resulted in a 32 byte seed

        var seed = System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes("random password" + SaltHex));

        using var identity = new CryptoLib.Identity(seed);
        var publicKeyHex = Convert.ToHexStringLower(identity.PublicKey.Export(NSec.Cryptography.KeyBlobFormat.RawPublicKey));


        // request challenge
        var challengeRequest = new {Username = username, PublicKey = publicKeyHex};
        var challengeResponse = await _client.PostAsJsonAsync("api/auth/challenge", challengeRequest);
        challengeResponse.EnsureSuccessStatusCode();


        var challengeJson = await challengeResponse.Content.ReadFromJsonAsync<JsonElement>();
        var challengeHex = challengeJson.GetProperty("challenge").GetString();
        var challengeBytes = Convert.FromHexString(challengeHex!);

        // client wil sign the challenge
        var signatureBytes = identity.Sign(challengeBytes);
        var signatureHex = Convert.ToHexStringLower(signatureBytes);

        // verify the challenge
        var verifyRequest = new {Username = username, Signature = signatureHex};
        var verifyResponse = await _client.PostAsJsonAsync("api/auth/verify", verifyRequest);
        verifyResponse.EnsureSuccessStatusCode();
        
        // get the token
        var tokenJson = await verifyResponse.Content.ReadFromJsonAsync<JsonElement>();
        var token = tokenJson.GetProperty("token").GetString();

        Console.WriteLine(token);

        Assert.Equal(3, token!.Split(".").Length);  // would have checked for issuer and audience but for now it should have 3 parts


    }
}
