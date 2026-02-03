import { api } from "@/lib/api";
import { CryptoLib } from "@/lib/crypto";
import { FileNode } from "@/lib/filesystem";
import { useCallback, useState } from "react";

export function useFileDownload() {
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const downloadFile = useCallback(async (fileNode: FileNode) => {

        try {
            const key = CryptoLib.Utils.fromHex(fileNode.key);

            const decryptChunks: Uint8Array[] = [];
            let totalbytes = 0;
            // get all chunks
            for (const cid of fileNode.chunks) {
                const encryptedBlock = await api.blocks.download(cid);
                const decryptBlock = await CryptoLib.decrypt(encryptedBlock, key);

                decryptChunks.push(decryptBlock);
                totalbytes += decryptBlock.length;
            }

            const fileBlob = new Blob(decryptChunks as any, { type: fileNode.mimeType });

            // Trigger Browser View (Open in New Tab)
            const url = URL.createObjectURL(fileBlob);
            window.open(url, '_blank');

            // Note: We don't revoke immediately so the tab has time to load
            setTimeout(() => URL.revokeObjectURL(url), 1000);

            console.log('download complete');
        } catch (error) {
            console.error("Download Failed", error);
            alert("Failed to download file. Check console")
        } finally {
            setIsDownloading(false);
        }


    }, [])

    return { downloadFile, isDownloading }
}