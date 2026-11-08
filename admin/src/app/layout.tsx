import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Fraunces, IBM_Plex_Mono, Inter, Inter_Tight } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const familjen = Familjen_Grotesk({ subsets: ["latin"], variable: "--font-familjen", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  title: { default: "PEEPs Console", template: "%s · PEEPs Console" },
  robots: { index: false, follow: false },
};

// Matched to the site, so the browser chrome around the console is the same colour.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1412" },
  ],
};


export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-NG"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${familjen.variable} ${interTight.variable} ${plex.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
