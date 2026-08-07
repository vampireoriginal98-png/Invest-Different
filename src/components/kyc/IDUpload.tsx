import React, { useState } from "react";
import { Upload, FileCheck, Image as ImageIcon, X } from "lucide-react";

interface IDUploadProps {
  onUpload: (base64OrFile: string) => void;
  existingUrl?: string | null;
}

export function IDUpload({ onUpload, existingUrl }: IDUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setPreview(null);
    onUpload("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-200">
        1. Government-Issued ID / Passport / Driver's License
      </label>
      <p className="text-xs text-slate-400">
        Upload a clear scan or photo showing your full name, photo, and expiry date.
      </p>

      {preview ? (
        <div className="relative rounded-2xl border border-amber-500/30 overflow-hidden bg-slate-950 p-2">
          <img src={preview} alt="ID Document" className="w-full h-48 object-cover rounded-xl" />
          <button
            onClick={removeFile}
            className="absolute top-4 right-4 rounded-full bg-slate-950/80 p-1.5 text-rose-400 hover:bg-rose-500 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 p-2 text-xs text-emerald-400 font-medium">
            <FileCheck className="w-4 h-4" />
            <span>ID Document Attached</span>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/60 hover:bg-slate-900/60 transition cursor-pointer p-6 text-center">
          <div className="p-3 rounded-full bg-slate-900 border border-slate-800 mb-2">
            <Upload className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-sm font-medium text-slate-200">Click to upload ID photo</span>
          <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      )}
    </div>
  );
}
