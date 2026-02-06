import { api } from "@/lib/api";
import { CryptoLib } from "@/lib/crypto";
import { useCallback, useState } from "react";
import { FileNode, FileSystem } from '@/lib/filesystem';
import { Key } from "lucide-react";

const CHUNK_SIZE = 1024 * 1024;

export interface UploadProgress {
    fileName: string;
    progress: number;
    status: 'pending' | 'completed' | 'uploading' | 'error' | 'encrypting';
    speed?: string;
}

export function useFileUpload() {
    const [uploads, setUploads] = useState(<Record<string, UploadProgress>>({}));
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [fileNode, setFileNode] = useState<FileNode | null>(null)

    const updateStatus = useCallback((fileName: string, update: Partial<UploadProgress>) => {
        setUploads(prev => ({
            ...prev,
            [fileName]: { ...prev[fileName], ...update }
        }))
    }, [])

    const uploadFile = useCallback(async (file: File): Promise<FileNode | null> => {
        const fileName = file.name;

        setUploads(prev => ({
            ...prev,
            [fileName]: { fileName, progress: 0, status: "pending" }
        }));

        setIsProcessing(true);

        try {
            updateStatus(fileName, { status: 'encrypting', progress: 5 });
            const fileKey = CryptoLib.Encryption.generateKey();

            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            let byteProcessed = 0;
            const startTime = Date.now();
            const chunks: string[] = []; //string CIDs

            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);  // can I fit another chunk or the remaining data
                const chunkBlob = file.slice(start, end);

                // read Chunk
                const arrayBuffer = await chunkBlob.arrayBuffer();
                const chunkData = new Uint8Array(arrayBuffer);

                // encrypt the chunk
                const encryptedChunk = CryptoLib.encrypt(chunkData, await fileKey);

                // ~~TODO: have to send the data to the backend~~ impolementation completed
                const cid = await api.blocks.upload(await encryptedChunk); // return cid -> store it now generate key
                chunks.push(cid);

                //got it from reddit
                byteProcessed += chunkData.length;
                const percent = Math.round(byteProcessed / file.size * 100);
                const elapsed = (Date.now() - startTime) / 1000;
                const mb = byteProcessed / CHUNK_SIZE;
                const speed = elapsed > 0 ? `${(mb / elapsed).toFixed(1)} MB/s` : 'Calculating...';

                updateStatus(fileName, {
                    progress: percent,
                    status: 'uploading',
                    speed: speed
                });

                await new Promise(r => setTimeout(r, 50));
            }

            const fileNode = FileSystem.createFileNode(file.name, file.size, file.type, chunks, await fileKey);
            setFileNode(fileNode);
            const nodeBytes = FileSystem.serialize(fileNode);
            // i'll encrypt this as well in later releases

            const finalCid = await api.blocks.upload(nodeBytes);
            console.log(`File Uploaded! Root CID: ${finalCid}`);
            updateStatus(fileName, { status: 'completed', progress: 100 });
            return fileNode;

        } catch (err: any) {
            console.error(err);
            updateStatus(fileName, { status: 'error' })
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [updateStatus]);

    return { uploadFile, uploads, isProcessing, lastUploadedNode: fileNode };
}