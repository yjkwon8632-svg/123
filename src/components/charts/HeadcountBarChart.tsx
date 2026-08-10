import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

interface DataPoint {
  name: string;
  value: number;
}

export function HeadcountBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
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
          width={48}
          tickFormatter={(v: number) => v.toLocaleString('ko-KR')}
        />
        <Tooltip
          cursor={{ fill: 'var(--surface-2)' }}
          content={<ChartTooltip formatter={(v) => `${v.toLocaleString('ko-KR')} 두`} />}
        />
        <Bar
          dataKey="value"
          fill="var(--series-1)"
          radius={[4, 4, 0, 0]}
          maxBarSize={56}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
