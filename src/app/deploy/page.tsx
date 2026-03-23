"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getDeployWalkthrough, type DeployWalkthrough } from "@/lib/api";

export default function DeployPage() {
  const [walkthrough, setWalkthrough] = useState<DeployWalkthrough | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getDeployWalkthrough()
      .then((result) => {
        if (!cancelled) {
          setWalkthrough(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load walkthrough.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          href="/train"
          className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
        >
          Training Pipeline
        </Link>
      </nav>

      <main className="flex-1 px-8 pb-24 pt-16 sm:px-16 lg:px-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[420px,1fr]">
          <section>
            <div className="mb-8 text-[10px] font-mono uppercase tracking-[0.4em] opacity-40">
              Deployment Walkthrough
            </div>
            <h1 className="mb-8 text-5xl font-thin leading-[1.05]">
              dStack / <br />
              Phala Deploy.
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              Follow the pinned-image and attestation path needed to run OCR, training, and
              inference inside the confidential VM boundary.
            </p>
          </section>

          <section className="space-y-10">
            {error && (
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-red-500">{error}</div>
            )}

            {walkthrough && (
              <>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InfoCard label="Target" value={walkthrough.target} />
                  <InfoCard
                    label="Compose State"
                    value={walkthrough.compose_images_pinned ? "Pinned" : "Unpinned"}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  {walkthrough.modes.map((mode) => (
                    <div key={mode.id} className="rounded-[28px] border border-zinc-100 p-6">
                      <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                        {mode.status}
                      </div>
                      <div className="mt-3 text-lg font-normal tracking-tight uppercase">{mode.title}</div>
                      <div className="mt-3 text-sm leading-relaxed text-zinc-600">{mode.description}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[32px] border border-zinc-100 p-8 text-sm leading-relaxed text-zinc-600">
                  {walkthrough.summary}
                </div>

                <div className="rounded-[32px] border border-zinc-100 p-8">
                  <div className="mb-6 text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                    Compose Hash
                  </div>
                  <div className="break-all font-mono text-xs opacity-70">{walkthrough.compose_hash}</div>
                </div>

                <div className="space-y-6">
                  {walkthrough.steps.map((step, index) => (
                    <div key={step.id} className="grid grid-cols-[36px,1fr] gap-5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-[10px] font-mono uppercase opacity-50">
                        {index + 1}
                      </div>
                      <div className="pt-2">
                        <div className="text-sm font-normal uppercase tracking-[0.16em]">{step.title}</div>
                        <div className="mt-2 text-sm leading-relaxed text-zinc-500">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <CommandCard title="Backend Environment" values={walkthrough.environment.backend} />
                  <CommandCard title="Frontend Environment" values={walkthrough.environment.frontend} />
                </div>

                <div className="rounded-[32px] border border-zinc-100 p-8">
                  <div className="mb-5 text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                    Vercel Frontend Path
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <InfoCard label="Framework" value={walkthrough.vercel.framework} />
                    <InfoCard label="Root Directory" value={walkthrough.vercel.root_directory} />
                    <InfoCard
                      label="Required Env"
                      value={walkthrough.vercel.required_env.join(", ")}
                    />
                  </div>
                  <div className="mt-6 space-y-3">
                    {walkthrough.vercel.notes.map((note) => (
                      <div key={note} className="text-sm leading-relaxed text-zinc-600">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-zinc-100 p-8">
                  <div className="mb-5 text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                    Commands
                  </div>
                  <div className="space-y-5">
                    {walkthrough.commands.map((command) => (
                      <div key={command.title}>
                        <div className="mb-2 text-sm font-normal uppercase tracking-[0.16em]">
                          {command.title}
                        </div>
                        <pre className="overflow-x-auto rounded-[24px] bg-zinc-50 px-5 py-4 text-xs leading-relaxed text-zinc-600">
                          {command.command}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-zinc-100 p-8">
                  <div className="mb-5 text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                    Privacy And Training
                  </div>
                  <div className="space-y-3">
                    {walkthrough.privacy_notes.map((note) => (
                      <div key={note} className="text-sm leading-relaxed text-zinc-600">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-zinc-100 p-8">
                  <div className="mb-5 text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">
                    Official References
                  </div>
                  <div className="space-y-3">
                    {walkthrough.references.map((reference) => (
                      <a
                        key={reference}
                        href={reference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block break-all text-sm text-zinc-600 transition-colors hover:text-black"
                      >
                        {reference}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-zinc-100 p-6">
      <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">{label}</div>
      <div className="mt-3 text-lg font-normal tracking-tight uppercase">{value}</div>
    </div>
  );
}

function CommandCard({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-[28px] border border-zinc-100 p-6">
      <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">{title}</div>
      <div className="space-y-3">
        {values.map((value) => (
          <pre
            key={value}
            className="overflow-x-auto rounded-[20px] bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-600"
          >
            {value}
          </pre>
        ))}
      </div>
    </div>
  );
}
