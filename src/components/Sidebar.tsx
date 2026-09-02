import { useState } from 'react';
import { LayoutGrid, PiggyBank, Search } from 'lucide-react';
import type { FarmSummary } from '../types';
import type { Scope } from '../lib/scope';
import { formatNumber } from '../lib/stats';

interface SidebarProps {
  summaries: FarmSummary[];
  selected: string;
  onSelect: (id: string) => void;
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  scopeFarmCount: Record<Scope, number>;
  snapshotDate: string;
  totalCount: number;
}

const scopeLabel: Record<Scope, string> = { managed: '관리 농장', all: '전체 농장' };

export function Sidebar({
  summaries,
  selected,
  onSelect,
  scope,
  onScopeChange,
  scopeFarmCount,
  snapshotDate,
  totalCount,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const visible = summaries.filter((s) => s.farm.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-1)]">
      <div className="border-b border-[var(--border)] p-4">
        <h1 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <PiggyBank size={18} className="text-[var(--series-1)]" />
          사육현황 대시보드
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {snapshotDate} 기준 · 총 {formatNumber(totalCount)}두
        </p>
      </div>

      <div className="flex gap-1 border-b border-[var(--border)] p-3">
        {(['managed', 'all'] as Scope[]).map((key) => (
          <button
            key={key}
            onClick={() => onScopeChange(key)}
            aria-pressed={scope === key}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
              scope === key
                ? 'border-[var(--series-1)] bg-[var(--series-1)] text-white'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {scopeLabel[key]} {scopeFarmCount[key]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <button
          onClick={() => onSelect('overview')}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
            selected === 'overview'
              ? 'bg-[var(--series-1)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <LayoutGrid size={16} />
          전체 개요
        </button>

        <label className="relative mt-3">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="농장 검색"
            aria-label="농장 검색"
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-3)] pr-3 pl-8 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--series-1)] focus:outline-none"
          />
        </label>
      </div>

      <div className="mb-1 px-6 text-xs font-medium text-[var(--text-muted)]">농장 {visible.length}개</div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {visible.map((s) => {
          const active = selected === s.farm.id;
          return (
            <button
              key={s.farm.id}
              onClick={() => onSelect(s.farm.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? 'bg-[var(--series-1)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <span className="flex-1 truncate">{s.farm.name}</span>
              {s.alertCount > 0 && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: active ? '#fff' : 'var(--status-warning)' }}
                  title={`주의·위험 ${s.alertCount}개 그룹`}
                />
              )}
              <span
                className={`shrink-0 tabular-nums text-xs ${
                  active ? 'text-white/80' : 'text-[var(--text-muted)]'
                }`}
              >
                {formatNumber(s.currentCount)}
              </span>
            </button>
          );
        })}
        {visible.length === 0 && (
          <p className="px-3 py-4 text-xs text-[var(--text-muted)]">검색 결과가 없습니다.</p>
        )}
      </nav>
    </aside>
  );
}
