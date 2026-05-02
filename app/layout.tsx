import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Fraunces } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial display serif used by the landing page hero.
// Variable font — wght + ital axes loaded by default.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Brand cursive used in the OonkoO logo wordmark and hero accent words.
const amsterdam = localFont({
  src: "../public/fonts/Amsterdam_Four.ttf",
  variable: "--font-handwritten",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OonkoO Talent — Engineering pods for small teams",
  description:
    "Hands-on junior developers led by senior tech leads, embedded in your stack from $4/hr. No agencies, no middlemen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
        fraunces.variable,
        amsterdam.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
