"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "./button";

interface DialogCtx {
  close: () => void;
}
const Ctx = React.createContext<DialogCtx | null>(null);

/** Optional: lets forms inside a dialog close it on success. */
export function useDialogClose(): (() => void) | null {
  return React.useContext(Ctx)?.close ?? null;
}

/**
 * Native <dialog> modal: the browser provides the focus trap, Esc to close
 * and an inert background. Server-component friendly (no function props).
 */
export function Dialog({
  trigger,
  triggerVariant = "outline",
  triggerSize = "sm",
  triggerClassName,
  title,
  description,
  children,
  className,
}: {
  trigger: React.ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const titleId = React.useId();

  React.useEffect(() => {
    if (mounted && ref.current && !ref.current.open) ref.current.showModal();
  }, [mounted]);

  const close = React.useCallback(() => ref.current?.close(), []);
  const ctx = React.useMemo(() => ({ close }), [close]);

  return (
    <Ctx.Provider value={ctx}>
      <button
        type="button"
        className={cn(buttonVariants({ variant: triggerVariant, size: triggerSize }), triggerClassName)}
        onClick={() => (mounted ? ref.current?.showModal() : setMounted(true))}
      >
        {trigger}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className={cn("peeps-dialog", className)}
        onClose={() => setMounted(false)}
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
      >
        {mounted && (
          <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h2 id={titleId} className="font-display text-xl font-semibold">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
              </div>
              <button
                type="button"
                onClick={close}
                className="-mr-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">{children}</div>
          </div>
        )}
      </dialog>
    </Ctx.Provider>
  );
}
