import { AuthService } from "@/lib/auth";
import { CryptoLib } from "@/lib/crypto";
import { FileNode, FileSystem } from "@/lib/filesystem";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";


const STORAGE_KEY = "haven_files_v1";
const API_BASE = "http://localhost:5259/api"

export function useFileBrowser() {
    const router = useRouter();
    const [files, setFiles] = useState<FileNode[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            console.log("Filesystem: Starting load...");
            setIsLoading(true);
            try {
                const token = localStorage.getItem('haven_token');
                if (!token) {
                    console.log("Filesystem: No token found");
                    return;
                }

                const rootRes = await axios.get(`${API_BASE}/auth/root`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const rootCid = rootRes.data.rootCid;
                console.log("Filesystem: Root CID fetched:", rootCid);

                if (!rootCid) {
                    console.log("Filesystem: No Root CID (New User)");
                    setIsLoading(false);
                    return; //new user empty file
                }

                console.log("Filesystem: Fetching block from:", `${API_BASE}/block/${rootCid}`);
                const blockRes = await axios.get(`${API_BASE}/block/${rootCid}`, {
                    responseType: `arraybuffer`//this was causing a bug
                })
                console.log("Filesystem: Block fetched, size:", blockRes.data.byteLength);

                const encryptedData = new Uint8Array(blockRes.data);

                const key = AuthService.getMasterKey();
                if (!key) {
                    console.error("Filesystem: Missing Master Key during load");
                    router.push('/login');
                    return;
                }

                console.log("Filesystem: Decrypting with key...");
                const decryptedJsonBytes = await CryptoLib.decrypt(encryptedData, key);
                console.log("Filesystem: Decrypted bytes:", decryptedJsonBytes.length);

                const nodes = FileSystem.deserialize(decryptedJsonBytes) as FileNode[];
                // console.log("Filesystem: Deserialized nodes:", nodes); // Security: Don't log full nodes
                // console.log("Filesystem: Deserialized nodes:", nodes); // Security: Don't log full nodes

                setFiles(nodes);
            } catch (e) {
                console.error("Filesystem: Load Failed", e);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [])

    // Removed LocalStorage caching for security. Files should only persist in encrypted blocks.
    // useEffect(() => {
    //     if (!isLoading) {
    //         localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    //     }
    // }, [files, isLoading]);

    const addFile = useCallback(async (node: FileNode) => {
        const newFiles = [node, ...files]
        setFiles(newFiles);

        try {
            const key = AuthService.getMasterKey();
            if (!key) {
                console.error("Cannot save missing master key please relogin");
                return;
            }

            const jsonBytes = FileSystem.serialize(newFiles as any);

            const encryptedData = await CryptoLib.encrypt(jsonBytes, key);

            const uploadRes = await axios.post(`${API_BASE}/block`, encryptedData, {
                headers: { 'Content-Type': 'application/octet-stream' }
            });

            const newCid = uploadRes.data.cid;

            const token = localStorage.getItem('haven_token');
            await axios.put(`${API_BASE}/auth/root`, { rootCid: newCid }, { headers: { Authorization: `Bearer ${token}` } });

            console.log('Root Updated', newCid);
        } catch (e) {
            console.error("Failed to save persistence.");
        }
    }, [files]);

    const deleteFile = async (fileToDelete: FileNode) => {
        if (!confirm(`Are you sure you want to delete ${fileToDelete.name}. Once delted It CANNOT be recovered`)) return;

        setIsLoading(true);

        try {
            const newFile = files.filter(f => f.name !== fileToDelete.name);

            const key = AuthService.getMasterKey();
            if (!key) {
                router.push('/login');
                return;
            }

            const jsonBytes = FileSystem.serialize(newFile as any);
            const encryptionData = await CryptoLib.encrypt(jsonBytes, key);

            const uploadRes = await axios.post(`${API_BASE}/block`, encryptionData, {
                headers: { 'Content-Type': 'application/octet-stream' }
            });
            const newRootCid = uploadRes.data.cid;

            const token = localStorage.getItem('haven_token');
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE}/auth/root`, { rootCid: newRootCid }, authConfig);

            if (fileToDelete.chunks && fileToDelete.chunks.length > 0) {
                await axios.post(`${API_BASE}/trash`, fileToDelete.chunks, authConfig);
                console.log("files sent to trash");
            }
            setFiles(newFile);
            console.log("deleted", fileToDelete.name);
        } catch (e) {
            console.error("deletion failed", e);
        } finally {
            setIsLoading(false);
        }

    }

    return { files, addFile, isLoading, deleteFile };
}