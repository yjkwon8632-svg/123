import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

export interface RankedDatum {
  name: string;
  value: number;
  /** 강조할 항목(예: 선택된 농장)에만 true */
  highlight?: boolean;
}

/**
 * 이름이 긴 항목을 순위대로 비교할 때 쓰는 가로 막대입니다.
 * 항목 수가 많으면 컨테이너에서 세로 스크롤합니다.
 */
export function RankedBarChart({
  data,
  unit = '두',
  rowHeight = 26,
  onSelect,
}: {
  data: RankedDatum[];
  unit?: string;
  /** 항목 하나가 차지하는 세로 높이 — 항목이 많으면 줄입니다. */
  rowHeight?: number;
  onSelect?: (name: string) => void;
}) {
  const height = Math.max(180, data.length * rowHeight + 24);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v.toLocaleString('ko-KR')}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={132}
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--baseline)' }}
          tickLine={false}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: 'var(--surface-2)' }}
          content={<ChartTooltip formatter={(v) => `${v.toLocaleString('ko-KR')} ${unit}`} />}
        />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          barSize={Math.min(14, rowHeight - 6)}
          isAnimationActive={false}
          onClick={onSelect ? (entry: { name?: string }) => entry.name && onSelect(entry.name) : undefined}
          className={onSelect ? 'cursor-pointer' : undefined}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.highlight ? 'var(--series-2)' : 'var(--series-1)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
