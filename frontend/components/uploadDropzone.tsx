'use-client'

import { Loader2, Plus } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface DropZoneProps{
    onUpload(file: File): void;
    isProcessing: boolean;
}


export function UploadDropzone({onUpload, isProcessing}: DropZoneProps){
    const onDrop = useCallback((acceptedFiles: File[]) =>{
        if(acceptedFiles.length > 0){
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        disabled: isProcessing
    })


    return(
        <div {...getRootProps} className={`h-65 border-2 border-dashed rounded-2xl flex flex-col flex-center justify-center transition-all group relative overflow-hidden cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-white/5 text-gray-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/50'}`}>
            <input {...getInputProps} />
            <div className={`absolute inset-0 bg-linear-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 transition-all duration-500 ${isDragActive ? 'from-blue-500/10' : 'group-hover:from-blue-500/5'}`}>{/*Did AI hallucinate here?? from blue to blue via blue huh??*/}
                <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all border ${isDragActive ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] scale-110' 
                        : 'bg-white/5 border-white/5 group-hover:bg-blue-500/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:border-blue-500/30'}`}>
                                {isProcessing?(
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-400"/>
                                ) : (
                                    <Plus className="w-8 h-8" strokeWidth={2}/>
                                )}
                    </div>

                    <span className="text-xs text-gray-600 mt-1">
                        {isProcessing ? 'Please wait' : 'or drag and drop'}
                    </span>
                </div>
            </div>
        </div>
    );
}