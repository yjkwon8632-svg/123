#!/usr/bin/env python3
"""주간보고 엑셀에서 담당자의 주차별 진척사항을 뽑아 CSV로 반영한다.

사용법:
    python3 scripts/extract_weekly_activity.py <담당자명> <엑셀경로> <weekOf>

예시:
    python3 scripts/extract_weekly_activity.py 권영제 ~/주간보고.xlsx 2026-08-10

엑셀은 주차별로 시트가 하나씩 있는 형태를 전제로 한다.

    시트명 : 26년8월2주
    3행    : 권영제 8월 2주 주간보고
    5행    : 농장명 | 전주 진척사항 | 금주 진척사항 | 비고   (초기 시트는 '농장명' 대신 '이슈사항')
    6행~   : 항목별 내용, 빈 행은 구역 구분

weekOf(YYYY-MM-DD)로 시트를 찾고, 결과를
data/weekly_activity_<담당자명>.csv 에 저장한다. 같은 weekOf 로 다시 실행하면
그 주차 행만 새 내용으로 교체되고 다른 주차 기록은 그대로 남는다.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import re
import sys
import unicodedata
from pathlib import Path

try:
    from openpyxl import load_workbook
except ImportError:  # pragma: no cover - 실행 환경 안내용
    sys.exit("openpyxl 이 필요합니다: pip install openpyxl")

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"

# 출력 CSV 의 컬럼 순서
FIELDNAMES = ["week_of", "person", "sheet", "item", "prev_week", "this_week", "note"]

# 헤더 행을 찾을 때 쓰는 표식. 1열은 표기가 '농장명'/'이슈사항'으로 갈린다.
ITEM_HEADERS = ("농장명", "이슈사항", "구분", "항목")
PREV_HEADERS = ("전주 진척사항", "전주진척사항", "전주")
THIS_HEADERS = ("금주 진척사항", "금주진척사항", "금주")
NOTE_HEADERS = ("비고", "특이사항")

HEADER_SCAN_ROWS = 15


def normalize(value: object) -> str:
    """비교용으로 공백·기호를 걷어낸 문자열을 만든다."""
    if value is None:
        return ""
    text = unicodedata.normalize("NFKC", str(value))
    return re.sub(r"[\s()\[\]/·.\-_,]+", "", text).lower()


def cell_text(value: object) -> str:
    """셀 값을 CSV 에 넣을 문자열로 바꾼다."""
    if value is None:
        return ""
    if isinstance(value, dt.datetime):
        return value.strftime("%Y-%m-%d %H:%M" if (value.hour or value.minute) else "%Y-%m-%d")
    if isinstance(value, dt.date):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    # 셀 안의 줄바꿈은 살리되 줄 끝 공백과 앞뒤 빈 줄은 정리한다.
    lines = [line.rstrip() for line in str(value).replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    return "\n".join(lines).strip()


def sheet_name_for(week_of: dt.date) -> str:
    """weekOf 에 해당하는 시트 이름을 만든다 (예: 2026-08-10 -> 26년8월2주)."""
    week_index = (week_of.day - 1) // 7 + 1
    return f"{week_of.year % 100}년{week_of.month}월{week_index}주"


def pick_sheet(workbook, week_of: dt.date, explicit: str | None):
    """weekOf 또는 --sheet 로 대상 시트를 고른다."""
    wanted = normalize(explicit) if explicit else normalize(sheet_name_for(week_of))
    for sheet in workbook.worksheets:
        if normalize(sheet.title) == wanted:
            return sheet
    label = explicit if explicit else f"{sheet_name_for(week_of)} (weekOf {week_of.isoformat()})"
    sys.exit(f"시트를 찾을 수 없습니다: {label}\n있는 시트: {', '.join(workbook.sheetnames)}")


def find_header(rows: list[tuple]) -> tuple[int, dict[str, int]]:
    """헤더 행 번호와 필드 → 열 인덱스 매핑을 찾는다."""
    for row_idx, row in enumerate(rows[:HEADER_SCAN_ROWS]):
        mapping: dict[str, int] = {}
        for col_idx, value in enumerate(row):
            key = normalize(value)
            if not key:
                continue
            for field, aliases in (
                ("item", ITEM_HEADERS),
                ("prev_week", PREV_HEADERS),
                ("this_week", THIS_HEADERS),
                ("note", NOTE_HEADERS),
            ):
                if field not in mapping and any(key == normalize(alias) for alias in aliases):
                    mapping[field] = col_idx
        if "item" in mapping and "this_week" in mapping:
            return row_idx, mapping
    sys.exit("'농장명/이슈사항 · 전주 진척사항 · 금주 진척사항' 헤더 행을 찾지 못했습니다.")


def find_title(rows: list[tuple], header_idx: int) -> str:
    """헤더 위쪽에서 '... 주간보고' 제목 줄을 찾는다."""
    for row in rows[:header_idx]:
        for value in row:
            text = cell_text(value)
            if "주간보고" in text:
                return text
    return ""


def extract(sheet, keep_empty: bool) -> list[dict[str, str]]:
    """시트 하나에서 항목별 진척사항을 뽑아낸다."""
    rows = list(sheet.iter_rows(values_only=True))
    header_idx, mapping = find_header(rows)

    records: list[dict[str, str]] = []
    for row in rows[header_idx + 1 :]:
        values = {
            field: cell_text(row[col]) if col < len(row) else "" for field, col in mapping.items()
        }
        item = values.get("item", "")
        if not item:
            # 구역을 나누는 빈 행, 또는 표 아래 여백
            continue

        record = {field: values.get(field, "") for field in ("item", "prev_week", "this_week", "note")}
        if not keep_empty and not any(record[field] for field in ("prev_week", "this_week", "note")):
            # 아직 내용이 채워지지 않은 항목 행
            continue
        records.append(record)

    return records


def read_existing(csv_path: Path) -> list[dict[str, str]]:
    if not csv_path.exists():
        return []
    with csv_path.open(encoding="utf-8-sig", newline="") as handle:
        return [{field: row.get(field, "") or "" for field in FIELDNAMES} for row in csv.DictReader(handle)]


def write_csv(csv_path: Path, rows: list[dict[str, str]]) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


def parse_week_of(value: str) -> dt.date:
    try:
        return dt.date.fromisoformat(value)
    except ValueError:
        sys.exit(f"weekOf 는 YYYY-MM-DD 형식이어야 합니다: {value}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="주간보고 엑셀에서 담당자의 주차별 진척사항을 뽑아 "
        "data/weekly_activity_<담당자명>.csv 에 반영한다.",
    )
    parser.add_argument("person", help="담당자명 (예: 권영제)")
    parser.add_argument("excel_path", help="주간보고 엑셀 파일 경로")
    parser.add_argument("week_of", help="주차 시작일 YYYY-MM-DD (예: 2026-08-10)")
    parser.add_argument("--sheet", default=None, help="시트를 직접 지정 (기본: weekOf 로 추정)")
    parser.add_argument("--out", default=None, help="출력 CSV 경로 (기본: data/weekly_activity_<담당자명>.csv)")
    parser.add_argument("--keep-empty", action="store_true", help="진척사항이 비어 있는 항목 행도 남긴다")
    parser.add_argument("--dry-run", action="store_true", help="CSV 를 쓰지 않고 뽑힌 내용만 보여준다")
    args = parser.parse_args(argv)

    excel_path = Path(args.excel_path).expanduser()
    if not excel_path.is_file():
        sys.exit(f"엑셀 파일을 찾을 수 없습니다: {excel_path}")

    week_of = parse_week_of(args.week_of)
    csv_path = Path(args.out).expanduser() if args.out else DATA_DIR / f"weekly_activity_{args.person}.csv"

    workbook = load_workbook(excel_path, data_only=True)
    try:
        sheet = pick_sheet(workbook, week_of, args.sheet)
        rows = list(sheet.iter_rows(values_only=True))
        header_idx, _ = find_header(rows)
        title = find_title(rows, header_idx)
        # 담당자 열이 없는 서식이라 제목으로만 확인할 수 있다. 다르면 알리기만 하고 계속 진행한다.
        if title and normalize(args.person) not in normalize(title):
            print(f"주의: 시트 '{sheet.title}' 제목이 '{title}' 이라 '{args.person}' 와 다릅니다.", file=sys.stderr)
        records = extract(sheet, args.keep_empty)
        sheet_title = sheet.title
    finally:
        workbook.close()

    if not records:
        sys.exit(f"시트 '{sheet_title}' 에서 내용이 있는 항목을 찾지 못했습니다.")

    new_rows = [
        {"week_of": week_of.isoformat(), "person": args.person, "sheet": sheet_title, **record}
        for record in records
    ]

    if args.dry_run:
        print(f"[dry-run] {week_of.isoformat()} / {args.person} / {sheet_title} — {len(new_rows)}건")
        for row in new_rows:
            summary = row["this_week"] or row["prev_week"] or row["note"]
            print(f"  {row['item']}: {summary.splitlines()[0][:60]}")
        return 0

    # 같은 주차·담당자 행은 새로 뽑은 내용으로 교체하고, 나머지는 남긴다.
    kept = [
        row
        for row in read_existing(csv_path)
        if not (row["week_of"] == week_of.isoformat() and row["person"] == args.person)
    ]
    merged = sorted(kept + new_rows, key=lambda row: (row["week_of"], row["person"]))
    write_csv(csv_path, merged)

    shown = csv_path.relative_to(REPO_ROOT) if csv_path.is_relative_to(REPO_ROOT) else csv_path
    print(f"{shown}: {week_of.isoformat()} / {args.person} / {sheet_title} {len(new_rows)}건 반영 (전체 {len(merged)}건)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
