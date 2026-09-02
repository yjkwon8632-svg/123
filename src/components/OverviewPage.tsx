import { useMemo, useState } from 'react';
import { AlertTriangle, Building2, HeartPulse, Layers, PiggyBank, Truck } from 'lucide-react';
import { breedingGroups, farms, snapshotDate } from '../data/breeding';
import { applyFilters, emptyFilters } from '../lib/filter';
import { formatNumber, monthlyInflow, stageDistribution, summarizeFarms, totalsOf } from '../lib/stats';
import { StatTile } from './StatTile';
import { GroupFilters } from './GroupFilters';
import { GroupTable } from './GroupTable';
import { HeadcountBarChart } from './charts/HeadcountBarChart';
import { RankedBarChart } from './charts/RankedBarChart';
import { TrendLineChart } from './charts/TrendLineChart';

const pigTypes = [...new Set(breedingGroups.map((g) => g.pigType))];


export function OverviewPage({ onSelectFarm }: { onSelectFarm: (farmId: string) => void }) {
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => applyFilters(breedingGroups, filters), [filters]);

  const totals = totalsOf(breedingGroups);
  const farmSummaries = summarizeFarms(farms, breedingGroups);
  const byFarm = [...farmSummaries]
    .sort((a, b) => b.currentCount - a.currentCount)
    .map((s) => ({ name: s.farm.name, value: s.currentCount }));
  const byStage = stageDistribution(breedingGroups);
  const inflow = monthlyInflow(breedingGroups);
  const nameToId = new Map(farms.map((f) => [f.name, f.id]));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">전체 사육현황</h2>
        <p className="text-sm text-[var(--text-muted)]">
          {snapshotDate} 기준 · 농장 {totals.farmCount}개 · 사육그룹 {totals.groupCount}개
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label="현재 사육두수"
          value={formatNumber(totals.currentCount)}
          sub="두"
          icon={<PiggyBank size={18} />}
        />
        <StatTile label="사육그룹" value={formatNumber(totals.groupCount)} sub="개" icon={<Layers size={18} />} />
        <StatTile label="농장" value={formatNumber(totals.farmCount)} sub="개" icon={<Building2 size={18} />} />
        <StatTile
          label="평균 육성률"
          value={totals.survivalRate.toFixed(1)}
          sub="%"
          icon={<HeartPulse size={18} />}
          tone={totals.survivalRate >= 95 ? 'good' : 'warning'}
        />
        <StatTile
          label="누적 폐사"
          value={formatNumber(totals.deadCount)}
          sub={`두 · ${totals.mortalityRate.toFixed(1)}%`}
          icon={<AlertTriangle size={18} />}
          tone={totals.mortalityRate > 5 ? 'critical' : 'default'}
        />
        <StatTile label="누적 판매" value={formatNumber(totals.soldCount)} sub="두" icon={<Truck size={18} />} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">농장별 현재 사육두수</h3>
          <p className="mt-1 mb-3 text-xs text-[var(--text-muted)]">
            사육두수 순 {byFarm.length}개 농장 · 막대를 누르면 농장 상세로 이동합니다
          </p>
          <RankedBarChart
            data={byFarm}
            rowHeight={20}
            onSelect={(name) => {
              const id = nameToId.get(name);
              if (id) onSelectFarm(id);
            }}
          />
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
            <h3 className="mb-1 text-sm font-medium text-[var(--text-secondary)]">사육단계별 두수</h3>
            <p className="mb-3 text-xs text-[var(--text-muted)]">
              현재일령 기준 · 자돈 70일 미만, 육성 120일 미만, 비육 180일 미만
            </p>
            <HeadcountBarChart data={byStage} showValues />
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
            <h3 className="mb-1 text-sm font-medium text-[var(--text-secondary)]">월별 전입두수</h3>
            <p className="mb-3 text-xs text-[var(--text-muted)]">그룹 전입일 기준 입식 물량입니다</p>
            <TrendLineChart data={inflow} unit="두" />
          </section>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            사육그룹 목록
            <span className="ml-2 text-xs text-[var(--text-muted)]">
              주의·위험 {totals.alertCount}개 / 전체 {totals.groupCount}개
            </span>
          </h3>
          <GroupFilters
            filters={filters}
            pigTypes={pigTypes}
            onChange={setFilters}
            resultCount={filtered.length}
          />
        </div>
        <GroupTable groups={filtered} showFarm />
      </section>
    </div>
  );
}
