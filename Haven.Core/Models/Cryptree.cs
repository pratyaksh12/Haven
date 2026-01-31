using System;
using System.Text.Json;
using Haven.Core.Crypto;
using Haven.Core.Storage;
using NSec.Cryptography;

namespace Haven.Core.Models;

public class Cryptree
{
    private readonly IBlockStorage _store;
    public Cryptree(IBlockStorage store)
    {
        _store = store;    

    }

    // chunk -> encrypt chunk -> upload chunks -> create fileNode -> encrypt fileNode -> upload fileNode

    public async Task<(byte[] Cid, byte[] key)> CreateFileAsync(byte[] data)
    {
        var fileKey = CryptoLib.Encryption.GenerateKey(); //key for the chunks
        var fileNode = new FileNode()
        {
            Size = data.Length,
            Key = fileKey
        };

        // chunking the data
        const int chunkSize = 1024 * 1024; // 1MB
        using var stream = new MemoryStream(data);
        var buffer = new byte[chunkSize];
        int bytesRead;

        while((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
        {
            var clearChunk = buffer.AsSpan(0, bytesRead);

            // encrypt the chunk
            var chunkCid = CryptoLib.Encryption.Encrypt(clearChunk, fileKey);

            // get the hash after storing
            var hash = await _store.PutAsync(chunkCid);
            // pu the hash in the filenode
            fileNode.Chunks.Add(hash);
        }

        // save the filenode
        var serializedNode = JsonSerializer.SerializeToUtf8Bytes(fileNode);

        // generate the key for the fileNode
        var fileNodeKey = CryptoLib.Encryption.GenerateKey();
        var encryptedFileNode = CryptoLib.Encryption.Encrypt(serializedNode, fileNodeKey);
        
        // store the file away
        var fileNodeHash = await _store.PutAsync(encryptedFileNode);

        return (fileNodeHash, fileNodeKey);

    }


    // Get fileNode -> Decrypt it -> Get chunks -> decrypt Chunks -> Assemble

    public async Task<byte[]> ReadFileAsync(byte[] Cid, byte[] key)
    {
        // get the fileNode
        var encryptedNode = await _store.GetAsync(Cid);
        var decrytedFileNode = CryptoLib.Encryption.Decrypt(encryptedNode, key);

        // retieve the file node
        var fileNode = JsonSerializer.Deserialize<FileNode>(decrytedFileNode) ?? throw new FileNotFoundException("Ay Cramba ...... this file ain't there senior!!");

        using var output = new MemoryStream();

        foreach(var chunkCid in fileNode.Chunks)
        {
            var encryptedChunk = await _store.GetAsync(chunkCid);
            var decryptedChunk = CryptoLib.Encryption.Decrypt(encryptedChunk, fileNode.Key);
            await output.WriteAsync(decryptedChunk);
        }

        return output.ToArray();
    }
    
}
