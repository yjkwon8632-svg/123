export function FeedStockBar({ pct }: { pct: number }) {
  const color = pct < 20 ? 'var(--status-critical)' : pct < 40 ? 'var(--status-warning)' : 'var(--status-good)';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-9 text-xs tabular-nums text-[var(--text-secondary)]">{pct}%</span>
    </div>
  );
}
