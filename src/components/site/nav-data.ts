import { VERTICALS } from "@/lib/content";
import { OFFERINGS } from "@/lib/services";

export const NAV = [
  { href: "/employers", label: "For Employers" },
  { href: "/candidates", label: "For Talent" },
  { href: "/how-we-select", label: "How We Select" },
  {
    href: "/services",
    label: "Services",
    children: OFFERINGS.map((o) => ({ href: o.href, label: o.name, hint: o.kicker })),
  },
  {
    href: "/sectors",
    label: "Sectors",
    children: VERTICALS.map((v) => ({ href: `/sectors/${v.slug}`, label: v.name, hint: v.launch ? "Launch vertical" : "Growing pool" })),
  },
  { href: "/about", label: "About" },
] as const;
