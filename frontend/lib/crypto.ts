import { generateKey } from 'crypto';
import _sodium from 'libsodium-wrappers';

export const _ready = _sodium.ready;
export const sodium = _sodium;

const KEY_SIZE = 32;
const NONCE_SIZE = 24; //chacha20

export const CryptoLib = {
    Encryption: {
        generateKey: () => {
            return sodium.randombytes_buf(KEY_SIZE);
        }
    },
    encrypt: (data: Uint8Array, key: Uint8Array): Uint8Array => {
        const nonce = _sodium.randombytes_buf(NONCE_SIZE);

        const cipher = _sodium.crypto_aead_chacha20poly1305_ietf_encrypt(data, null, null, nonce, key); //Got a heart attack understanding the documentation. Did not mention what 100s of chacha actually does brev :(

        // nonce + cipher
        const result = new Uint8Array(nonce.length + cipher.length);
        result.set(nonce);
        result.set(cipher, nonce.length);

        return result;
    },

    decrypt: (encryptedData: Uint8Array, key: Uint8Array): Uint8Array =>{
        if(encryptedData.length < NONCE_SIZE) throw new Error("Invalid data");

        const nonce = encryptedData.slice(0, NONCE_SIZE);
        const cipher = encryptedData.slice(NONCE_SIZE);

        return sodium.crypto_aead_chacha20poly1305_decrypt(null, cipher, null, nonce, key); //dude why are there like 50 same looking functions with the last character like literally different
    },
    Hash:{
        sha256: (data: Uint8Array): Uint8Array =>{
            return _sodium.crypto_hash_sha256(data);
        }
    },
    Utils:{
        ToHex: (data: Uint8Array) => sodium.to_hex(data),
        fromHex: (hex: string) => sodium.from_hex(hex)
    }
};