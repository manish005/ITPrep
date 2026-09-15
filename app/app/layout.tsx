import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Buddy - Angular Interview Prep",
  description: "Master Angular interviews with 260+ questions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}