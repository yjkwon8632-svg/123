import type { ReactNode } from 'react';

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  tone?: 'default' | 'good' | 'warning' | 'critical';
}

const toneStyles: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: 'text-[var(--text-primary)]',
  good: 'text-[var(--status-good-text)]',
  warning: 'text-[var(--status-warning)]',
  critical: 'text-[var(--status-critical)]',
};

export function StatTile({ label, value, sub, icon, tone = 'default' }: StatTileProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-muted)]">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-semibold tabular-nums ${toneStyles[tone]}`}>{value}</span>
        {sub && <span className="text-xs text-[var(--text-muted)]">{sub}</span>}
      </div>
    </div>
  );
}
