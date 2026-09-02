import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, HeartPulse, Layers, PiggyBank, Truck } from 'lucide-react';
import type { BreedingGroup, Farm } from '../types';
import { snapshotDate } from '../data/breeding';
import { applyFilters, emptyFilters } from '../lib/filter';
import { formatNumber, summarizeFarm, totalsOf } from '../lib/stats';
import { StatTile } from './StatTile';
import { GroupFilters } from './GroupFilters';
import { GroupTable } from './GroupTable';
import { RankedBarChart } from './charts/RankedBarChart';

interface FarmDetailPageProps {
  farm: Farm;
  groups: BreedingGroup[];
  onBack: () => void;
}

export function FarmDetailPage({ farm, groups: allGroups, onBack }: FarmDetailPageProps) {
  const [filters, setFilters] = useState(emptyFilters);
  const groups = useMemo(() => allGroups.filter((g) => g.farmId === farm.id), [allGroups, farm.id]);
  const filtered = useMemo(() => applyFilters(groups, filters), [groups, filters]);

  const summary = summarizeFarm(farm, groups);
  const totals = totalsOf(groups);
  const pigTypes = [...new Set(groups.map((g) => g.pigType))];
  const sowFarms = [...new Set(groups.map((g) => g.sowFarmName).filter(Boolean))];
  const byGroup = [...groups]
    .sort((a, b) => b.currentCount - a.currentCount)
    .map((g) => ({ name: g.name.split('-').slice(-2).join('-'), value: g.currentCount }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <button
          onClick={onBack}
          className="mb-2 inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={13} />
          전체 사육현황
        </button>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{farm.name}</h2>
        <p className="text-sm text-[var(--text-muted)]">
          {snapshotDate} 기준 · 플랜트 {summary.plant} · 돈사 {summary.locations.join(', ') || '-'} · 사육그룹{' '}
          {summary.groupCount}개
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatTile
          label="현재 사육두수"
          value={formatNumber(summary.currentCount)}
          sub="두"
          icon={<PiggyBank size={18} />}
        />
        <StatTile
          label="평균 육성률"
          value={summary.survivalRate.toFixed(1)}
          sub="%"
          icon={<HeartPulse size={18} />}
          tone={summary.survivalRate >= 95 ? 'good' : summary.survivalRate >= 90 ? 'warning' : 'critical'}
        />
        <StatTile
          label="누적 폐사"
          value={formatNumber(summary.deadCount)}
          sub={`두 · ${summary.mortalityRate.toFixed(1)}%`}
          icon={<AlertTriangle size={18} />}
          tone={summary.mortalityRate > 5 ? 'critical' : 'default'}
        />
        <StatTile label="누적 판매" value={formatNumber(summary.soldCount)} sub="두" icon={<Truck size={18} />} />
        <StatTile
          label="주의·위험 그룹"
          value={formatNumber(summary.alertCount)}
          sub={`/ ${summary.groupCount}개`}
          icon={<Layers size={18} />}
          tone={summary.alertCount > 0 ? 'warning' : 'good'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">그룹별 현재 사육두수</h3>
          <div className="max-h-[380px] overflow-y-auto">
            <RankedBarChart data={byGroup} />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">농장 개요</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Row label="돼지구분" value={pigTypes.join(', ')} />
            <Row label="평균 현재일령" value={`${totals.avgAgeDays.toFixed(0)}일`} />
            <Row label="평균 두당체중" value={`${totals.avgWeight.toFixed(1)}kg`} />
            <Row label="누적 전입두수" value={`${formatNumber(totals.initialCount)}두`} />
            <Row label="클레임" value={`${formatNumber(totals.claimCount)}두`} />
            <Row label="번식농장" value={sowFarms.join(', ') || '-'} span />
          </dl>
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">사육그룹 현황</h3>
          <GroupFilters
            filters={filters}
            pigTypes={pigTypes}
            onChange={setFilters}
            resultCount={filtered.length}
            placeholder="그룹 · 돈사 검색"
          />
        </div>
        <GroupTable groups={filtered} />
      </section>
    </div>
  );
}

function Row({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : undefined}>
      <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-0.5 text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}
