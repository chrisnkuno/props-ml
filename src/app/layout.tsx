import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["100", "200"],
});

export const metadata: Metadata = {
  title: "Props dStack | Private Inference",
  description: "Secure, hardware-rooted document processing inside Intel TDX TEE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${mono.variable} antialiased selection:bg-black selection:text-white`}
      >
        <div className="scanning-line"></div>
        {children}
      </body>
    </html>
  );
}
