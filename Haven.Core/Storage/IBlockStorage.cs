using System;

namespace Haven.Core.Storage;

public interface IBlockStorage
{
    //put the data in that ile location
    Task<byte[]> PutAsync(byte[] data);

    //get the data from a location
    Task<byte[]> GetAsync(byte[] hash);

    //check if the data exists at this location
    Task<bool> HasAsync(byte[] hash);
}
