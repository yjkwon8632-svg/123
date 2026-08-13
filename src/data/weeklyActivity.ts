import type { WeeklyActivity } from '../types';
// scripts/extract_weekly_activity.py 가 갱신하는 CSV 를 그대로 읽는다.
// 목업 TS 데이터와 같이 번들에 정적으로 포함되므로 런타임 fetch 는 필요 없다.
import csvRaw from '../../data/weekly_activity_권영제.csv?raw';

/** 따옴표 안의 줄바꿈·쉼표·이스케이프된 따옴표를 살려서 CSV 를 행/열로 나눈다. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function toActivities(text: string): WeeklyActivity[] {
  // 파이썬 스크립트가 utf-8-sig 로 저장하므로 BOM 을 걷어낸다.
  const rows = parseCsv(text.replace(/^﻿/, ''));
  if (rows.length === 0) return [];

  const header = rows[0].map((name) => name.trim());
  const indexOf = (name: string) => header.indexOf(name);
  const cols = {
    weekOf: indexOf('week_of'),
    person: indexOf('person'),
    sheet: indexOf('sheet'),
    item: indexOf('item'),
    prevWeek: indexOf('prev_week'),
    thisWeek: indexOf('this_week'),
    note: indexOf('note'),
  };

  const cell = (row: string[], col: number) => (col >= 0 ? (row[col] ?? '') : '');

  return rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ''))
    .map((row) => ({
      weekOf: cell(row, cols.weekOf),
      person: cell(row, cols.person),
      sheet: cell(row, cols.sheet),
      item: cell(row, cols.item),
      prevWeek: cell(row, cols.prevWeek),
      thisWeek: cell(row, cols.thisWeek),
      note: cell(row, cols.note),
    }));
}

const allActivities: WeeklyActivity[] = toActivities(csvRaw);

/** 가장 최근 주차. 과거 주차는 화면에서 다루지 않는다. */
export const latestWeekOf: string = allActivities.reduce(
  (latest, activity) => (activity.weekOf > latest ? activity.weekOf : latest),
  '',
);

/** 최근 주차(=최근 시트)의 진척사항만 추린 목록. */
export const weeklyActivities: WeeklyActivity[] = allActivities.filter(
  (activity) => activity.weekOf === latestWeekOf,
);

/** 최근 주차가 어느 시트에서 나왔는지 (예: 26년8월2주). */
export const latestSheet: string = weeklyActivities[0]?.sheet ?? '';
