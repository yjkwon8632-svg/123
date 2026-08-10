interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { value: number; name: string; color: string }[];
  formatter?: (value: number) => string;
}

export function ChartTooltip({ active, label, payload, formatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-medium text-[var(--text-primary)]">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="tabular-nums">
            {formatter ? formatter(entry.value) : entry.value.toLocaleString('ko-KR')}
          </span>
        </div>
      ))}
    </div>
  );
}
