import { CryptoLib } from "./crypto";

export interface FileNode{
    type: 'file';
    name: string;
    size: number;
    mimeType: string;
    key: string;
    chunks: Array<string>;
}

export interface DirectoryNode{
    type: 'directory';
    name: string;
    items: Record<string, string>; //filename -> CID of the fileNode
}

export class FileSystem{
    static createFileNode(name: string, size: number, type: string, chunks: string[], key: Uint8Array): FileNode{
        return {
            type: 'file',
            name: name,
            size: size,
            mimeType: type,
            key : CryptoLib.Utils.ToHex(key),
            chunks: chunks
        };
    }

    static createDirectory(name: string){
        return {
            type: 'directory',
            name: name,
            items: {}
        };
    }

    static serialize(data: FileNode | DirectoryNode): Uint8Array{
        const json = JSON.stringify(data);
        return new TextEncoder().encode(json)
        
    }

    static deserialize(data: Uint8Array): FileNode | DirectoryNode{
        const decoder = new TextDecoder('utf-8');
        const decodedResult=  decoder.decode(data);
        const jsonObject = JSON.parse(decodedResult);


        return jsonObject;
    }
}