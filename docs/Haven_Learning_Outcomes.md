# What You Will Learn with Haven

Building Haven is an advanced software engineering project. It moves beyond simple "CRUD" (Create, Read, Update, Delete) apps into the realm of **Systems Programming**, **Cryptography**, and **Distributed Systems**.

## 1. Cryptography & Security
You will move from "using auth libraries" to understanding how secure systems are built from scratch.
*   **Zero-Knowledge Architecture:** How to build apps where the server *cannot* see the data.
*   **Primitive Implementation:** You will use **TweetNaCl** (via NSec) directly:
    *   **Ed25519:** For digital signatures (Identity).
    *   **Curve25519:** For Diffie-Hellman key exchange (Sharing).
    *   **XSalsa20-Poly1305:** For symmetric file encryption.
*   **Key Derivation:** implementing **Scrypt** to turn a password into a secure master key.

## 2. Advanced .NET 9 & C#
This isn't just basic ASP.NET. You will use high-performance features.
*   **Memory Management:** Using `Span<T>` and `Memory<T>` to handle file chunks without allocating massive amounts of RAM.
*   **Clean Architecture:** Separating your Core logic (Crypto/Nodes) from the Infrastructure (IPFS/ASP.NET) to make the code testable and portable.
*   **Binary Protocols:** Handling raw binary data streams instead of just JSON strings.

## 3. Distributed System Design
You will learn how modern decentralized networks (like IPFS, BitTorrent, and Git) work under the hood.
*   **Merkle Trees:** How to verify a large file structure using a single hash (the Root Hash).
*   **Content-Addressing:** Why pointing to data by its *Hash* (CID) is better than its *Location* (URL).
*   **HAMT (Hash Array Mapped Trie):** Implementing a complex data structure to handle folders with millions of files efficiently.

## 4. Full-Stack Engineering (Next.js)
*   **Client-Side Logic:** Moving the "Brains" to the browser. Decryption happens in the user's browser, not the server.
*   **Web Workers:** Running heavy crypto tasks in background threads so the UI doesn't freeze.
*   **State Management:** Managing complex virtual filesystem states in React.

## 5. Summary of Characteristics
| Haven Characteristic | Traditional App | What you learn |
| :--- | :--- | :--- |
| **Trust** | Server is trusted | Server is **Untrusted** |
| **Storage** | Database Rows | **Encrypted Blocks (IPFS)** |
| **Login** | Send Password to Server | **Sign Challenge (Zero-Knowledge)** |
| **Files** | Files on Disk | **Cryptree (Merkle Tree)** |
