"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { getInfo, uploadDocument, type AppInfo } from "@/lib/api";
import Link from "next/link";

const SUPPORTED_EXTENSIONS = [".pdf", ".json", ".txt"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void getInfo()
      .then((info) => {
        if (!cancelled) {
          setAppInfo(info);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAppInfo(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const nextFile = e.target.files[0];
      const lowerName = nextFile.name.toLowerCase();
      const supported = SUPPORTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));

      if (!supported) {
        setFile(null);
        setError(`Unsupported file type. Use ${SUPPORTED_EXTENSIONS.join(", ")}.`);
        return;
      }

      if (nextFile.size > MAX_FILE_SIZE_BYTES) {
        setFile(null);
        setError("File exceeds the 10 MB client-side upload limit.");
        return;
      }

      setFile(nextFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await uploadDocument(file);
      sessionStorage.setItem("inference_result", JSON.stringify(result));
      router.push("/result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans font-extralight tracking-tight">
      <nav className="p-8 flex justify-between items-start z-40">
        <Link href="/" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
          <ArrowLeft className="h-3 w-3" />
          Back.Index
        </Link>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 mb-1">Status</div>
          <div className="text-xs font-normal lowercase tracking-tighter">
            {appInfo ? (appInfo.tee_enabled ? "attestation.available" : "local.mode") : "backend.unknown"}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-24 pb-32 px-8 sm:px-16 lg:px-32">
        <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-24 items-start">
          <header className="max-w-xs">
            <h1 className="text-5xl font-thin leading-[1.1] mb-8">
              Data <br />
              Ingestion.
            </h1>
            <p className="text-sm text-zinc-400 font-extralight leading-relaxed mb-12">
              Submit documents to the configured backend for parsing and scoring. Attestation is returned only when
              the API is running with dStack-backed TEE support.
            </p>
            
            <div className="space-y-4 pt-8 border-t border-zinc-50">
              <Requirement item="Client-side type and size checks before upload" />
              <Requirement item="Backend response includes quote and report data when available" />
              <Requirement item={appInfo?.tee_enabled ? "TEE mode reported by backend" : "Backend may be running without TEE"} />
            </div>
          </header>

          <div className="relative">
            <div 
              className={`group relative flex w-full flex-col items-center justify-center rounded-[40px] border border-zinc-100 bg-white p-24 transition-all duration-700 ${
                file ? 'bg-zinc-50/50' : 'hover:bg-zinc-50/20'
              }`}
            >
              <input
                type="file"
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                onChange={handleFileChange}
                accept=".pdf,.json,.txt"
              />
              
              <div className="flex flex-col items-center text-center max-w-sm">
                {file ? (
                  <>
                    <div className="mb-8 p-6 rounded-full border border-zinc-200">
                      <File className="h-8 w-8 stroke-[1px]" />
                    </div>
                    <p className="text-lg font-normal mb-2 tracking-tighter">{file.name}</p>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      Confirmed / {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-8 p-12 rounded-full border border-zinc-50 group-hover:bg-white transition-all duration-700">
                      <Upload className="h-8 w-8 stroke-[1px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    </div>
                    <p className="text-sm font-normal mb-1 self-start tracking-wider uppercase opacity-40">Drag document</p>
                    <p className="text-xs text-zinc-400 font-extralight leading-relaxed text-left">
                      Files are posted to the backend API over the browser connection. Verification happens after the
                      backend returns its evidence.
                    </p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-8 flex items-center gap-3 text-xs font-mono text-red-500 uppercase tracking-widest">
                <AlertCircle className="h-3 w-3" />
                Error: {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="mt-12 flex items-center gap-8 group hover:gap-12 transition-all duration-500 disabled:opacity-20"
            >
              <div className="h-2 w-2 rounded-full bg-black"></div>
              <span className="text-sm font-mono uppercase tracking-[0.5em]">
                {loading ? "Processing_Document..." : "Execute_Inference"}
              </span>
              {loading && <Loader2 className="h-4 w-4 animate-spin opacity-40" />}
            </button>
          </div>
        </div>
      </main>

      <footer className="p-8 flex justify-end">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-20">
          API.UPLOAD / EVIDENCE.READY
        </div>
      </footer>
    </div>
  );
}

function Requirement({ item }: { item: string }) {
  return (
    <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest opacity-40">
      <div className="h-px w-3 bg-zinc-300"></div>
      {item}
    </div>
  );
}
