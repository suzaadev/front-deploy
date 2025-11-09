import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUZAA - Crypto Payment Gateway",
  description: "Accept cryptocurrency payments with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--suzaa-surface-subtle)] text-[var(--suzaa-midnight)]">
        {children}
      </body>
    </html>
  );
}
