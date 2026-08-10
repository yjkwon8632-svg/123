import { Beef, Bird, LayoutGrid, PiggyBank } from 'lucide-react';
import type { Farm, FarmType } from '../types';

const typeIcon: Record<FarmType, typeof Beef> = {
  한우: Beef,
  양돈: PiggyBank,
  산란계: Bird,
  육계: Bird,
};

interface SidebarProps {
  farms: Farm[];
  selected: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ farms, selected, onSelect }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-1 border-r border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="mb-4 px-2">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">농장 관리 대시보드</h1>
        <p className="text-xs text-[var(--text-muted)]">전국 축산 농장 통합 현황</p>
      </div>

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

      <div className="mt-4 mb-1 px-3 text-xs font-medium text-[var(--text-muted)]">농장 목록</div>
      {farms.map((farm) => {
        const Icon = typeIcon[farm.type];
        const active = selected === farm.id;
        return (
          <button
            key={farm.id}
            onClick={() => onSelect(farm.id)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              active
                ? 'bg-[var(--series-1)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
            }`}
          >
            <Icon size={16} />
            <span className="flex-1 truncate">{farm.name}</span>
          </button>
        );
      })}
    </aside>
  );
}
