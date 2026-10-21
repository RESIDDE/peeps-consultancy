"use client";

import { useState } from "react";
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer";
import { COMPANY, DIVISIONS, VERTICALS } from "@/lib/content";

/** Used until the real face can be read off the document. */
const FALLBACK_DISPLAY = '"Bricolage Grotesque", "Inter Tight", Arial, sans-serif';

const COLUMNS = [
  { title: "Services", links: DIVISIONS.map((d) => ({ label: d.name, href: `/services/${d.slug}` })) },
  { title: "Sectors", links: VERTICALS.map((v) => ({ label: v.name, href: `/sectors/${v.slug}` })) },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How we select", href: "/how-we-select" },
      { label: "Partner with us", href: "/partners" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export function StudioFooter() {
  // The wordmark is drawn into a canvas, and `ctx.font` cannot resolve a CSS custom
  // property — it would silently fall back to a default face. next/font registers the real
  // family under a hashed name, so the display face has to be read off the document.
  //
  // Only the display face. It is passed to the canvas and never rendered, so the server and
  // client markup stay identical. The small type is a different matter: it reaches the DOM
  // as --hwf-mono, so a value read from the browser would differ from the one rendered on
  // the server and React would report a hydration mismatch. That one stays a plain var(),
  // which CSS resolves perfectly well on its own.
  const [displayFace] = useState(() => {
    if (typeof window === "undefined") return FALLBACK_DISPLAY;
    return getComputedStyle(document.documentElement).getPropertyValue("--font-bricolage").trim() || FALLBACK_DISPLAY;
  });

  return (
    <HalftoneWordmarkFooter
      wordmark={COMPANY.short.toLowerCase()}
      label={COMPANY.name}
      meta={`© ${new Date().getFullYear()} · ${COMPANY.city} · Candidates never pay placement fees`}
      columns={COLUMNS}
      // Dark whatever the theme, as the footer has always been, with the PEEPs accent as
      // the colour a dot warms toward.
      palette={{ background: "#0c0c0e", ink: "#f1f1ee", warm: "#ff3e3e" }}
      fontFamily={displayFace}
      monoFamily="var(--font-mono)"
      fontWeight={600}
      dotGap={7}
      crop={0.22}
      grain={0.4}
      height="clamp(380px, 46vw, 560px)"
    />
  );
}
