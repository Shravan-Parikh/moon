import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoonPulse",
  description:
    "A minimal moon-phase tracker. Glance at tonight's moon, the next full moon, and the month ahead.",
  manifest: "/api/manifest",
  appleWebApp: {
    capable: true,
    title: "MoonPulse",
    statusBarStyle: "black-translucent",
  },
  icons: {
    // Static fallback — DynamicFavicon swaps in the phase-specific icon at runtime.
    icon: "/icons/full-moon.svg",
    apple: "/icons/full-moon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="starfield fixed inset-0 -z-10 opacity-60 pointer-events-none" />
        <main className="flex-1 flex flex-col">{children}</main>
        <nav className="sticky bottom-0 flex justify-center gap-8 py-4 text-sm text-muted backdrop-blur-md bg-background/60 border-t border-white/5">
          <Link href="/" className="hover:text-foreground transition-colors">
            Tonight
          </Link>
          <Link href="/calendar" className="hover:text-foreground transition-colors">
            Calendar
          </Link>
        </nav>
        <DynamicFavicon />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
