import type { Metadata, Viewport } from "next";
import { Caveat, Familjen_Grotesk, Fraunces, IBM_Plex_Mono, Inter, Inter_Tight } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// The marketing site's own faces. Scoped to `.studio` in globals.css, so the console,
// the portals and the admin app keep the PEEPs brand faces above. Familjen sets the
// display type and the labels; Inter Tight sets running text.
const familjen = Familjen_Grotesk({ subsets: ["latin"], variable: "--font-familjen", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "PEEPs.HR Partners — Verified, assessed, prepared talent",
    template: "%s · PEEPs.HR Partners",
  },
  description:
    "PEEPs.HR Partners connects organisations with verified, assessed and professionally prepared talent, alongside recruitment, workforce development and business-support services.",
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  openGraph: { siteName: "PEEPs.HR Partners", type: "website", locale: "en_NG" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1412" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('peeps-theme');var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" data-scroll-behavior="smooth" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable} ${familjen.variable} ${interTight.variable} ${plex.variable} ${caveat.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
