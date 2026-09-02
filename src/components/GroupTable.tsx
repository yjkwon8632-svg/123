import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { BreedingGroup } from '../types';
import { formatNumber, mortalityRateOf, stageOf, statusOf } from '../lib/stats';
import { RateBar } from './RateBar';
import { StatusBadge } from './StatusBadge';

type SortKey = 'farmName' | 'name' | 'currentAgeDays' | 'currentCount' | 'deadCount' | 'soldCount' | 'survivalRate';

interface Column {
  key: SortKey | null;
  label: string;
  align?: 'right';
}

/** 그룹명(농장-농장-2026-005)에서 식별에 필요한 뒷부분만 남깁니다. */
function shortName(name: string): string {
  const parts = name.split('-');
  return parts.length > 2 ? parts.slice(-2).join('-') : name;
}

export function GroupTable({ groups, showFarm = false }: { groups: BreedingGroup[]; showFarm?: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>('currentCount');
  const [desc, setDesc] = useState(true);

  const columns: Column[] = [
    ...(showFarm ? [{ key: 'farmName' as const, label: '농장' }] : []),
    { key: 'name', label: '그룹' },
    { key: null, label: '돈사' },
    { key: null, label: '단계' },
    { key: null, label: '전입일' },
    { key: 'currentAgeDays', label: '현재일령', align: 'right' },
    { key: null, label: '두당체중', align: 'right' },
    { key: 'currentCount', label: '현재고', align: 'right' },
    { key: 'deadCount', label: '폐사', align: 'right' },
    { key: 'soldCount', label: '판매', align: 'right' },
    { key: 'survivalRate', label: '육성률' },
    { key: null, label: '상태' },
  ];

  const sorted = useMemo(() => {
    const dir = desc ? -1 : 1;
    return [...groups].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x).localeCompare(String(y), 'ko-KR') * dir;
    });
  }, [groups, sortKey, desc]);

  function toggle(key: SortKey) {
    if (key === sortKey) {
      setDesc((d) => !d);
    } else {
      setSortKey(key);
      setDesc(true);
    }
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center text-sm text-[var(--text-muted)]">
        조건에 맞는 사육그룹이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
      <table className="w-full min-w-[1040px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
            {columns.map((col) => (
              <th
                key={col.label}
                className={`px-3 py-3 font-medium whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.key ? (
                  <button
                    onClick={() => toggle(col.key as SortKey)}
                    className={`inline-flex items-center gap-1 hover:text-[var(--text-primary)] ${
                      sortKey === col.key ? 'text-[var(--text-primary)]' : ''
                    }`}
                  >
                    {col.label}
                    {sortKey === col.key &&
                      (desc ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((g) => {
            const status = statusOf(g);
            return (
              <tr
                key={g.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
              >
                {showFarm && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-[var(--text-secondary)]">{g.farmName}</td>
                )}
                <td className="px-3 py-2.5 font-medium whitespace-nowrap text-[var(--text-primary)]" title={g.name}>
                  {shortName(g.name)}
                </td>
                <td className="px-3 py-2.5 text-[var(--text-secondary)]">{g.location}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-[var(--text-secondary)]">
                  {stageOf(g)}
                  <span className="ml-1 text-xs text-[var(--text-muted)]">({g.pigType})</span>
                </td>
                <td className="px-3 py-2.5 tabular-nums whitespace-nowrap text-[var(--text-secondary)]">{g.inDate}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">
                  {g.currentAgeDays}일
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">
                  {g.weightPerHead.toFixed(1)}kg
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium text-[var(--text-primary)]">
                  {formatNumber(g.currentCount)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">
                  {formatNumber(g.deadCount)}
                  <span className="ml-1 text-xs text-[var(--text-muted)]">
                    ({mortalityRateOf(g).toFixed(1)}%)
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">
                  {formatNumber(g.soldCount)}
                </td>
                <td className="px-3 py-2.5">
                  <RateBar rate={g.survivalRate} status={status} />
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
