"use client";

import { UploadDropzone } from "@/components/uploadDropzone";
import { useFileBrowser } from "@/hooks/useFileBrowser";
import { useFileDownload } from "@/hooks/userFileDownload";
import { useFileUpload } from "@/hooks/userFileUpload";
import {
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Music,
  Lock,
  Plus,
  File,
  DownloadIcon,
  Trash2,
} from "lucide-react";

export default function VaultPage() {
  const { files, addFile, deleteFile } = useFileBrowser();
  const { uploadFile, uploads, isProcessing } = useFileUpload();
  /* Removed LogOut and useAuth imports */
  const { downloadFile, isDownloading } = useFileDownload();

  const handleUpload = async (file: File) => {
    const node = await uploadFile(file);
    if (node) {
      addFile(node);
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
            My Files
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Main Vault</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="text-blue-400 font-medium">
              Everything Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files.map((file, idx) => (
          <FileCard
            key={idx}
            file={file}
            onDownload={() => downloadFile(file)}
            onDelete={() => deleteFile(file)}
          />
        ))}
        <UploadDropzone onUpload={handleUpload} isProcessing={isProcessing} />
      </div>
    </div>
  );
}

function FileCard({ file, onDownload, onDelete }: { file: any; onDownload: () => void; onDelete: () => void }) {
  return (
    <div
      className="group h-65 bg-linear-to-b from-slate-900/80 to-slate-950/80 border border-white/5 hover:border-blue-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 relative backdrop-blur-md hover:cursor-pointer"
      onClick={onDownload}
    >
      {/* Thumbnail */}
      <div className="h-40 bg-linear-to-br from-slate-800/30 to-slate-900/30 relative flex items-center justify-center group-hover:from-slate-800/50 group-hover:to-slate-900/50 transition-all duration-500 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative z-10 p-5 rounded-2xl bg-black/20 group-hover:bg-black/40 group-hover:scale-110 transition-all duration-500 border border-white/5 group-hover:border-white/10 shadow-lg backdrop-blur-sm">
          <FileIcon
            type={file.type}
            className="w-10 h-10 text-gray-400 group-hover:text-blue-400 transition-colors"
          />
        </div>

        {/*Badge */}
        {file.encrypted && (
          <div className="absolute top-3 right-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-[8px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-lg transform -translate-y-0.5 opacity-90">
            <Lock size={8} strokeWidth={3} />
            <span>SECURED</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-200 truncate group-hover:text-blue-400 transition-colors leading-relaxed">
              {file.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                {file.type}
              </span>
              <span className="text-xs text-gray-500">{file.size}</span>
            </div>
          </div>

          <button className="text-gray-600 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors -mr-2">
            <MoreVertical size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FileIcon({ type, className }: { type: string; className?: string }) {
  if (type === "image")
    return <ImageIcon className={className} strokeWidth={1.5} />;
  if (type === "audio")
    return <Music className={className} strokeWidth={1.5} />;
  if (type === "pdf")
    return <FileText className={className} strokeWidth={1.5} />;
  return <File className={className} strokeWidth={1.5} />;
}
