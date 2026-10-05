import { DIVISIONS, VERTICALS } from "@/lib/content";

export const NAV = [
  { href: "/employers", label: "For Employers" },
  { href: "/candidates", label: "For Talent" },
  { href: "/how-we-select", label: "How We Select" },
  {
    href: "/services",
    label: "Services",
    children: DIVISIONS.map((d) => ({ href: `/services/${d.slug}`, label: d.name, hint: d.kicker })),
  },
  {
    href: "/sectors",
    label: "Sectors",
    children: VERTICALS.map((v) => ({ href: `/sectors/${v.slug}`, label: v.name, hint: v.launch ? "Launch vertical" : "Growing pool" })),
  },
  { href: "/about", label: "About" },
] as const;
