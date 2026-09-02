import type { BreedingGroup } from '../types';
import { statusOf } from './stats';

export interface Filters {
  query: string;
  pigType: string;
  status: string;
}

export const emptyFilters: Filters = { query: '', pigType: '전체', status: '전체' };

export function applyFilters(groups: BreedingGroup[], filters: Filters): BreedingGroup[] {
  const query = filters.query.trim().toLowerCase();
  return groups.filter((g) => {
    if (filters.pigType !== '전체' && g.pigType !== filters.pigType) return false;
    if (filters.status !== '전체' && statusOf(g) !== filters.status) return false;
    if (!query) return true;
    return [g.farmName, g.name, g.location, g.sowFarmName, g.pigletFarmName, g.materialName]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}
