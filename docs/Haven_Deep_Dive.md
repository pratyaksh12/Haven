# Haven Deep Dive: The Mechanics

## 1. The "Life of a File" (Step-by-Step)

Imagine you are uploading a 10MB PDF called `secret_plans.pdf` to Haven.

### Step A: The Split (Client-Side)
1.  **Browser/Client:** Reads the file into memory.
2.  **Chunking:** The PDF is too big for one block. It's sliced into two **5MB chunks**.
    *   *Chunk 1:* Bytes 0 - 5,242,880
    *   *Chunk 2:* Bytes 5,242,881 - 10,485,760

### Step B: The Encryption (Client-Side)
3.  **Key Gen:** The client generates a random 32-byte key ($K_{file}$) just for this file.
4.  **Encryption:**
    *   `EncryptedChunk1` = `XSalsa20(Chunk1, Key=Derived(K_{file}))`
    *   `EncryptedChunk2` = `XSalsa20(Chunk2, Key=Derived(K_{file}))`
    *   *Note:* The output looks like random static.

### Step C: Hashing (Client-Side)
5.  **Addressing:** We calculate the Hash (SHA-256) of the *encrypted* chunks.
    *   `Hash1` = SHA256(EncryptedChunk1)
    *   `Hash2` = SHA256(EncryptedChunk2)

### Step D: The "Dumb" Storage (Server-Side)
6.  **Upload:** Client sends `EncryptedChunk1` and `EncryptedChunk2` to the Server.
7.  **Storage:** The Server (ASP.NET Core) receives these blobs. It doesn't know who owns them or what they are. It just saves them to disk (or IPFS) using their filename:
    *   `/data/Hash1`
    *   `/data/Hash2`

### Step E: The Metadata (The "Glue")
8.  **FileNode Creation:** The Client creates a tiny JSON object (the `FileNode`):
    ```json
    {
      "name": "secret_plans.pdf",
      "size": 10485760,
      "key": "K_file",
      "chunks": ["Hash1", "Hash2"]
    }
    ```
9.  **Encryption:** This `FileNode` is *also* encrypted (using the Key of the parent folder).
10. **Tree Update:** The Hash of this encrypted `FileNode` is added to the Parent Directory's list.

---

## 2. What Exactly Will Be Coded?

### A. The "Cryptree" Data Structure
*   **The concept:** A File System is just a Tree.
*   **The Code:** You will write a class `DirectoryNode` that contains `List<NodeLink>`.
*   **The Challenge:** When you change a file deep in the tree (e.g., `/photos/2024/jan/party.jpg`), the Hash of `jan` changes. Which means the Hash of `2024` changes. Which means the Hash of `photos` changes.
*   **Skill Learned:** **Recursive Data Structures** and **Merkle Proofs**. This is the fundamental technology behind Bitcoin and Git.

### B. The Network Protocol (RPC)
*   **The Concept:** The Frontend needs to say "Give me Block X".
*   **The Code:** You won't just use standard REST (`GET /files/1`). You will implement a 'Content-Addressed' API: `GET /blocks/{hash}`.
*   **Skill Learned:** Designing APIs that are **Idempotent** and **Cacheable**. Because blocks never change, you can cache them forever.

## 3. Why This Project is Special
Most tutorials teach you to build a "Toy App".
*   *Toy App:* User logs in -> Server checks DB -> Server returns data.
*   *Haven:* User logs in (Server doesn't know password) -> Client asks for encrypted blob -> Server returns blob -> Client decrypts.
