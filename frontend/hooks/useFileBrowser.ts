import { FileNode } from "@/lib/filesystem";
import { useCallback, useEffect, useState } from "react";


const STORAGE_KEY = "haven_files_v1";

export function useFileBrowser() {
    const [files, setFiles] = useState<FileNode[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setFiles(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to save files", e);
            }
        }
        setIsLoading(false);
    }, [])

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
        }
    }, [files, isLoading]);

    const addFile = useCallback((node: FileNode) => {
        setFiles(prev => [node, ...prev])
    }, [])

    return { files, addFile, isLoading };
}