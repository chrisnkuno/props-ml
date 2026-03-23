import Link from "next/link";
import { ArrowRight, CornerDownRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans font-extralight tracking-tight selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-start z-40 mix-blend-difference">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">System.01</div>
          <div className="text-xl font-normal lowercase tracking-tighter">props.dStack</div>
        </div>
        <div className="flex gap-12 text-xs font-mono uppercase tracking-[0.2em] opacity-60">
          <Link href="/solutions" className="hover:opacity-100 transition-opacity">Use Cases</Link>
          <Link href="/verify" className="hover:opacity-100 transition-opacity">Verifier</Link>
          <Link href="/train" className="hover:opacity-100 transition-opacity">Training</Link>
          <Link href="/deploy" className="hover:opacity-100 transition-opacity">Deploy</Link>
          <a
            href="https://phala.network"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 transition-opacity"
          >
            Network
          </a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-48 pb-32 px-8 sm:px-16 lg:px-32 relative overflow-hidden">
        {/* Decorative Grid / Lines */}
        <div className="absolute top-0 right-0 w-px h-full bg-zinc-50 -z-10 translate-x-[-20vw]"></div>
        <div className="absolute top-[40vh] left-0 w-full h-px bg-zinc-50 -z-10"></div>
        
        {/* Hero Section - Asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-12 items-start">
          <div className="max-w-xl">
            <h1 className="text-6xl sm:text-8xl font-thin leading-[0.9] mb-12">
              Private <br />
              <span className="italic font-light">Inference</span> <br />
              at Edge.
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-400 font-extralight leading-relaxed max-w-md mb-16">
              Private document OCR, training-data preparation, and inference with a practical no-credit path now, plus a clear upgrade path to dStack / Phala attestation later.
            </p>
            
            <Link
              href="/upload"
              className="inline-flex items-center gap-6 group hover:gap-10 transition-all duration-500 ease-out"
            >
              <div className="h-px w-12 bg-black group-hover:w-24 transition-all duration-500"></div>
              <span className="text-sm font-mono uppercase tracking-[0.4em]">Initialize Pipeline</span>
              <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          <div className="mt-24 lg:mt-0 flex flex-col gap-16 border-l border-zinc-100 pl-8 lg:pl-16">
            <Feature 
              id="01"
              title="Identity"
              description="Expose quote and report data so the runtime can be checked independently."
            />
            <Feature 
              id="02"
              title="Isolation"
              description="The backend can run inside a confidential VM so private documents can be used for training and inference inside the TEE boundary."
            />
            <Feature 
              id="03"
              title="Verification"
              description="Verifier flow checks backend evidence instead of simulating a green result."
            />
            <Feature 
              id="04"
              title="Use Cases"
              description="Healthcare, lending, enterprise AI, consumer assistants, and private training markets."
            />
          </div>
        </div>

        <section className="mt-28 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <TeaserCard
            title="Healthcare"
            description="Authenticated EHR and diagnostics records for model training and scoring."
          />
          <TeaserCard
            title="Financial Services"
            description="Underwriting, affordability checks, and fraud review over private source documents."
          />
          <TeaserCard
            title="Enterprise AI"
            description="Trustworthy ingestion for ERP, CRM, billing, transaction, and internal record systems."
          />
        </section>

        <div className="mt-10">
          <Link
            href="/solutions"
            className="inline-flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.4em] opacity-60 transition-opacity hover:opacity-100"
          >
            Explore Product Uses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Bottom Accent */}
        <div className="mt-auto pt-32 flex flex-col sm:flex-row justify-between items-end gap-12">
          <div className="text-[10vw] font-black opacity-[0.02] select-none translate-x-[-2vw]">
            INTEL.TDX
          </div>
          <div className="max-w-xs text-[10px] font-mono leading-relaxed opacity-30 uppercase tracking-widest text-right">
            Configured For dStack <br />
            Quote Verification Surface <br />
            Frontend + API Split
          </div>
        </div>
      </main>

      <footer className="p-8 border-t border-zinc-50 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">
        <div>&copy; 2026 Props.Network</div>
        <div className="flex gap-8">
          <span>Security</span>
          <span>Docs</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ id, title, description }: { id: string, title: string, description: string }) {
  return (
    <div className="flex flex-col gap-4 max-w-[240px]">
      <div className="text-[10px] font-mono opacity-30 flex items-center gap-2">
        <CornerDownRight className="h-3 w-3" />
        {id}
      </div>
      <h3 className="text-sm font-normal uppercase tracking-widest">{title}</h3>
      <p className="text-xs leading-relaxed text-zinc-400 font-extralight tracking-normal">
        {description}
      </p>
    </div>
  );
}

function TeaserCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[32px] border border-zinc-100 bg-zinc-50/40 p-8">
      <div className="text-[10px] font-mono uppercase tracking-[0.35em] opacity-30">Industry</div>
      <div className="mt-4 text-2xl font-normal tracking-tight">{title}</div>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}
