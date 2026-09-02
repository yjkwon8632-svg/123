import type { BreedingGroup, BreedingStage, Farm, FarmSummary, GroupStatus } from '../types';

/** 육성률 기준 — 95% 이상 정상, 90% 이상 주의, 그 미만 위험 */
export function statusOf(group: BreedingGroup): GroupStatus {
  if (group.survivalRate >= 95) return '정상';
  if (group.survivalRate >= 90) return '주의';
  return '위험';
}

export const stageOrder: BreedingStage[] = ['자돈', '육성', '비육', '출하대기'];

/** 현재일령으로 사육단계를 구분합니다. */
export function stageOf(group: BreedingGroup): BreedingStage {
  if (group.currentAgeDays < 70) return '자돈';
  if (group.currentAgeDays < 120) return '육성';
  if (group.currentAgeDays < 180) return '비육';
  return '출하대기';
}

export function mortalityRateOf(group: BreedingGroup): number {
  return group.initialCount > 0 ? (group.deadCount / group.initialCount) * 100 : 0;
}

export interface Totals {
  groupCount: number;
  farmCount: number;
  currentCount: number;
  initialCount: number;
  deadCount: number;
  soldCount: number;
  claimCount: number;
  /** 최초두수 가중 평균 육성률 */
  survivalRate: number;
  mortalityRate: number;
  avgWeight: number;
  avgAgeDays: number;
  alertCount: number;
}

export function totalsOf(groups: BreedingGroup[]): Totals {
  const currentCount = sum(groups, (g) => g.currentCount);
  const initialCount = sum(groups, (g) => g.initialCount);
  const deadCount = sum(groups, (g) => g.deadCount);
  const weightBase = currentCount || 1;
  return {
    groupCount: groups.length,
    farmCount: new Set(groups.map((g) => g.farmId)).size,
    currentCount,
    initialCount,
    deadCount,
    soldCount: sum(groups, (g) => g.soldCount),
    claimCount: sum(groups, (g) => g.claimCount),
    survivalRate: initialCount > 0 ? sum(groups, (g) => g.survivalRate * g.initialCount) / initialCount : 0,
    mortalityRate: initialCount > 0 ? (deadCount / initialCount) * 100 : 0,
    avgWeight: sum(groups, (g) => g.weightPerHead * g.currentCount) / weightBase,
    avgAgeDays: sum(groups, (g) => g.currentAgeDays * g.currentCount) / weightBase,
    alertCount: groups.filter((g) => statusOf(g) !== '정상').length,
  };
}

export function summarizeFarm(farm: Farm, groups: BreedingGroup[]): FarmSummary {
  const t = totalsOf(groups);
  return {
    farm,
    plant: groups[0]?.plant ?? '',
    locations: unique(groups.map((g) => g.location)),
    groupCount: t.groupCount,
    currentCount: t.currentCount,
    initialCount: t.initialCount,
    deadCount: t.deadCount,
    soldCount: t.soldCount,
    survivalRate: t.survivalRate,
    mortalityRate: t.mortalityRate,
    alertCount: t.alertCount,
  };
}

export function summarizeFarms(farms: Farm[], groups: BreedingGroup[]): FarmSummary[] {
  return farms
    .map((farm) =>
      summarizeFarm(
        farm,
        groups.filter((g) => g.farmId === farm.id),
      ),
    )
    .filter((s) => s.groupCount > 0);
}

/** 사육단계별 두수 — 자돈 → 출하대기 순으로 고정합니다. */
export function stageDistribution(groups: BreedingGroup[]) {
  return stageOrder.map((stage) => {
    const inStage = groups.filter((g) => stageOf(g) === stage);
    return {
      name: stage,
      value: sum(inStage, (g) => g.currentCount),
      groupCount: inStage.length,
    };
  });
}

/** 전입월별 전입두수 — 오래된 달부터 정렬합니다. */
export function monthlyInflow(groups: BreedingGroup[]) {
  const byMonth = new Map<string, number>();
  for (const g of groups) {
    const month = g.inDate.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + g.inCount);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month: `${Number(month.slice(5))}월`, value }));
}

export function sum<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((acc, item) => acc + pick(item), 0);
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
