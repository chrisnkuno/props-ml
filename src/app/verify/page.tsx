"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft, Cpu, Box, Hash, Terminal, AlertCircle } from "lucide-react";
import { verifyAttestation, type InferenceResult, type VerifyResponse } from "@/lib/api";

function readStoredResult(): InferenceResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const data = window.sessionStorage.getItem("inference_result");
    return data ? (JSON.parse(data) as InferenceResult) : null;
  } catch {
    return null;
  }
}

export default function VerifyPage() {
  const [storedResult] = useState<InferenceResult | null>(() => readStoredResult());
  const [quote, setQuote] = useState(() => readStoredResult()?.attestation ?? "");
  const [reportData, setReportData] = useState(() => readStoredResult()?.report_data ?? "");
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [verification, setVerification] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canVerify = Boolean(
    quote.trim() &&
      reportData.trim() &&
      storedResult?.policy_id &&
      storedResult?.model_version &&
      storedResult?.source_identity &&
      storedResult?.verification_bundle.file_hash &&
      storedResult?.verification_bundle.result_hash,
  );
  const resultStateLabel = useMemo(() => {
    if (!storedResult) {
      return "bundle.missing";
    }
    if (storedResult.processing_mode === "tee-attested") {
      return "bundle.ready";
    }
    return "bundle.partial";
  }, [storedResult]);

  const handleVerify = async () => {
    if (!storedResult || !canVerify) {
      setStatus("error");
      setError("Verification requires a stored upload result with report data and binding fields.");
      return;
    }

    setVerifying(true);
    setStatus("idle");
    setError(null);
    setVerification(null);

    try {
      const result = await verifyAttestation({
        quote: quote.trim() || undefined,
        report_data: reportData.trim(),
        policy_id: storedResult.policy_id,
        model_version: storedResult.model_version,
        source_identity: storedResult.source_identity,
        file_hash: storedResult.verification_bundle.file_hash,
        result_hash: storedResult.verification_bundle.result_hash,
      });

      setVerification(result);
      setStatus(result.status === "failed" ? "error" : "success");
      if (result.status === "failed") {
        setError("Verification failed.");
      }
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setVerifying(false);
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
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 mb-1">Module</div>
          <div className="text-xs font-normal lowercase tracking-tighter">{resultStateLabel}</div>
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
              Submit the backend quote and optional report data to the API verifier. This view reports the backend
              checks instead of inventing a success state.
            </p>
            
            <div className="space-y-6 pt-8 border-t border-zinc-50">
              <VerificationStep 
                icon={<Cpu className="h-3 w-3" />}
                title="Hardware" 
                desc={storedResult?.processing_mode === "tee-attested" ? "Quote captured from backend" : "Hardware proof may be absent"} 
              />
              <VerificationStep 
                icon={<Box className="h-3 w-3" />}
                title="Isolation" 
                desc="Backend attestation metadata" 
              />
              <VerificationStep 
                icon={<Hash className="h-3 w-3" />}
                title="Provenance" 
                desc="Report-data binding check" 
              />
              <VerificationStep 
                icon={<Terminal className="h-3 w-3" />}
                title="Policy" 
                desc="Compose metadata from backend verifier" 
              />
            </div>
          </header>

          <div className="flex flex-col gap-12">
            <div className="relative group">
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Paste attestation quote (hex)..."
                className="w-full h-64 bg-zinc-50/50 rounded-[40px] border border-zinc-100 p-12 pb-28 font-mono text-[10px] leading-relaxed text-black placeholder:text-zinc-300 focus:outline-none focus:border-zinc-200 transition-all duration-700 resize-none scrollbar-hide"
              />
              <div className="absolute bottom-12 right-12 flex gap-4">
                <button
                  onClick={handleVerify}
                  disabled={!canVerify || verifying}
                  className="flex items-center gap-8 group hover:gap-12 transition-all duration-500 disabled:opacity-20"
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.5em]">
                    {verifying ? "Verifying_Evidence..." : "Verify_Backend_Evidence"}
                  </span>
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin opacity-40" /> : <div className="h-2 w-2 rounded-full bg-black"></div>}
                </button>
              </div>
            </div>

            <div className="rounded-[40px] border border-zinc-100 bg-white p-10">
              <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.4em] opacity-40">Optional Report Data</div>
              <textarea
                value={reportData}
                onChange={(e) => setReportData(e.target.value)}
                placeholder="Paste expected report_data to check quote binding..."
                className="h-28 w-full resize-none border-none bg-transparent font-mono text-[10px] leading-relaxed text-black placeholder:text-zinc-300 focus:outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-red-500">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}

            {!storedResult && (
              <div className="rounded-[40px] border border-zinc-100 bg-zinc-50/50 p-10 text-sm leading-relaxed text-zinc-500">
                This verifier needs the upload bundle stored in the browser session. Run an upload first, then reopen
                this page to verify the exact report-data binding.
              </div>
            )}

            {verification && (
              <div className="p-12 border border-zinc-100 rounded-[40px] flex flex-col sm:flex-row items-start gap-12 group hover:border-zinc-200 transition-all duration-1000">
                <div className="flex-1">
                  <div
                    className={`flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.4em] mb-6 ${
                      status === "success" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {status === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {status === "success" ? "Evidence Verified" : "Evidence Rejected"}
                  </div>
                  <p className="text-lg font-normal tracking-tighter leading-relaxed">
                    The backend evaluated <span className="font-mono text-xs opacity-40">quote format</span>,
                    <span className="font-mono text-xs opacity-40"> report-data binding</span>, and
                    <span className="font-mono text-xs opacity-40"> compose manifest pinning</span> for this bundle.
                  </p>
                  {verification.warnings.length > 0 && (
                    <div className="mt-6 space-y-2 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600">
                      {verification.warnings.map((warning) => (
                        <div key={warning}>{warning}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 text-right text-[10px] font-mono lowercase opacity-60">
                  <EvidenceRow label="quote_valid" value={verification.checks.quote_format_valid ? "true" : "false"} />
                  <EvidenceRow
                    label="report_data"
                    value={verification.checks.report_data_matches_binding ? "matched" : "mismatch"}
                  />
                  <EvidenceRow label="compose_hash" value={verification.checks.compose_hash} />
                  <EvidenceRow
                    label="hardware"
                    value={
                      verification.checks.hardware_quote_verified === null
                        ? "not verified"
                        : verification.checks.hardware_quote_verified
                          ? "verified"
                          : "failed"
                    }
                  />
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

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px,1fr] gap-4 text-right">
      <div className="opacity-20 uppercase tracking-[0.3em]">{label}</div>
      <div>{value}</div>
    </div>
  );
}
