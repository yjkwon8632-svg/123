import { AlertTriangle, Building2, PiggyBank, TrendingUp } from 'lucide-react';
import { breedingGroups, farms, monthlyRecords } from '../data/farms';
import { StatTile } from './StatTile';
import { HeadcountBarChart } from './charts/HeadcountBarChart';
import { TrendLineChart } from './charts/TrendLineChart';
import { GroupTable } from './GroupTable';

const farmsById = Object.fromEntries(farms.map((f) => [f.id, f]));

export function OverviewPage() {
  const totalHeadcount = breedingGroups.reduce((sum, g) => sum + g.headCount, 0);
  const avgMortality =
    breedingGroups.reduce((sum, g) => sum + g.mortalityRate * g.headCount, 0) / totalHeadcount;
  const alertGroups = breedingGroups
    .filter((g) => g.status !== '정상')
    .sort((a) => (a.status === '위험' ? -1 : 1));

  const headcountByFarm = farms.map((f) => ({
    name: f.name.replace(' 농장', '').split(' ')[0],
    value: breedingGroups.filter((g) => g.farmId === f.id).reduce((s, g) => s + g.headCount, 0),
  }));

  const monthsOrder = Array.from(new Set(monthlyRecords.map((r) => r.month))).sort();
  const revenueTrend = monthsOrder.map((month) => ({
    month: month.slice(5),
    value: monthlyRecords.filter((r) => r.month === month).reduce((s, r) => s + r.revenue, 0),
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">전체 개요</h2>
        <p className="text-sm text-[var(--text-muted)]">{farms.length}개 농장의 실시간 사육 현황입니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="총 농장 수" value={`${farms.length}`} sub="개" icon={<Building2 size={18} />} />
        <StatTile
          label="총 사육두수"
          value={totalHeadcount.toLocaleString('ko-KR')}
          sub="두"
          icon={<PiggyBank size={18} />}
        />
        <StatTile
          label="평균 폐사율"
          value={avgMortality.toFixed(2)}
          sub="%"
          icon={<TrendingUp size={18} />}
          tone={avgMortality > 2 ? 'critical' : 'default'}
        />
        <StatTile
          label="주의·위험 그룹"
          value={`${alertGroups.length}`}
          sub={`/ ${breedingGroups.length}개 그룹`}
          icon={<AlertTriangle size={18} />}
          tone={alertGroups.length > 0 ? 'warning' : 'good'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="mb-4 text-sm font-medium text-[var(--text-secondary)]">농장별 사육두수</h3>
          <HeadcountBarChart data={headcountByFarm} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
          <h3 className="mb-4 text-sm font-medium text-[var(--text-secondary)]">월별 전체 매출 추이</h3>
          <TrendLineChart data={revenueTrend} unit="만원" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
          주의가 필요한 사육그룹 ({alertGroups.length})
        </h3>
        {alertGroups.length > 0 ? (
          <GroupTable groups={alertGroups} farmsById={farmsById} showFarm />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">현재 주의가 필요한 그룹이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
