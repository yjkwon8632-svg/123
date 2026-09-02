import { Search } from 'lucide-react';
import type { GroupStatus } from '../types';
import type { Filters } from '../lib/filter';

const statusOptions: (GroupStatus | '전체')[] = ['전체', '정상', '주의', '위험'];

interface GroupFiltersProps {
  filters: Filters;
  pigTypes: string[];
  onChange: (next: Filters) => void;
  resultCount: number;
  placeholder?: string;
}

/** 표 위에 한 줄로 놓이는 검색 · 구분 · 상태 필터입니다. */
export function GroupFilters({
  filters,
  pigTypes,
  onChange,
  resultCount,
  placeholder = '농장 · 그룹 · 돈사 검색',
}: GroupFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative">
        <Search
          size={14}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden
        />
        <input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder={placeholder}
          aria-label="사육그룹 검색"
          className="h-9 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] pr-3 pl-8 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--series-1)] focus:outline-none"
        />
      </label>

      <select
        value={filters.pigType}
        onChange={(e) => onChange({ ...filters, pigType: e.target.value })}
        aria-label="돼지구분"
        className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--series-1)] focus:outline-none"
      >
        {['전체', ...pigTypes].map((type) => (
          <option key={type} value={type}>
            {type === '전체' ? '전체 구분' : type}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-1">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => onChange({ ...filters, status })}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filters.status === status
                ? 'bg-[var(--series-1)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <span className="text-xs text-[var(--text-muted)]">{resultCount}개 그룹</span>
    </div>
  );
}
