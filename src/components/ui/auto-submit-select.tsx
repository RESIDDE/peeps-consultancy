"use client";

import { Select } from "./input";

/** A <select> that submits its form on change (progressive: falls back to a form button). */
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <Select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
