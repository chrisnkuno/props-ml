"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, FileCheck, Copy, Check, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InferenceResult } from "@/lib/api";

export default function ResultPage() {
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("inference_result");
    if (!stored) {
      router.push("/upload");
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  const copyAttestation = () => {
    if (result?.attestation) {
      navigator.clipboard.writeText(result.attestation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) return null;

  return (
    <div className="flex min-h-screen flex-col items-center bg-white font-sans text-zinc-900">
      <main className="flex w-full max-w-3xl flex-col px-6 py-24">
        <Link 
          href="/upload" 
          className="mb-12 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Link>

        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-light tracking-tight">Inference Complete</h1>
            <p className="text-zinc-500">Result generated inside TDX enclave.</p>
          </div>
        </div>

        <section className="mb-12 rounded-3xl border border-zinc-100 bg-zinc-50/50 p-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-400">Model Output</h2>
          <div className="text-xl font-light leading-relaxed text-zinc-800">
            {result.result}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-zinc-900" />
              <h2 className="font-medium">Hardware Attestation</h2>
            </div>
            <Link 
              href="/verify" 
              className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800"
            >
              Open Verifier <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="mb-4 space-y-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Report Data Binding</p>
              <code className="block rounded-lg bg-zinc-50 p-3 text-xs font-mono text-zinc-600 break-all border border-zinc-100">
                {result.report_data || "N/A"}
              </code>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">TDX Quote (Hex)</p>
                <button 
                  onClick={copyAttestation}
                  className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto rounded-lg bg-zinc-50 p-3 text-[10px] font-mono text-zinc-400 break-all leading-relaxed border border-zinc-100">
                {result.attestation || "Attestation not available in simulation mode."}
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-zinc-400">
            This quote cryptographically binds the model result to the specific Intel TDX hardware measurement.
            You can verify this payload in the verifier portal or using the off-chain CLI.
          </p>
        </section>
      </main>
    </div>
  );
}
