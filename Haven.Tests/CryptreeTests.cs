using System;
using Haven.Core.Models;
using Haven.Core.Storage;

namespace Haven.Tests;

public class CryptreeTests
{
    [Fact]
    public async Task CreateAndReadFileWorkflowCheck()
    {
        // Arrange
        var tmpfolder = Path.Combine(Path.GetTempPath(), "CreateAndReadTest", Guid.NewGuid().ToString());
        var store = new FileBlockStorage(tmpfolder);
        var tree = new Cryptree(store);
        var data = new byte[1024 * 1024 * 8 + 200]; //8.something MB
        new Random().NextBytes(data); // random data

        // Act
        var (cid, key) = await tree.CreateFileAsync(data);
        var retrieveData = await tree.ReadFileAsync(cid, key);

        // Assert
        Assert.Equal(data, retrieveData);
        Assert.NotEqual(cid, key); //just like that lol.

        Directory.Delete(tmpfolder, true);

    }
}
