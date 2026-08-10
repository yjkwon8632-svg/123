import { Gauge, MapPin, PiggyBank, TrendingUp, User, Wheat } from 'lucide-react';
import { breedingGroups, monthlyRecords } from '../data/farms';
import type { Farm } from '../types';
import { StatTile } from './StatTile';
import { TrendLineChart } from './charts/TrendLineChart';
import { GroupTable } from './GroupTable';

export function FarmDetailPage({ farm }: { farm: Farm }) {
  const groups = breedingGroups.filter((g) => g.farmId === farm.id);
  const totalHeadcount = groups.reduce((sum, g) => sum + g.headCount, 0);
  const avgMortality = groups.reduce((sum, g) => sum + g.mortalityRate * g.headCount, 0) / totalHeadcount;
  const avgFeedStock = groups.reduce((sum, g) => sum + g.feedStockPct, 0) / groups.length;
  const utilization = (totalHeadcount / farm.capacity) * 100;

  const records = monthlyRecords
    .filter((r) => r.farmId === farm.id)
    .sort((a, b) => a.month.localeCompare(b.month));
  const shipmentTrend = records.map((r) => ({ month: r.month.slice(5), value: r.shipped }));
  const revenueTrend = records.map((r) => ({ month: r.month.slice(5), value: r.revenue }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{farm.name}</h2>
          <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
            {farm.type}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {farm.region}
          </span>
          <span className="flex items-center gap-1">
            <User size={14} /> 담당자 {farm.manager}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="총 사육두수"
          value={totalHeadcount.toLocaleString('ko-KR')}
          sub={`/ ${farm.capacity.toLocaleString('ko-KR')} 두`}
          icon={<PiggyBank size={18} />}
        />
        <StatTile
          label="수용률"
          value={utilization.toFixed(0)}
          sub="%"
          icon={<Gauge size={18} />}
          tone={utilization > 95 ? 'warning' : 'default'}
        />
        <StatTile
          label="평균 폐사율"
          value={avgMortality.toFixed(2)}
          sub="%"
          icon={<TrendingUp size={18} />}
          tone={avgMortality > 2 ? 'critical' : 'default'}
        />
        <StatTile
          label="평균 사료 재고"
          value={avgFeedStock.toFixed(0)}
          sub="%"
          icon={<Wheat size={18} />}
          tone={avgFeedStock < 30 ? 'critical' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="mb-4 text-sm font-medium text-[var(--text-secondary)]">월별 출하량 추이</h3>
          <TrendLineChart data={shipmentTrend} unit="두" color="var(--series-3)" />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="mb-4 text-sm font-medium text-[var(--text-secondary)]">월별 매출 추이</h3>
          <TrendLineChart data={revenueTrend} unit="만원" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">사육그룹 현황 ({groups.length})</h3>
        <GroupTable groups={groups} />
      </div>
    </div>
  );
}
