import { useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './components/OverviewPage';
import { FarmDetailPage } from './components/FarmDetailPage';
import { breedingGroups, farms, snapshotDate } from './data/breeding';
import { farmsInScope, groupsInScope, type Scope } from './lib/scope';
import { sum, summarizeFarms } from './lib/stats';

const scopeFarmCount: Record<Scope, number> = {
  managed: farmsInScope(farms, groupsInScope(breedingGroups, 'managed')).length,
  all: farmsInScope(farms, breedingGroups).length,
};

function App() {
  const [scope, setScope] = useState<Scope>('managed');
  const [selected, setSelected] = useState('overview');

  const groups = useMemo(() => groupsInScope(breedingGroups, scope), [scope]);
  const scopedFarms = useMemo(() => farmsInScope(farms, groups), [groups]);
  const summaries = useMemo(
    () => summarizeFarms(scopedFarms, groups).sort((a, b) => b.currentCount - a.currentCount),
    [scopedFarms, groups],
  );
  const selectedFarm = scopedFarms.find((f) => f.id === selected);

  function changeScope(next: Scope) {
    setScope(next);
    setSelected('overview');
  }

  return (
    <div className="flex min-h-svh bg-[var(--surface-2)]">
      <Sidebar
        summaries={summaries}
        selected={selected}
        onSelect={setSelected}
        scope={scope}
        onScopeChange={changeScope}
        scopeFarmCount={scopeFarmCount}
        snapshotDate={snapshotDate}
        totalCount={sum(groups, (g) => g.currentCount)}
      />
      <main className="flex-1 overflow-x-hidden">
        {selectedFarm ? (
          <FarmDetailPage farm={selectedFarm} groups={groups} onBack={() => setSelected('overview')} />
        ) : (
          <OverviewPage groups={groups} farms={scopedFarms} scope={scope} onSelectFarm={setSelected} />
        )}
      </main>
    </div>
  );
}

export default App;
