import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

interface DataPoint {
  name: string;
  value: number;
}

/** 구간·단계처럼 항목이 적고 순서가 고정된 분포용 세로 막대입니다. */
export function HeadcountBarChart({
  data,
  unit = '두',
  showValues = false,
}: {
  data: DataPoint[];
  unit?: string;
  showValues?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--baseline)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v: number) => v.toLocaleString('ko-KR')}
        />
        <Tooltip
          cursor={{ fill: 'var(--surface-2)' }}
          content={<ChartTooltip formatter={(v) => `${v.toLocaleString('ko-KR')} ${unit}`} />}
        />
        <Bar
          dataKey="value"
          fill="var(--series-1)"
          radius={[4, 4, 0, 0]}
          maxBarSize={56}
          isAnimationActive={false}
        >
          {showValues && (
            <LabelList
              dataKey="value"
              position="top"
              fill="var(--text-secondary)"
              fontSize={12}
              formatter={(v: unknown) => Number(v).toLocaleString('ko-KR')}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
