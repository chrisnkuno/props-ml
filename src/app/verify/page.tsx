"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Box,
  Hash,
  Loader2,
  Terminal,
} from "lucide-react";
import { verifyAttestation, type InferenceResult, type VerifyResponse } from "@/lib/api";

interface EvidenceBundleInput {
  quote?: string | null;
  report_data?: string | null;
  policy_id?: string;
  model_version?: string;
  source_identity?: string;
  file_hash?: string;
  result_hash?: string;
  signature?: string | null;
}

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

function bundleFromResult(result: InferenceResult): EvidenceBundleInput {
  return {
    quote: result.attestation,
    report_data: result.report_data,
    policy_id: result.policy_id,
    model_version: result.model_version,
    source_identity: result.source_identity,
    file_hash: result.verification_bundle.file_hash,
    result_hash: result.verification_bundle.result_hash,
    signature: result.verification_bundle.signature,
  };
}

export default function VerifyPage() {
  const initialResult = readStoredResult();
  const initialBundle = initialResult ? bundleFromResult(initialResult) : null;
  const [evidenceBundle, setEvidenceBundle] = useState<EvidenceBundleInput | null>(initialBundle);
  const [bundleText, setBundleText] = useState(
    initialBundle ? JSON.stringify(initialBundle, null, 2) : "",
  );
  const [quote, setQuote] = useState(initialBundle?.quote ?? "");
  const [reportData, setReportData] = useState(initialBundle?.report_data ?? "");
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<"idle" | "verified" | "partial" | "error">("idle");
  const [verification, setVerification] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canVerify = Boolean(
    reportData.trim() &&
      evidenceBundle?.policy_id &&
      evidenceBundle?.model_version &&
      evidenceBundle?.source_identity &&
      evidenceBundle?.file_hash &&
      evidenceBundle?.result_hash,
  );

  const bundleStateLabel = useMemo(() => {
    if (!evidenceBundle) {
      return "bundle.missing";
    }
    if (evidenceBundle.signature) {
      return "bundle.signed";
    }
    return "bundle.loaded";
  }, [evidenceBundle]);

  const applyBundle = (bundle: EvidenceBundleInput) => {
    setEvidenceBundle(bundle);
    setQuote(bundle.quote ?? "");
    setReportData(bundle.report_data ?? "");
    setBundleText(JSON.stringify(bundle, null, 2));
  };

  const importBundle = () => {
    try {
      const parsed = JSON.parse(bundleText) as EvidenceBundleInput;
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !parsed.policy_id ||
        !parsed.model_version ||
        !parsed.source_identity ||
        !parsed.file_hash ||
        !parsed.result_hash
      ) {
        throw new Error("Evidence bundle is missing one or more required fields.");
      }

      applyBundle(parsed);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to parse evidence bundle.");
      setStatus("error");
    }
  };

  const handleVerify = async () => {
    if (!evidenceBundle || !canVerify) {
      setStatus("error");
      setError("Verification requires an uploaded or imported evidence bundle.");
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
        policy_id: evidenceBundle.policy_id ?? "",
        model_version: evidenceBundle.model_version ?? "",
        source_identity: evidenceBundle.source_identity ?? "",
        file_hash: evidenceBundle.file_hash ?? "",
        result_hash: evidenceBundle.result_hash ?? "",
        signature: evidenceBundle.signature ?? undefined,
      });

      setVerification(result);
      if (result.status === "verified") {
        setStatus("verified");
      } else if (result.status === "partial") {
        setStatus("partial");
      } else {
        setStatus("error");
        setError(result.reason ?? "Verification failed.");
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
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="h-3 w-3" />
          Back.Index
        </Link>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 mb-1">Module</div>
          <div className="text-xs font-normal lowercase tracking-tighter">{bundleStateLabel}</div>
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
              Verify an exported evidence bundle from the result page. This reports bundle integrity and attestation
              consistency; it does not claim genuine hardware verification inside this app.
            </p>

            <div className="space-y-6 pt-8 border-t border-zinc-50">
              <VerificationStep
                icon={<Cpu className="h-3 w-3" />}
                title="Hardware"
                desc="Quote format only unless official verifier is wired in"
              />
              <VerificationStep
                icon={<Box className="h-3 w-3" />}
                title="Integrity"
                desc="Optional HMAC evidence signature"
              />
              <VerificationStep
                icon={<Hash className="h-3 w-3" />}
                title="Binding"
                desc="Report-data recomputation from bundle fields"
              />
              <VerificationStep
                icon={<Terminal className="h-3 w-3" />}
                title="Policy"
                desc="Server-side manifest pinning checks"
              />
            </div>
          </header>

          <div className="flex flex-col gap-12">
            <div className="rounded-[40px] border border-zinc-100 bg-white p-10">
              <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.4em] opacity-40">
                Evidence Bundle JSON
              </div>
              <textarea
                value={bundleText}
                onChange={(e) => setBundleText(e.target.value)}
                placeholder="Paste an exported evidence bundle JSON..."
                className="h-52 w-full resize-none border-none bg-transparent font-mono text-[10px] leading-relaxed text-black placeholder:text-zinc-300 focus:outline-none"
              />
              <button
                onClick={importBundle}
                className="mt-6 text-[10px] font-mono uppercase tracking-[0.4em] opacity-60 transition-opacity hover:opacity-100"
              >
                Import_Evidence_Bundle
              </button>
            </div>

            <div className="relative group">
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Paste attestation quote hex if available..."
                className="w-full h-64 bg-zinc-50/50 rounded-[40px] border border-zinc-100 p-12 pb-28 font-mono text-[10px] leading-relaxed text-black placeholder:text-zinc-300 focus:outline-none focus:border-zinc-200 transition-all duration-700 resize-none scrollbar-hide"
              />
              <div className="absolute bottom-12 right-12 flex gap-4">
                <button
                  onClick={handleVerify}
                  disabled={!canVerify || verifying}
                  className="flex items-center gap-8 group hover:gap-12 transition-all duration-500 disabled:opacity-20"
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.5em]">
                    {verifying ? "Verifying_Evidence..." : "Verify_Evidence_Bundle"}
                  </span>
                  {verifying ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-40" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-black"></div>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-[40px] border border-zinc-100 bg-white p-10">
              <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.4em] opacity-40">Report Data</div>
              <textarea
                value={reportData}
                onChange={(e) => setReportData(e.target.value)}
                placeholder="Paste expected report_data to check bundle binding..."
                className="h-28 w-full resize-none border-none bg-transparent font-mono text-[10px] leading-relaxed text-black placeholder:text-zinc-300 focus:outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-red-500">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}

            {!evidenceBundle && (
              <div className="rounded-[40px] border border-zinc-100 bg-zinc-50/50 p-10 text-sm leading-relaxed text-zinc-500">
                Import an exported evidence bundle to verify without relying on session storage.
              </div>
            )}

            {verification && (
              <div className="p-12 border border-zinc-100 rounded-[40px] flex flex-col sm:flex-row items-start gap-12 group hover:border-zinc-200 transition-all duration-1000">
                <div className="flex-1">
                  <div
                    className={`flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.4em] mb-6 ${
                      status === "verified"
                        ? "text-green-600"
                        : status === "partial"
                          ? "text-amber-600"
                          : "text-red-500"
                    }`}
                  >
                    {status === "verified" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {status === "verified"
                      ? "Evidence Verified"
                      : status === "partial"
                        ? "Evidence Partially Verified"
                        : "Evidence Rejected"}
                  </div>
                  <p className="text-lg font-normal tracking-tighter leading-relaxed">
                    The backend evaluated <span className="font-mono text-xs opacity-40">bundle signature</span>,
                    <span className="font-mono text-xs opacity-40"> report-data binding</span>, and
                    <span className="font-mono text-xs opacity-40"> compose manifest pinning</span>.
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
                  <EvidenceRow
                    label="quote_format"
                    value={verification.checks.quote_format_valid ? "valid" : "invalid"}
                  />
                  <EvidenceRow
                    label="report_data"
                    value={
                      verification.checks.report_data_matches_binding == null
                        ? "not checked"
                        : verification.checks.report_data_matches_binding
                          ? "matched"
                          : "mismatch"
                    }
                  />
                  <EvidenceRow
                    label="signature"
                    value={
                      verification.checks.signature_verified == null
                        ? verification.checks.signing_key_configured
                          ? "missing"
                          : "disabled"
                        : verification.checks.signature_verified
                          ? "verified"
                          : "failed"
                    }
                  />
                  <EvidenceRow
                    label="compose"
                    value={verification.checks.compose_images_pinned ? "pinned" : "unpinned"}
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

function VerificationStep({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
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
