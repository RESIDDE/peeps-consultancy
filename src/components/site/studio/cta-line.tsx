import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Words that roll up to an identical copy on hover (see .cta-roll). The copy is hidden from
 * assistive tech, so the link is still read once.
 */
export function Roll({ children }: { children: string }) {
  return (
    <span className="cta-roll">
      <span>
        <span className="block">{children}</span>
        <span aria-hidden className="block">
          {children}
        </span>
      </span>
    </span>
  );
}

/** The site's call to action: mono, uppercase, ruled underneath, the arrow at the far end. */
export function CtaLine({ href, children, className }: { href: string; children: string; className?: string }) {
  return (
    <Link href={href} className={cn("cta-line", className)}>
      <Roll>{children}</Roll>
      <ArrowRight className="cta-arrow size-3.5 shrink-0" aria-hidden />
    </Link>
  );
}
