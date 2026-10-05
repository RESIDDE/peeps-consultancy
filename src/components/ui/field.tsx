import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./input";
import { FieldError } from "./action-form";

/** Label + control + hint, with server-action field errors when `name` is given. */
export function Field({
  label,
  htmlFor,
  name,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  name?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <Label htmlFor={htmlFor ?? name}>
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {name && <FieldError name={name} />}
    </div>
  );
}
