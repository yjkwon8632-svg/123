export type FarmType = '한우' | '양돈' | '산란계' | '육계';

export type GroupStatus = '정상' | '주의' | '위험';

export interface Farm {
  id: string;
  name: string;
  region: string;
  manager: string;
  type: FarmType;
  capacity: number;
}

export interface BreedingGroup {
  id: string;
  farmId: string;
  name: string;
  stage: string;
  headCount: number;
  startDate: string;
  expectedShipDate: string;
  mortalityRate: number;
  feedStockPct: number;
  status: GroupStatus;
}

export interface WeeklyActivity {
  weekOf: string;
  person: string;
  sheet: string;
  item: string;
  prevWeek: string;
  thisWeek: string;
  note: string;
}

export interface MonthlyRecord {
  month: string;
  farmId: string;
  shipped: number;
  revenue: number;
}
