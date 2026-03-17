"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, ArrowLeft, Terminal, CornerDownRight } from "lucide-react";

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("inference_result");
    if (data) {
      setResult(JSON.parse(data));
    }
  }, []);

  const copyQuote = () => {
    if (result?.attestation) {
      navigator.clipboard.writeText(result.attestation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans font-extralight tracking-tight">
        <div className="text-[10px] font-mono uppercase tracking-[0.5em] animate-pulse">Retrieving_Data...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans font-extralight tracking-tight">
      <nav className="p-8 flex justify-between items-start z-40">
        <Link href="/upload" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
          <ArrowLeft className="h-3 w-3" />
          Back.Ingest
        </Link>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 mb-1">Receipt</div>
          <div className="text-xs font-mono lowercase tracking-tighter text-blue-600 font-normal">{result.contribution_receipt}</div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-24 pb-32 px-8 sm:px-16 lg:px-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-24 items-start">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-green-600 uppercase tracking-[0.3em] mb-8">
              <CheckCircle2 className="h-3 w-3" />
              Verifiable Pipeline Complete
            </div>
            
            <h1 className="text-6xl font-thin leading-[1.1] mb-12">
              Pipeline <br />
              <span className="italic font-light">Outcome</span>.
            </h1>

            <div className="p-12 border border-zinc-100 rounded-[40px] bg-white group hover:border-zinc-200 transition-colors duration-500 mb-16">
              <p className="text-2xl font-normal leading-relaxed tracking-tight text-zinc-800">
                {result.result}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 border-t border-zinc-50 pt-16">
              <Stat label="Source Identity" value={result.source_identity} />
              <Stat label="Release Policy" value={result.policy_id} />
              <Stat label="Model ID" value="Scoring.v2.PROPS" />
              <Stat label="Compute Hardware" value="Intel TDX / CVM" />
            </div>
          </div>

          <aside className="lg:sticky lg:top-32 space-y-12">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-40">
                  <Terminal className="h-3 w-3" />
                  Full Attestation Quote
                </div>
                <button 
                  onClick={copyQuote}
                  className="text-[10px] font-mono uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  {copied ? "Copied" : "Copy Hex"}
                </button>
              </div>
              
              <div className="bg-zinc-50/50 p-8 rounded-[30px] border border-zinc-100 relative overflow-hidden group">
                <div className="font-mono text-[9px] leading-relaxed break-all opacity-40 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                  {result.attestation}
                </div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-zinc-50/80 via-transparent to-transparent opacity-100"></div>
              </div>
            </div>

            <div className="p-8 border-l border-zinc-100 flex flex-col gap-6">
              <p className="text-xs text-zinc-400 leading-relaxed font-extralight uppercase tracking-widest">
                Verification Binding: <br />
                <span className="font-mono text-[9px] lowercase opacity-60">policy + source + model + result</span>
              </p>
              <Link
                href="/verify"
                className="inline-flex items-center gap-6 group hover:gap-10 transition-all duration-500"
              >
                <div className="h-px w-8 bg-black group-hover:w-16 transition-all duration-500"></div>
                <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Execute Proof Chain</span>
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-30">{label}</div>
      <div className="text-sm font-normal tracking-tight uppercase">{value}</div>
    </div>
  );
}
