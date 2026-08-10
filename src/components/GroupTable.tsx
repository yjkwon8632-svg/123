import type { BreedingGroup, Farm } from '../types';
import { FeedStockBar } from './FeedStockBar';
import { StatusBadge } from './StatusBadge';

interface GroupTableProps {
  groups: BreedingGroup[];
  farmsById?: Record<string, Farm>;
  showFarm?: boolean;
}

export function GroupTable({ groups, farmsById, showFarm }: GroupTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
            {showFarm && <th className="px-4 py-3 font-medium">농장</th>}
            <th className="px-4 py-3 font-medium">그룹명</th>
            <th className="px-4 py-3 font-medium">단계</th>
            <th className="px-4 py-3 font-medium text-right">두수</th>
            <th className="px-4 py-3 font-medium text-right">폐사율</th>
            <th className="px-4 py-3 font-medium">사료 재고</th>
            <th className="px-4 py-3 font-medium">출하 예정일</th>
            <th className="px-4 py-3 font-medium">상태</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]">
              {showFarm && (
                <td className="px-4 py-3 text-[var(--text-secondary)]">{farmsById?.[g.farmId]?.name ?? '-'}</td>
              )}
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{g.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{g.stage}</td>
              <td className="px-4 py-3 text-right tabular-nums text-[var(--text-primary)]">
                {g.headCount.toLocaleString('ko-KR')}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                {g.mortalityRate.toFixed(1)}%
              </td>
              <td className="px-4 py-3">
                <FeedStockBar pct={g.feedStockPct} />
              </td>
              <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">{g.expectedShipDate}</td>
              <td className="px-4 py-3">
                <StatusBadge status={g.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
