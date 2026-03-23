"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  createTrainingPipeline,
  type InferenceResult,
  listTrainingPipelines,
  type TrainingPipeline,
} from "@/lib/api";

const OBJECTIVES = [
  { value: "classification", label: "Classification" },
  { value: "extraction", label: "Extraction" },
  { value: "fine_tune", label: "Fine-Tune" },
  { value: "redaction", label: "Redaction" },
];

const DOCUMENT_KINDS = [
  { value: "academic_paper", label: "Academic Paper" },
  { value: "invoice", label: "Invoice" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "resume", label: "Resume" },
  { value: "medical_record", label: "Medical Record" },
  { value: "legal_contract", label: "Legal Contract" },
  { value: "general_document", label: "General Document" },
];

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

export default function TrainPage() {
  const storedResult = useMemo(() => readStoredResult(), []);
  const [pipelineName, setPipelineName] = useState(
    storedResult ? `${storedResult.document_kind_label} Private Training` : "Private Training Pipeline",
  );
  const [objective, setObjective] = useState("classification");
  const [documentKind, setDocumentKind] = useState(storedResult?.document_kind ?? "general_document");
  const [sourceIdentity, setSourceIdentity] = useState(
    storedResult?.source_identity ?? "User.Upload.PDF.Academic",
  );
  const [policyId, setPolicyId] = useState(
    storedResult?.policy_id ?? "Academic.Research_Minimization_v1",
  );
  const [privateOcr, setPrivateOcr] = useState(true);
  const [attestedTraining, setAttestedTraining] = useState(true);
  const [trainingEnabled, setTrainingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<TrainingPipeline | null>(null);
  const [existingPipelines, setExistingPipelines] = useState<TrainingPipeline[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listTrainingPipelines()
      .then((result) => {
        if (!cancelled) {
          setExistingPipelines(result.pipelines);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExistingPipelines([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pipeline]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextPipeline = await createTrainingPipeline({
        pipeline_name: pipelineName,
        objective,
        document_kind: documentKind,
        source_identity: sourceIdentity,
        policy_id: policyId,
        private_ocr: privateOcr,
        attested_training: attestedTraining,
        training_enabled: trainingEnabled,
        deployment_target: "dstack-phala",
      });
      setPipeline(nextPipeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create training pipeline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans font-extralight tracking-tight">
      <nav className="p-8 flex justify-between items-start">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="h-3 w-3" />
          Back.Index
        </Link>
        <Link
          href="/deploy"
          className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
        >
          Deploy Walkthrough
        </Link>
      </nav>

      <main className="flex-1 px-8 pb-24 pt-16 sm:px-16 lg:px-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[420px,1fr]">
          <section>
            <div className="mb-8 text-[10px] font-mono uppercase tracking-[0.4em] opacity-40">
              Training Pipeline
            </div>
            <h1 className="mb-8 text-5xl font-thin leading-[1.05]">
              Private <br />
              Training.
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              Build a training plan that keeps OCR, dataset preparation, and model work inside the
              private dStack / Phala pipeline.
            </p>
            {storedResult && (
              <div className="mt-8 rounded-[28px] border border-zinc-100 p-6">
                <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                  Detector Carryover
                </div>
                <div className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {storedResult.detector_summary}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {storedResult.detected_terms.map((term) => (
                    <div
                      key={term}
                      className="rounded-full border border-zinc-200 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.28em] opacity-60"
                    >
                      {term}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input label="Pipeline Name" value={pipelineName} onChange={setPipelineName} />
              <Select label="Objective" value={objective} onChange={setObjective} options={OBJECTIVES} />
              <Select label="Document Kind" value={documentKind} onChange={setDocumentKind} options={DOCUMENT_KINDS} />
              <Input label="Source Identity" value={sourceIdentity} onChange={setSourceIdentity} />
              <Input label="Release Policy" value={policyId} onChange={setPolicyId} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Toggle label="Private OCR" checked={privateOcr} onChange={setPrivateOcr} description="Keep OCR local" />
              <Toggle label="Attested Training" checked={attestedTraining} onChange={setAttestedTraining} description="Use TEE runtime" />
              <Toggle label="Training Enabled" checked={trainingEnabled} onChange={setTrainingEnabled} description="Allow model updates" />
            </div>

            {error && <div className="text-xs font-mono uppercase tracking-[0.3em] text-red-500">{error}</div>}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="inline-flex items-center gap-6 text-[10px] font-mono uppercase tracking-[0.4em] opacity-70 transition-opacity hover:opacity-100 disabled:opacity-30"
            >
              <div className="h-2 w-2 rounded-full bg-black" />
              {loading ? "Planning_Training..." : "Create_Training_Pipeline"}
              {loading && <Loader2 className="h-4 w-4 animate-spin opacity-40" />}
            </button>

            {pipeline && (
              <div className="rounded-[32px] border border-zinc-100 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">Pipeline Created</div>
                    <div className="mt-2 text-2xl font-normal tracking-tight">{pipeline.pipeline_name}</div>
                  </div>
                  <div className="text-right text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
                    {pipeline.pipeline_id}
                  </div>
                </div>

                <div className="space-y-5">
                  {pipeline.steps.map((step) => (
                    <div key={step.id} className="grid grid-cols-[18px,1fr] gap-4">
                      <div className="mt-1 h-2 w-2 rounded-full bg-black" />
                      <div>
                        <div className="text-sm font-normal uppercase tracking-[0.16em]">{step.title}</div>
                        <div className="mt-1 text-sm leading-relaxed text-zinc-500">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[32px] border border-zinc-100 p-8">
              <div className="mb-5 text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                Existing Pipelines
              </div>
              <div className="space-y-4">
                {existingPipelines.length === 0 && (
                  <div className="text-sm leading-relaxed text-zinc-500">
                    No training pipelines created yet.
                  </div>
                )}
                {existingPipelines.map((item) => (
                  <div key={item.pipeline_id} className="grid grid-cols-[1fr,auto] gap-4 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0">
                    <div>
                      <div className="text-sm font-normal tracking-tight">{item.pipeline_name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                        {item.document_kind.replaceAll("_", " ")} / {item.objective.replaceAll("_", " ")}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-3">
      <span className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[22px] border border-zinc-100 bg-white px-5 py-4 text-sm tracking-tight focus:border-zinc-200 focus:outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-3">
      <span className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[22px] border border-zinc-100 bg-white px-5 py-4 text-sm tracking-tight focus:border-zinc-200 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="rounded-[24px] border border-zinc-100 p-5 text-left transition-colors hover:border-zinc-200"
    >
      <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">{label}</div>
      <div className="mt-3 text-sm font-normal">{checked ? "Enabled" : "Disabled"}</div>
      <div className="mt-1 text-xs text-zinc-500">{description}</div>
    </button>
  );
}
