using System;
using System.Security.Cryptography;
using NSec.Cryptography;

namespace Haven.Core.Crypto;

public class CryptoLib
{
    private static readonly SignatureAlgorithm _signer =  SignatureAlgorithm.Ed25519;
    private static readonly AeadAlgorithm _cipher = AeadAlgorithm.XChaCha20Poly1305;
    private static readonly KeyAgreementAlgorithm _exchange = KeyAgreementAlgorithm.X25519;


    public static class Hash
    {
        public static byte[] Sha256(ReadOnlySpan<byte> data)
        {
            return SHA256.HashData(data);  
        }
    }

    public class Identity : IDisposable
    {
        public Key Key {get;} = null!;
        public PublicKey PublicKey => Key.PublicKey;


        public Identity()
        {
            Key = Key.Create(_signer);
        }

        public Identity(byte[] seed)
        {
            Key = Key.Import(_signer,seed, KeyBlobFormat.RawPrivateKey);
        }

        public byte[] Sign(ReadOnlySpan<byte> data)
        {
            return _signer.Sign(Key, data);
        }


        public static bool Verify(PublicKey publicKey, ReadOnlySpan<byte> data, ReadOnlySpan<byte> signature)
        {
            try
            {
                return _signer.Verify(publicKey, data, signature);
            }
            catch
            {
                return false;
            }
        }

        public void Dispose()
        {
            Key?.Dispose();
        }
    }

    public class ExchangeKeyPair : IDisposable
    {
        public Key Key{get;} = null!;
        public PublicKey PublicKey => Key.PublicKey;

        public ExchangeKeyPair()
        {
            Key = Key.Create(_exchange);
        }
        public ExchangeKeyPair(byte[] seed)
        {
            Key = Key.Import(_exchange, seed, KeyBlobFormat.RawPrivateKey);
        }

        public byte[] DerivedSharedKey(PublicKey otherPartyPublicKey)
        {
            using var sharedSecret = _exchange.Agree(Key, otherPartyPublicKey);

            return KeyDerivationAlgorithm.HkdfSha256.DeriveBytes(sharedSecret!, ReadOnlySpan<Byte>.Empty, ReadOnlySpan<byte>.Empty, Encryption.KeySize);
        }

        public void Dispose()
        {
            Key?.Dispose();
        }
    }

    public static class Encryption
    {
        public const int KeySize = 32;
        public const int NonceSize = 24;

        public static byte[] GenerateKey()
        {
            return RandomNumberGenerator.GetBytes(KeySize);
        }

        public static byte[] Encrypt(ReadOnlySpan<byte> data, ReadOnlySpan<byte> key)
        {
            using var k = Key.Import(_cipher, key, KeyBlobFormat.RawSymmetricKey);

            var nonce = RandomNumberGenerator.GetBytes(NonceSize);

            var cipherText =  _cipher.Encrypt(k, nonce,ReadOnlySpan<byte>.Empty, data);

            var result = new byte[nonce.Length + cipherText.Length];

            nonce.CopyTo(result.AsSpan<byte>(0, NonceSize));
            cipherText.CopyTo(result.AsSpan<byte>(NonceSize));


            return result;
        }

        public static byte[] Decrypt(ReadOnlySpan<byte> encryptedData, ReadOnlySpan<byte> key)
        {
            using var k = Key.Import(_cipher, key, KeyBlobFormat.RawSymmetricKey);
            var nonce  = encryptedData.Slice(0, NonceSize);
            var cipherText = encryptedData.Slice(NonceSize);

            var result = _cipher.Decrypt(k, nonce, ReadOnlySpan<byte>.Empty, cipherText) ?? throw new Exception("Error Decrypting the data");
            return result;
        }
    }
}
