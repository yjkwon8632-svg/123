import type { GroupStatus } from '../types';

const barColor: Record<GroupStatus, string> = {
  정상: 'var(--status-good)',
  주의: 'var(--status-warning)',
  위험: 'var(--status-critical)',
};

/** 육성률(85~100%) 구간을 채워 보여주는 미니 게이지입니다. */
export function RateBar({ rate, status }: { rate: number; status: GroupStatus }) {
  const pct = Math.max(0, Math.min(100, ((rate - 85) / 15) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 shrink-0 rounded-full bg-[var(--border-strong)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor[status] }} />
      </div>
      <span className="tabular-nums text-[var(--text-secondary)]">{rate.toFixed(1)}%</span>
    </div>
  );
}
