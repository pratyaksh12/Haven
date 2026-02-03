import axios from 'axios';
import { CryptoLib } from './crypto';

const API_BASE = 'http://localhost:5259';

const client =  axios.create({
    baseURL: API_BASE,
    timeout: 30000 //30s max should be fine. Might increase in case of a bigger file.
})

export const api ={
    blocks: {
        async upload(encryptData: Uint8Array): Promise<string>{
            const hash = CryptoLib.Hash.sha256(encryptData);
            const cid = CryptoLib.Utils.ToHex(hash);

            // upload via axios
            const response = await client.post('/blocks', encryptData, {
                headers: {
                    'Content-Type' : 'application-stream',
                    'X-Haven-CID': cid
                }
            });

            return response.data.cid || cid
        }
    }
}