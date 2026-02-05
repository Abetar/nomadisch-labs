import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { ReactiveBackground } from "@/components/ReactiveBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nomadisch Labs",
    template: "%s — Nomadisch Labs",
  },
  description:
    "Nomadisch Labs — roaming nights, pop-up events, raw sound. Follow the drops.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Nomadisch Labs",
    description:
      "Nomadisch Labs — roaming nights, pop-up events, raw sound. Follow the drops.",
    siteName: "Nomadisch Labs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomadisch Labs",
    description:
      "Nomadisch Labs — roaming nights, pop-up events, raw sound. Follow the drops.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable}`}>
      <body className="min-h-dvh bg-black text-white antialiased">
        {/* <ReactiveBackground active={true} /> */}
        <div className="mx-auto w-full max-w-5xl px-5 pb-20 pt-10 md:pb-10">
          {children}
        </div>
      </body>
    </html>
  );
}
