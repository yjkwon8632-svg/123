import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './components/OverviewPage';
import { FarmDetailPage } from './components/FarmDetailPage';
import { breedingGroups, farms, snapshotDate } from './data/breeding';
import { summarizeFarms, sum } from './lib/stats';

const summaries = summarizeFarms(farms, breedingGroups).sort((a, b) => b.currentCount - a.currentCount);
const totalCount = sum(breedingGroups, (g) => g.currentCount);

function App() {
  const [selected, setSelected] = useState('overview');
  const selectedFarm = farms.find((f) => f.id === selected);

  return (
    <div className="flex min-h-svh bg-[var(--surface-2)]">
      <Sidebar
        summaries={summaries}
        selected={selected}
        onSelect={setSelected}
        snapshotDate={snapshotDate}
        totalCount={totalCount}
      />
      <main className="flex-1 overflow-x-hidden">
        {selectedFarm ? (
          <FarmDetailPage farm={selectedFarm} onBack={() => setSelected('overview')} />
        ) : (
          <OverviewPage onSelectFarm={setSelected} />
        )}
      </main>
    </div>
  );
}

export default App;
