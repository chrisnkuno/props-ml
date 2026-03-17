"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, Loader2, AlertCircle } from "lucide-react";
import { uploadDocument } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await uploadDocument(file);
      // Store result in session storage for the results page
      sessionStorage.setItem("inference_result", JSON.stringify(result));
      router.push("/result");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white font-sans text-zinc-900">
      <main className="flex w-full max-w-2xl flex-col items-center px-6 py-24">
        <h1 className="mb-2 text-3xl font-light tracking-tight">Upload Document</h1>
        <p className="mb-12 text-zinc-500">Securely process your sensitive files inside a TEE.</p>

        <div 
          className={`group relative flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 transition-all ${
            file ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <input
            type="file"
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            onChange={handleFileChange}
            accept=".pdf,.json,.txt"
          />
          
          <div className="flex flex-col items-center text-center">
            {file ? (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                  <File className="h-8 w-8" />
                </div>
                <p className="mb-1 font-medium text-zinc-900">{file.name}</p>
                <p className="text-xs text-zinc-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-500 transition-colors">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="mb-1 font-medium text-zinc-900">Drop your file here</p>
                <p className="text-sm text-zinc-500 text-zinc-400">PDF, JSON or TXT up to 10MB</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-12 flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-4 text-white transition-all hover:bg-zinc-800 disabled:opacity-30"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          <span className="font-medium">{loading ? "Processing..." : "Run Private Inference"}</span>
        </button>
      </main>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
