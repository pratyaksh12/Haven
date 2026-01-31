using System;
using Haven.Core.Crypto;

namespace Haven.Core.Storage;

public class FileBlockStorage : IBlockStorage
{
    private readonly string _basePath;
    public FileBlockStorage(string basePath)
    {
        _basePath = basePath;
        Directory.CreateDirectory(_basePath);
    }
    public async Task<byte[]> PutAsync(byte[] data)
    {
        var hash = CryptoLib.Hash.Sha256(data);
        var hex = Convert.ToHexStringLower(hash);

        var path = Path.Combine(_basePath, hex);

        if (!Path.Exists(path))
        {
            await File.WriteAllBytesAsync(path, data);
        }

        return hash;
    }

    public async Task<byte[]> GetAsync(byte[] hash)
    {
        var hex = Convert.ToHexStringLower(hash);

        var path = Path.Combine(_basePath, hex);

        if (!Path.Exists(path))
        {
            throw new FileNotFoundException($"Block not found at hex: {hex}");
        }

        return await File.ReadAllBytesAsync(path);
    }

    public Task<bool> HasAsync(byte[] hash)
    {
        var hex = Convert.ToHexStringLower(hash);

        var path = Path.Combine(_basePath, hex);

        return Task.FromResult(File.Exists(path));

    }
}
