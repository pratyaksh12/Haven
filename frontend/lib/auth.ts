import axios from "axios"
import { CryptoLib } from "./crypto";

const BASE_API = 'http://localhost:5259/api/auth'

let _masterKey: Uint8Array | null = null;
const client = axios.create({
    baseURL: BASE_API
})

export const AuthService = {
    login: async (username: string, password: string) => {
        const response = await client.get(`salt/${username}`);
        const salt = response.data.salt;

        const keyPair = await CryptoLib.Identity.deriveKeyPair(password, salt);
        const publicKeyHex = CryptoLib.Utils.ToHex(keyPair.publicKey);

        const challengeResponse = await client.post(`challenge`, { username, publicKey: publicKeyHex });
        const challengeBytes = CryptoLib.Utils.fromHex(challengeResponse.data.challenge);

        const signature = await CryptoLib.Identity.sign(challengeBytes, keyPair.privateKey);
        const signatureHex = CryptoLib.Utils.ToHex(signature);

        const verifySignature = await client.post(`verify`, { username, signature: signatureHex })
        localStorage.setItem('haven_token', verifySignature.data.token);

        const encryptionPair = await CryptoLib.Identity.deriveKeyPair(password + "_master", salt);
        _masterKey = encryptionPair.privateKey.slice(0, 32);
    },
    logout: () => {
        localStorage.removeItem('haven_token');
        _masterKey = null;
    },

    getMasterKey: () => { return _masterKey; }

}