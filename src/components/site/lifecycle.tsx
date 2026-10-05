"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GraduationCap, ClipboardCheck, Sparkles, Target, Rocket, RefreshCcw } from "lucide-react";
import { LIFECYCLE } from "@/lib/content";
import { cn } from "@/lib/utils";

const ICONS = [GraduationCap, ClipboardCheck, Sparkles, Target, Rocket, RefreshCcw];

/** Train → Assess → Prepare → Match → Deploy → Develop, auto-advancing until touched. */
export function Lifecycle() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!auto || reduce) return;
    const t = setInterval(() => setActive((a) => (a + 1) % LIFECYCLE.length), 4200);
    return () => clearInterval(t);
  }, [auto, reduce]);

  const step = LIFECYCLE[active];
  const Icon = ICONS[active];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div role="tablist" aria-label="The PEEPs model" className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LIFECYCLE.map((s, i) => {
          const StepIcon = ICONS[i];
          const on = i === active;
          return (
            <button
              key={s.key}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="lifecycle-panel"
              onClick={() => {
                setActive(i);
                setAuto(false);
              }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-left transition-colors sm:p-5",
                on ? "border-white/25 text-ink" : "border-white/10 text-white/80 hover:border-white/25 hover:bg-white/5",
              )}
            >
              {on && (
                <motion.span
                  layoutId="lifecycle-active"
                  className="absolute inset-0 -z-0 bg-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-between">
                <span className={cn("font-mono text-xs", on ? "text-ink/70" : "text-white/40")}>0{i + 1}</span>
                <StepIcon className={cn("size-5", on ? "text-ink" : "text-gold")} />
              </span>
              <span className="relative z-10 mt-6 block font-display text-xl font-medium sm:text-2xl">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div id="lifecycle-panel" role="tabpanel" aria-live="polite" className="min-h-56">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step.key}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-gold">
              <Icon className="size-6" />
            </div>
            <h3 className="font-display mt-5 text-3xl font-medium sm:text-4xl">{step.title}</h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/70">{step.body}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex gap-1.5" aria-hidden>
          {LIFECYCLE.map((s, i) => (
            <span
              key={s.key}
              className={cn("h-1 rounded-full transition-all duration-500", i === active ? "w-10 bg-gold" : "w-4 bg-white/20")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
