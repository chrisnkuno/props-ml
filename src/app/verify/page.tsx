"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft, Cpu, Box, Hash, Terminal } from "lucide-react";

export default function VerifyPage() {
  const [quote, setQuote] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleVerify = async () => {
    if (!quote) return;
    setVerifying(true);
    setStatus("idle");
    
    // Simulate verification steps
    await new Promise(r => setTimeout(r, 2400));
    
    setVerifying(false);
    setStatus("success");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans font-extralight tracking-tight">
      <nav className="p-8 flex justify-between items-start z-40">
        <Link href="/" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
          <ArrowLeft className="h-3 w-3" />
          Back.Index
        </Link>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 mb-1">Module</div>
          <div className="text-xs font-normal lowercase tracking-tighter">verifier.v1</div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-24 pb-32 px-8 sm:px-16 lg:px-32">
        <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-24 items-start">
          <header className="max-w-xs">
            <h1 className="text-5xl font-thin leading-[1.1] mb-8 text-black">
              Verifier <br />
              Portal.
            </h1>
            <p className="text-sm text-zinc-400 font-extralight leading-relaxed mb-12">
              Verify that your data was processed in a genuine Intel TDX environment using the immutable dStack configuration.
            </p>
            
            <div className="space-y-6 pt-8 border-t border-zinc-50">
              <VerificationStep 
                icon={<Cpu className="h-3 w-3" />}
                title="Hardware" 
                desc="Intel Rooted Trust" 
              />
              <VerificationStep 
                icon={<Box className="h-3 w-3" />}
                title="Isolation" 
                desc="CVM Integrity" 
              />
              <VerificationStep 
                icon={<Hash className="h-3 w-3" />}
                title="Code" 
                desc="Compose-Hash Match" 
              />
            </div>
          </header>

          <div className="flex flex-col gap-12">
            <div className="relative group">
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Paste TDX Remote Attestation Quote..."
                className="w-full h-64 bg-zinc-50/50 rounded-[40px] border border-zinc-100 p-12 font-mono text-[10px] leading-relaxed text-black placeholder:text-zinc-300 focus:outline-none focus:border-zinc-200 transition-all duration-700 resize-none scrollbar-hide"
              />
              <div className="absolute bottom-12 right-12 flex gap-4">
                <button
                  onClick={handleVerify}
                  disabled={!quote || verifying}
                  className="flex items-center gap-8 group hover:gap-12 transition-all duration-500 disabled:opacity-20"
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.5em]">
                    {verifying ? "Executing_Validation..." : "Verify_Integrity"}
                  </span>
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin opacity-40" /> : <div className="h-2 w-2 rounded-full bg-black"></div>}
                </button>
              </div>
            </div>

            {status === "success" && (
              <div className="p-12 border border-zinc-100 rounded-[40px] flex flex-col sm:flex-row items-start gap-12 group hover:border-zinc-200 transition-all duration-1000">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-green-600 uppercase tracking-[0.4em] mb-6">
                    <CheckCircle2 className="h-3 w-3" />
                    Validation Successful
                  </div>
                  <p className="text-lg font-normal tracking-tighter leading-relaxed">
                    The provided quote matches a genuine Intel TDX hardware measurement. 
                    The `compose-hash` confirms the exact Docker configuration from [app-compose.json].
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 text-right">
                  <div className="text-[10px] font-mono opacity-20 uppercase tracking-[0.3em]">Signature</div>
                  <div className="text-[10px] font-mono lowercase opacity-60">verified_rsa_3072</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="p-8 border-t border-zinc-50 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
        <div>Offline Verification Tool v1.2</div>
        <div className="flex gap-8">
          <span>GitHub</span>
          <span>Trust Center</span>
        </div>
      </footer>
    </div>
  );
}

function VerificationStep({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="p-2 rounded-lg border border-zinc-50 group-hover:border-zinc-100 transition-colors">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-normal uppercase tracking-widest">{title}</span>
        <span className="text-[10px] font-mono opacity-30 lowercase">{desc}</span>
      </div>
    </div>
  );
}
