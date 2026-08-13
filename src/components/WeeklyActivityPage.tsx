import { latestSheet, latestWeekOf, weeklyActivities } from '../data/weeklyActivity';

const columns = [
  { key: 'weekOf', label: '주차', sub: 'week_of' },
  { key: 'person', label: '담당자', sub: 'person' },
  { key: 'sheet', label: '시트', sub: 'sheet' },
  { key: 'item', label: '항목', sub: 'item' },
  { key: 'prevWeek', label: '전주 진척사항', sub: 'prev_week' },
  { key: 'thisWeek', label: '금주 진척사항', sub: 'this_week' },
  { key: 'note', label: '비고', sub: 'note' },
] as const;

export function WeeklyActivityPage() {
  const people = Array.from(new Set(weeklyActivities.map((a) => a.person))).join(', ');

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">주간활동</h2>
        <p className="text-sm text-[var(--text-muted)]">
          주간보고 엑셀의 최근 시트{latestSheet && ` ${latestSheet}`}에서 뽑은 진척사항입니다
          {latestWeekOf && ` (주차 시작일 ${latestWeekOf})`}
          {people && ` · 담당자 ${people}`}.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
          진척사항 ({weeklyActivities.length})
        </h3>
        {weeklyActivities.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
            <table className="w-full min-w-[1080px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-medium">
                      <span className="block text-[var(--text-secondary)]">{column.label}</span>
                      <span className="block font-normal">{column.sub}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyActivities.map((activity, index) => (
                  <tr
                    key={`${activity.weekOf}-${activity.person}-${activity.item}-${index}`}
                    className="border-b border-[var(--border)] align-top last:border-0 hover:bg-[var(--surface-2)]"
                  >
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-[var(--text-secondary)]">
                      {activity.weekOf}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)]">{activity.person}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)]">{activity.sheet}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{activity.item}</td>
                    {/* 셀 안의 줄바꿈을 그대로 살려서 보여준다. */}
                    <td className="min-w-[260px] px-4 py-3 whitespace-pre-line text-[var(--text-secondary)]">
                      {activity.prevWeek || '-'}
                    </td>
                    <td className="min-w-[260px] px-4 py-3 whitespace-pre-line text-[var(--text-primary)]">
                      {activity.thisWeek || '-'}
                    </td>
                    <td className="min-w-[160px] px-4 py-3 whitespace-pre-line text-[var(--text-secondary)]">
                      {activity.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">표시할 주간활동 기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
