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
      <body className="antialiased bg-background text-dark">
        {children}
      </body>
    </html>
  );
}
