using System;

namespace Haven.Core.Models;


//represents a file content
//file is not stored here but the parent directory for hiding it
public class FileNode
{
    public long Size{get; set;}

    // a specific key is required to encrypt the chunks of files
    public byte[] Key{get; set;} = Array.Empty<byte>();

    // List of block Hashes that make up the files
    public List<byte[]> Chunks{get;set;} = new();
}

// represents sa folder
public class DirectoryNode
{
    public List<DirEntry> Children{get;set;} = new();
}

// entry inside a folder
public class DirEntry
{
    public string Name{get;set;} = string.Empty;
    public bool IsDirectory{get; set;}

    // Hash of target node
    public byte[] Cid{get; set;} = Array.Empty<byte>();

    // key to the directory node
    public byte[] Key{get;set;} = Array.Empty<byte>();
}
