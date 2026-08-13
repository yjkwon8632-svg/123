# 다중 농장 관리 대시보드

여러 축산 농장의 사육그룹, 두수, 생산·출하 실적, 사료 재고 현황을 한눈에 확인하는 대시보드입니다.

## 실행

```bash
npm install
npm run dev
```

## 구성

- 전체 개요: 농장 수 / 총 사육두수 / 평균 폐사율 / 주의·위험 그룹 등 핵심 지표, 농장별 두수 비교, 월별 매출 추이, 주의가 필요한 사육그룹 목록
- 농장별 상세: 농장 정보, 수용률, 폐사율, 사료 재고, 월별 출하량·매출 추이, 사육그룹 현황 테이블
- 주간활동: 주간보고 엑셀의 최근 시트에서 뽑은 담당자별 주차 진척사항 (week_of / person / sheet / item / prev_week / this_week / note)

## 주간활동 데이터 갱신

```bash
pip install openpyxl
python3 scripts/extract_weekly_activity.py 권영제 ~/주간보고.xlsx 2026-08-10
```

`data/weekly_activity_<담당자명>.csv` 가 갱신되고, 대시보드는 이 CSV 를 그대로 읽어
가장 최근 주차만 화면에 보여줍니다(과거 시트는 표시하지 않음).

현재는 `src/data/farms.ts`의 목업 데이터로 동작하며, 이후 실제 데이터 소스(DB/API)로 교체할 수 있도록 `src/types`로 데이터 모델을 분리해 두었습니다.
