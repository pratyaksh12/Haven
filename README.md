# Haven

Haven is a zero-knowledge cloud storage system designed for absolute privacy. It employs transparent client-side encryption, meaning the server stores only opaque, encrypted chunks and never has access to your actual files. Featuring a secure virtual file system, automated garbage collection, and a completely trustless architecture, Haven ensures your data remains exclusively yours, secure from any prying eyes.

## Architecture Overview

Haven separates the Client (Trust Zone) from the Server (Untrusted Zone). The server acts as a dumb block store.

```mermaid
graph TD
    subgraph Client [Client Side: Trust Zone]
        A[User File] --> B(Chunk & Encrypt)
        B --> C[Encrypted Blobs]
        D[File Metadata] --> E(Encrypt Metadata)
        E --> F[Directory Node]
    end

    subgraph Server [Server Side: Untrusted Zone]
        C -- POST --> G[Block Store]
        F -- POST --> G
        G -- GET --> Client
    end
```

## Encryption Process

Before any data leaves the client, it is chunked and encrypted using keys derived from your password. We utilize high-performance cryptography (XSalsa20-Poly1305 and Ed25519).

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Network
    
    User->>Client: Select File (e.g. video.mp4)
    Client->>Client: Derive Master Key (Argon2id)
    Client->>Client: Generate Random File Key
    Client->>Client: Split File into 1MB Chunks
    
    loop Every Chunk
        Client->>Client: Compress & Encrypt Chunk (XSalsa20)
        Client->>Network: Upload Encrypted Blob
    end
    
    Client->>Client: Create File Node (Map of Chunk Hashes)
    Client->>Client: Serialize & Encrypt File Node
    Client->>Network: Upload File Node Blob
```

## Storage & Virtual File System

Haven does not use a traditional database for files. It uses a Cryptree (Merkle Tree). Your "Root Directory" is just a pointer to an encrypted block that contains pointers to other blocks.

```mermaid
graph TD
    Root[User Root Pointer] --> DirBlock[Encrypted Directory Block]
    DirBlock --> FileBlock1[Encrypted File Node A]
    DirBlock --> FileBlock2[Encrypted File Node B]
    
    FileBlock1 --> Chunk1[Encrypted Chunk 1]
    FileBlock1 --> Chunk2[Encrypted Chunk 2]
    
    FileBlock2 --> Chunk3[Encrypted Chunk 3]
```

## Decryption Process

When you view a file, the browser downloads the encrypted chunks and reassembles them in memory. The plaintext never touches the disk.

```mermaid
flowchart LR
    A[Download Blob] --> B[Decrypt with Master Key]
    B --> C{Is Directory?}
    C -- Yes --> D[Read File List]
    C -- No --> E[Read Chunk List]
    E --> F[Download Chunks]
    F --> G[Decrypt & Stream to User]
```

## Garbage Collection

When a file is deleted, the client marks the blocks as "Trash". The server, unable to read the file tree, relies on this signal to clean up storage.

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant GC Service
    
    Client->>Server: DELETE File Request
    Client->>Server: POST /api/trash (List of Block Hashes)
    Server->>DB: Add Hashes to Trash Queue
    
    Note over GC Service: Every 10 Minutes
    GC Service->>DB: Fetch Trash Queue
    loop Every Item
        GC Service->>Disk: Delete Physical Block
        GC Service->>DB: Remove from Queue
    end
```

## Technology Stack

### Backend
- .NET 9 (ASP.NET Core)
- Entity Framework Core (SQLite)
- Sodium.Core (Cryptography)

### Frontend
- Next.js (React 19)
- TailwindCSS
- Lucide Icons
- Libsodium.js (WASM Cryptography)
