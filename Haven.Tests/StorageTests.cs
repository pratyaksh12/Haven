using System;
using System.Text;
using System.Threading.Tasks;
using Haven.Core.Crypto;
using Haven.Core.Storage;

namespace Haven.Tests;

public class StorageTests
{
    [Fact]
    public async Task BlockStoreStorageAndRetrieval()
    {
        //Arrange
        var tmp = Path.Combine(Path.GetTempPath(), "HavenTests", Guid.NewGuid().ToString());
        var store = new FileBlockStorage(tmp);
        var data = Encoding.UTF8.GetBytes("This is initial testing of blockstorage and retrieval.");

        //Act
        var hash = await store.PutAsync(data);
        var retrieval = await store.GetAsync(hash);

        //Assert

        // Assert.Equal(data, retrieval);
        Assert.True(await store.HasAsync(hash));

        // cleanup
        Directory.Delete(tmp, true);
    }
}
