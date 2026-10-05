import { cn } from "@/lib/utils";

/**
 * Scroll-driven fade-and-rise (pure CSS). Content is fully visible without
 * JS, in browsers without scroll timelines, and under reduced motion.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
