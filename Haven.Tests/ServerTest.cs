using System;
using System.Diagnostics.CodeAnalysis;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestPlatform.TestHost;

namespace Haven.Tests;

public class ServerTest : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ServerTest(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task UploadingBlockAndThenReturningCidAndRetievalOfData()
    {
        // Arrange
        var data = Encoding.UTF8.GetBytes("This is some data that is going to be encrypted");
        var content = new ByteArrayContent(data);

        // Act upload
        var uploadResponse = await _client.PostAsync("api/block", content);
        uploadResponse.EnsureSuccessStatusCode();

        var json = await uploadResponse.Content.ReadAsStringAsync();

        // extract cid
        var cid = json.Split(":")[2].Trim('"', ' ', '}');

        // Act download
        var downloadresponse = await _client.GetAsync($"api/block/{cid}");
        downloadresponse.EnsureSuccessStatusCode();
        var retreivedData = await downloadresponse.Content.ReadAsByteArrayAsync();

        // Assert
        Assert.Equal(data, retreivedData);
    }
}
