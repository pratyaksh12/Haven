import axios from "axios"
import { CryptoLib } from "./crypto";
import { Console } from "console";

const BASE_API = 'http://localhost:5259/api/auth'

const client = axios.create({
    baseURL: BASE_API
})

export const AuthService = {
    login: async (username: string, password: string) => {

        const response = await client.get(`salt/${username}`);

        const keyPair = await CryptoLib.Identity.deriveKeyPair(password, response.data.salt);
        const publicKeyHex = CryptoLib.Utils.ToHex(keyPair.publicKey);

        const challengeResponse = await client.post('challenge', { username, publicKey: publicKeyHex });
        const challengeHex = challengeResponse.data.challenge;
        // Decode Hex Challenge -> Bytes
        const challengeBytes = CryptoLib.Utils.fromHex(challengeHex);
        const signature = await CryptoLib.Identity.sign(challengeBytes, keyPair.privateKey);
        const signatureHex = CryptoLib.Utils.ToHex(signature);

        const verifyRes = await client.post(`verify`, {
            username,
            signature: signatureHex
        });

        const token = verifyRes.data.token;
        localStorage.setItem('haven_token', token);
    },
    logout: () => {
        localStorage.removeItem('haven_token');
    }
}