"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, Terminal } from "lucide-react";
import type { InferenceResult } from "@/lib/api";

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

export default function ResultPage() {
  const [result] = useState<InferenceResult | null>(() => readStoredResult());
  const [copied, setCopied] = useState(false);
  const [bundleDownloaded, setBundleDownloaded] = useState(false);
  const quoteHex = result?.attestation_bundle?.quote ?? result?.attestation ?? null;
  const attestationSummary = [
    result?.attestation_bundle?.event_log ? "event-log" : null,
    result?.attestation_bundle?.vm_config ? "vm-config" : null,
    result?.attestation_bundle?.app_id ? "app-id" : null,
  ]
    .filter(Boolean)
    .join(" / ");
  const proofStatus = useMemo(() => {
    if (result?.verification_bundle.signature) {
      return "Signed evidence bundle ready";
    }
    if (result?.attestation_bundle?.event_log) {
      return "Quote, event log, and vm config captured";
    }
    if (!quoteHex) {
      return "Result available, attestation unavailable";
    }

    return result?.report_data ? "Quote and report data captured" : "Quote captured";
  }, [quoteHex, result]);

  const copyQuote = () => {
    if (quoteHex) {
      navigator.clipboard.writeText(quoteHex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadEvidenceBundle = () => {
    if (!result) {
      return;
    }

    const bundle = {
      quote: quoteHex,
      event_log: result.attestation_bundle?.event_log,
      report_data: result.attestation_bundle?.report_data ?? result.report_data,
      vm_config: result.attestation_bundle?.vm_config,
      app_id: result.attestation_bundle?.app_id,
      instance_id: result.attestation_bundle?.instance_id,
      device_id: result.attestation_bundle?.device_id,
      policy_id: result.policy_id,
      model_version: result.model_version,
      source_identity: result.source_identity,
      file_hash: result.verification_bundle.file_hash,
      result_hash: result.verification_bundle.result_hash,
      compose_hash: result.verification_bundle.compose_hash,
      compose_images_pinned: result.verification_bundle.compose_images_pinned,
      signature: result.verification_bundle.signature,
      document_kind: result.document_kind,
      document_profile: result.document_profile,
      detector_confidence: result.detector_confidence,
      detected_terms: result.detected_terms,
      detector_summary: result.detector_summary,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "props-evidence-bundle.json";
    link.click();
    URL.revokeObjectURL(url);
    setBundleDownloaded(true);
    setTimeout(() => setBundleDownloaded(false), 2000);
  };

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-8 text-center font-sans font-extralight tracking-tight">
        <div className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-40">No.Stored.Result</div>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
          Upload a document first or paste an existing quote into the verifier.
        </p>
        <div className="flex gap-6 text-[10px] font-mono uppercase tracking-[0.4em]">
          <Link href="/upload" className="hover:opacity-100 opacity-50 transition-opacity">
            Start Upload
          </Link>
          <Link href="/verify" className="hover:opacity-100 opacity-50 transition-opacity">
            Open Verifier
          </Link>
        </div>
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
              {proofStatus}
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
              <Stat label="Document Kind" value={result.document_kind_label} />
              <Stat label="Profile" value={result.document_profile} />
              <Stat label="Source Identity" value={result.source_identity} />
              <Stat label="Release Policy" value={result.policy_id} />
              <Stat label="Model ID" value={result.model_version} />
              <Stat label="Compute Mode" value={result.processing_mode} />
            </div>

            <div className="mt-10 text-[10px] font-mono uppercase tracking-[0.35em] opacity-35">
              Attestation Bundle: {attestationSummary || "quote-only-or-unavailable"}
            </div>

            <div className="mt-12 rounded-[32px] border border-zinc-100 p-8">
              <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                Word Detector
              </div>
              <div className="mt-4 text-sm leading-relaxed text-zinc-600">{result.detector_summary}</div>
              <div className="mt-5 flex flex-wrap gap-3">
                <DetectorChip value={`confidence:${result.detector_confidence}`} />
                {result.detected_terms.map((term) => (
                  <DetectorChip key={term} value={term} />
                ))}
              </div>
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
                  disabled={!quoteHex}
                  className="text-[10px] font-mono uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  {copied ? "Copied" : quoteHex ? "Copy Hex" : "No Quote"}
                </button>
              </div>
              
              <div className="bg-zinc-50/50 p-8 rounded-[30px] border border-zinc-100 relative overflow-hidden group">
                <div className="font-mono text-[9px] leading-relaxed break-all opacity-40 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                  {quoteHex ?? "This run did not return an attestation quote."}
                </div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-zinc-50/80 via-transparent to-transparent opacity-100"></div>
              </div>
            </div>

            <div className="p-8 border-l border-zinc-100 flex flex-col gap-6">
              <p className="text-xs text-zinc-400 leading-relaxed font-extralight uppercase tracking-widest">
                Verification Binding: <br />
                <span className="font-mono text-[9px] lowercase opacity-60">
                  {result.report_data ?? "report data not returned"}
                </span>
              </p>
              <button
                onClick={downloadEvidenceBundle}
                className="text-left text-[10px] font-mono uppercase tracking-[0.4em] opacity-60 transition-opacity hover:opacity-100"
              >
                {bundleDownloaded ? "Bundle_Exported" : "Export_Evidence_Bundle"}
              </button>
              <Link
                href="/verify"
                className="inline-flex items-center gap-6 group hover:gap-10 transition-all duration-500"
              >
                <div className="h-px w-8 bg-black group-hover:w-16 transition-all duration-500"></div>
                <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Execute Proof Chain</span>
              </Link>
              <Link
                href="/train"
                className="inline-flex items-center gap-6 group hover:gap-10 transition-all duration-500"
              >
                <div className="h-px w-8 bg-black group-hover:w-16 transition-all duration-500"></div>
                <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Open Training Planner</span>
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

function DetectorChip({ value }: { value: string }) {
  return (
    <div className="rounded-full border border-zinc-200 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.28em] opacity-60">
      {value}
    </div>
  );
}
