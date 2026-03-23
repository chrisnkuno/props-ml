"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const USE_CASES = [
  {
    id: "01",
    title: "Healthcare",
    summary: "Train or score on authenticated EHR records without blindly trusting uploaded PDFs.",
    outcomes: [
      "Higher-quality private training data than generic public corpora",
      "Lower fraud risk in medical-document ingestion",
      "Stronger privacy posture for regulated workflows",
    ],
    productFit:
      "Patients or providers upload records, the pipeline extracts them privately, classifies the document type, and returns evidence showing what software handled the data.",
  },
  {
    id: "02",
    title: "Financial Services",
    summary: "Run underwriting, income checks, or fraud review on authenticated bank and accounting records.",
    outcomes: [
      "Privacy-preserving loan decisions",
      "Income and affordability verification",
      "SME underwriting from financial statements and ledgers",
    ],
    productFit:
      "Borrowers or businesses submit documents, the system detects invoices and statements, and the verifier exports a proof bundle alongside the model result.",
  },
  {
    id: "03",
    title: "Enterprise AI",
    summary: "Ground internal copilots and RAG flows on authenticated ERP, CRM, billing, and operational records.",
    outcomes: [
      "Trustworthy RAG over sensitive internal systems",
      "Compliance and audit assistants",
      "Procurement, finance, and operations agents",
    ],
    productFit:
      "The product becomes the ingestion and trust layer between private enterprise records and downstream models or internal agents.",
  },
  {
    id: "04",
    title: "Consumer AI",
    summary: "Work over inboxes, calendars, financial statements, and private personal data without exposing raw records broadly.",
    outcomes: [
      "Personal assistants over real inbox and calendar data",
      "Financial copilots using transaction history",
      "Travel and admin agents with authenticated account context",
    ],
    productFit:
      "Users keep OCR, extraction, and model preparation inside a private runtime, then selectively release results instead of raw documents.",
  },
  {
    id: "05",
    title: "Training Markets",
    summary: "Let contributors provide filtered or redacted private data for training with provenance and compensation hooks.",
    outcomes: [
      "Authenticated private-data marketplaces",
      "Per-example compensation and contribution receipts",
      "Cooperative or union-style model ownership flows",
    ],
    productFit:
      "The current contribution receipt, source identity, policy controls, and training planner form the base of a governed data-contribution workflow.",
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#11110f] font-sans tracking-tight">
      <nav className="flex items-start justify-between p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-50 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="h-3 w-3" />
          Back.Index
        </Link>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-40">Product Uses</div>
          <div className="mt-1 text-xs uppercase tracking-[0.22em] opacity-60">Industry Pathways</div>
        </div>
      </nav>

      <main className="px-8 pb-24 pt-10 sm:px-16 lg:px-24">
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="max-w-3xl">
            <div className="text-[10px] font-mono uppercase tracking-[0.45em] opacity-40">
              Applied Product Map
            </div>
            <h1 className="mt-6 text-5xl font-thin leading-[0.95] sm:text-7xl">
              Where this product
              <br />
              actually fits.
            </h1>
          </div>
          <div className="rounded-[36px] bg-[#11110f] p-8 text-[#f7f3ea]">
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-50">
              What Props Does
            </div>
            <div className="mt-5 text-base leading-relaxed text-[#efe9dd]">
              Props is not just a document classifier. It is a private ingestion, OCR, provenance,
              and verification layer for models that need to work on sensitive records people do
              not want to expose blindly.
            </div>
            <Link
              href="/upload"
              className="mt-8 inline-flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.4em] text-[#d7cdbb] transition-opacity hover:opacity-100"
            >
              Open Pipeline
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {USE_CASES.map((useCase) => (
            <article
              key={useCase.id}
              className="rounded-[36px] border border-[#d8d1c3] bg-white/70 p-8 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-35">
                  {useCase.id}
                </div>
                <div className="max-w-[34rem]">
                  <h2 className="text-2xl font-normal tracking-tight">{useCase.title}</h2>
                  <p className="mt-3 text-base leading-relaxed text-[#5a554d]">{useCase.summary}</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1fr]">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-35">
                    Product Expression
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#5a554d]">{useCase.productFit}</p>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-35">
                    Practical Outcomes
                  </div>
                  <div className="mt-3 space-y-3">
                    {useCase.outcomes.map((outcome) => (
                      <div key={outcome} className="rounded-[22px] bg-[#f3eee4] px-4 py-3 text-sm text-[#4c4841]">
                        {outcome}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-[40px] bg-[#d6e3d1] p-8 sm:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,1fr,1fr]">
            <Capability
              title="Private Ingestion"
              text="OCR and text extraction run locally today and can later run in a confidential VM."
            />
            <Capability
              title="Selective Release"
              text="Source identity, release policy, and evidence export let users share outputs without exposing all raw inputs."
            />
            <Capability
              title="Training Path"
              text="The training planner makes it explicit how authenticated documents can become labeled private training data."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Capability({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-45">{title}</div>
      <div className="mt-3 text-sm leading-relaxed text-[#354034]">{text}</div>
    </div>
  );
}
