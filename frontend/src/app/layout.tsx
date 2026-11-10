import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAVACH-AI | Cyber Resilience & Incident Triage",
  description: "Internal security operations tool for alert correlation, automated anomaly scoring, and human-in-the-loop containment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF7F2] text-[#1F2933] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
