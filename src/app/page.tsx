import Link from "next/link";
import { ShieldCheck, Upload, FileSearch, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white font-sans text-zinc-900 selection:bg-zinc-100">
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <main className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium tracking-wider text-zinc-500 uppercase ring-1 ring-zinc-200">
          <Shield className="h-3 w-3" />
          TEE-Backed Private Inference
        </div>
        
        <h1 className="mb-6 text-5xl font-light tracking-tight sm:text-7xl">
          Props <span className="font-medium">dStack</span>
        </h1>
        
        <p className="mb-12 max-w-xl text-lg font-light leading-relaxed text-zinc-500 sm:text-xl">
          Secure, hardware-rooted document processing. 
          Upload sensitive files and get verifiable results without ever exposing your data.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/upload"
            className="group flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-white transition-all hover:bg-zinc-800"
          >
            <Upload className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            <span className="font-medium">Start Inference</span>
          </Link>
          <Link
            href="/verify"
            className="flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-8 py-4 transition-all hover:bg-zinc-50"
          >
            <ShieldCheck className="h-4 w-4 text-zinc-400" />
            <span className="font-medium">Verifier Portal</span>
          </Link>
        </div>

        <div className="mt-24 grid w-full grid-cols-1 gap-12 text-left sm:grid-cols-3">
          <Feature 
            icon={<ShieldCheck className="h-6 w-6 text-zinc-900" />}
            title="Privacy First"
            description="Your documents are decrypted and processed only inside an Intel TDX enclave."
          />
          <Feature 
            icon={<FileSearch className="h-6 w-6 text-zinc-900" />}
            title="Verifiable Logic"
            description="Every result comes with a cryptographic proof of the exact model version and execution environment."
          />
          <Feature 
            icon={<Shield className="h-6 w-6 text-zinc-900" />}
            title="No Third Party"
            description="Verify the compose-hash yourself to ensure the infrastructure hasn't been tampered with."
          />
        </div>
      </main>

      <footer className="relative z-10 mt-auto py-10 text-xs font-light tracking-widest text-zinc-400 uppercase">
        Built on Phala Cloud & dStack
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-100">
        {icon}
      </div>
      <div>
        <h3 className="mb-2 font-medium text-zinc-900">{title}</h3>
        <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
