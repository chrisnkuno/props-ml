import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Props dStack | Private Inference",
  description: "Attestation-aware document processing for dStack-backed deployments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-black selection:text-white">
        <div className="scanning-line"></div>
        {children}
      </body>
    </html>
  );
}
