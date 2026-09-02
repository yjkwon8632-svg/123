import type { BreedingGroup, Farm } from '../types';
import { managedFarmNames } from '../data/managedFarms';

/** 화면에 담을 농장 범위 — 관리 농장만 볼지, 전체 농장을 볼지 */
export type Scope = 'managed' | 'all';

const managed = new Set(managedFarmNames);

export function isManaged(group: BreedingGroup): boolean {
  return managed.has(group.farmName);
}

export function groupsInScope(groups: BreedingGroup[], scope: Scope): BreedingGroup[] {
  return scope === 'managed' ? groups.filter(isManaged) : groups;
}

export function farmsInScope(farms: Farm[], groups: BreedingGroup[]): Farm[] {
  const withGroups = new Set(groups.map((g) => g.farmId));
  return farms.filter((f) => withGroups.has(f.id));
}
