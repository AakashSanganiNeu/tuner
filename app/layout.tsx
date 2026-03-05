import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TuneMate",
  description: "Production-quality tuner for guitar, ukulele, violin, bass, mandolin, and chromatic tuning."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
