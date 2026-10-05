import { formatValue, type ValueFormat } from "./scale";

/** The accessible table twin of a chart, tucked behind a disclosure. */
export function ChartTable({
  data,
  format = "number",
  labelHeader,
  valueHeader,
}: {
  data: { label: string; value: number }[];
  format?: ValueFormat;
  labelHeader: string;
  valueHeader: string;
}) {
  return (
    <details className="mt-4 text-xs">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View as table</summary>
      <table className="mt-2 w-full">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-1.5 font-medium">{labelHeader}</th>
            <th className="py-1.5 text-right font-medium">{valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label} className="border-b last:border-0">
              <td className="py-1.5">{d.label}</td>
              <td className="py-1.5 text-right tabular-nums">{formatValue(d.value, format)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
