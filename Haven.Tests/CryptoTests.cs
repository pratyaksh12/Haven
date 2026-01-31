using System;
using System.Text;
using System.Text.Unicode;
using Haven.Core.Crypto;

namespace Haven.Tests;

public class CryptoTests
{
    [Fact]
    public void CheckingIfEncrytionAndDecryptionWorkPerfectly()
    {
        var message = Encoding.UTF8.GetBytes("This is a secret message and should not be exposed");
        var key = CryptoLib.Encryption.GenerateKey();

        // Encrypt data
        var encryptedData = CryptoLib.Encryption.Encrypt(message, key);
        var decryptedData = CryptoLib.Encryption.Decrypt(encryptedData, key);

        // Verifyy

        Assert.NotEqual(message, encryptedData);
        Assert.Equal(decryptedData, message);
    }

    [Fact]
    public void CheckingForNonceBeingUsedOnce()
    {
        var message = Encoding.UTF8.GetBytes("This is to see if the nonce is different");
        var key = CryptoLib.Encryption.GenerateKey();

        //Encrypt 2 data to see the difference

        var encryption1 = CryptoLib.Encryption.Encrypt(message, key);
        var encryption2 = CryptoLib.Encryption.Encrypt(message, key);

        //See if the encrytion are different to eact other
        Assert.NotEqual(encryption1, encryption2);
    }

    [Fact]
    public void CheckingForIdentitySigning()
    {
        // create a new identity
        using var Identity = new CryptoLib.Identity();
        var data = Encoding.UTF8.GetBytes("This is a secured data");

        // sign the data
        var signature = Identity.Sign(data);

        var forgerData = Encoding.UTF8.GetBytes("This is a forged data");

        var isValid = CryptoLib.Identity.Verify(Identity.PublicKey, data, signature);
        var notValid = CryptoLib.Identity.Verify(Identity.PublicKey, forgerData, signature);

        Assert.True(isValid);
        Assert.False(notValid);

    }

    [Fact]
    public void KeyExchangeBetweenTwoUsers()
    {
        using var userA = new CryptoLib.ExchangeKeyPair(); 
        using var userB = new CryptoLib.ExchangeKeyPair();

        // compute exchangeKey for userA using userB's public key and vise versa

        var userASharedKey = userA.DerivedSharedKey(userB.PublicKey);   
        var userBSharedKey = userB.DerivedSharedKey(userA.PublicKey);   


        // The share key should match 
        Assert.Equal(userASharedKey, userBSharedKey);
        Assert.Equal(CryptoLib.Encryption.KeySize, userASharedKey.Length);
    }
}


