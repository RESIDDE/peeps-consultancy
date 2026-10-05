/** PEEPs Candidate IDs: PEP-<SECTOR>-<6-digit sequence>, e.g. PEP-ACC-001245. */

const PATTERN = /^PEP-([A-Z]{3})-(\d{6})$/;

export function formatPepId(code: string, n: number): string {
  return `PEP-${code}-${String(n).padStart(6, "0")}`;
}

export function parsePepId(id: string): { code: string; n: number } | null {
  const m = PATTERN.exec(id);
  return m ? { code: m[1], n: Number(m[2]) } : null;
}

/** Next ID for a sector, given the IDs already issued (any sector). */
export function nextPepId(code: string, existing: string[]): string {
  let max = 0;
  for (const id of existing) {
    const p = parsePepId(id);
    if (p && p.code === code && p.n > max) max = p.n;
  }
  return formatPepId(code, max + 1);
}
