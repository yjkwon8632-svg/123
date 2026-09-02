export type GroupStatus = '정상' | '주의' | '위험';

/** 사육단계 — 현재일령으로 구분합니다. */
export type BreedingStage = '자돈' | '육성' | '비육' | '출하대기';

export interface Farm {
  id: string;
  name: string;
}

/** 엑셀 사육현황의 한 행(사육그룹)입니다. */
export interface BreedingGroup {
  id: string;
  plant: string;
  farmId: string;
  farmName: string;
  name: string;
  /** 저장위치(돈사 코드) */
  location: string;
  /** 돼지구분 — 자돈 / 비육돈 */
  pigType: string;
  inDate: string;
  inCount: number;
  inAgeDays: number;
  weightPerHead: number;
  initialCount: number;
  claimCount: number;
  currentAgeDays: number;
  deadCount: number;
  transferOutCount: number;
  soldCount: number;
  currentCount: number;
  survivalRate: number;
  sowFarmName: string;
  pigletFarmName: string;
  materialCode: string;
  materialName: string;
}

export interface FarmSummary {
  farm: Farm;
  plant: string;
  locations: string[];
  groupCount: number;
  currentCount: number;
  initialCount: number;
  deadCount: number;
  soldCount: number;
  survivalRate: number;
  mortalityRate: number;
  alertCount: number;
}
