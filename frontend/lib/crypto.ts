// import { generateKey } from 'crypto';
import _sodium from 'libsodium-wrappers';


export const sodium = _sodium;

const KEY_SIZE = 32;
const NONCE_SIZE = 24; //chacha20

export const CryptoLib = {
    Identity: {
        deriveKeyPair: async (password: string, saltHex: string) => {
            await _sodium.ready;
            const salt = sodium.from_hex(saltHex);

            const seed = sodium.crypto_pwhash(
                sodium.crypto_sign_SEEDBYTES,
                password,
                salt,
                sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
                sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
                sodium.crypto_pwhash_ALG_ARGON2ID13
            )

            return sodium.crypto_sign_seed_keypair(seed);
        },
        sign: async (message: Uint8Array, privateKey: Uint8Array) => {
            await _sodium.ready;
            return sodium.crypto_sign_detached(message, privateKey);
        }
    },
    Encryption: {
        generateKey: async () => {
            await _sodium.ready;
            return sodium.randombytes_buf(KEY_SIZE);
        }
    },
    encrypt: async (data: Uint8Array, key: Uint8Array): Promise<Uint8Array> => {
        await _sodium.ready;
        const nonce = _sodium.randombytes_buf(NONCE_SIZE);
        //  const cipher = _sodium.crypto_aead_chacha20poly1305_ietf_encrypt(data, null, null, nonce, key); //Got a heart attack understanding the documentation. Did not mention what 100s of chacha actually does brev :(
        const cipher = _sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(data, null, null, nonce, key); // i blame the poor documentation 

        // nonce + cipher
        const result = new Uint8Array(nonce.length + cipher.length);
        result.set(nonce);
        result.set(cipher, nonce.length);

        return result;
    },

    decrypt: async (encryptedData: Uint8Array, key: Uint8Array): Promise<Uint8Array> => {
        if (encryptedData.length < NONCE_SIZE) throw new Error("Invalid data");
        await _sodium.ready;
        const nonce = encryptedData.slice(0, NONCE_SIZE);
        const cipher = encryptedData.slice(NONCE_SIZE);
        // return sodium.crypto_aead_chacha20poly1305_decrypt(null, cipher, null, nonce, key); //dude why are there like 50 same looking functions with the last character like literally different
        return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, cipher, null, nonce, key); // oh hell naw that studip character in the end took like an hour until ai told we what the hell that is
    },
    Hash: {
        sha256: async (data: Uint8Array): Promise<Uint8Array> => {
            const hashBuffer = await crypto.subtle.digest('SHA-256', data as any); // will it fix?
            return new Uint8Array(hashBuffer);
        }
    },
    Utils: {
        ToHex: (data: Uint8Array) => sodium.to_hex(data),
        fromHex: (hex: string) => sodium.from_hex(hex)
    }
};