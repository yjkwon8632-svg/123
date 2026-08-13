import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './components/OverviewPage';
import { FarmDetailPage } from './components/FarmDetailPage';
import { WeeklyActivityPage } from './components/WeeklyActivityPage';
import { farms } from './data/farms';

function App() {
  const [selected, setSelected] = useState<string>('overview');
  const selectedFarm = farms.find((f) => f.id === selected);

  return (
    <div className="flex min-h-svh bg-[var(--surface-2)]">
      <Sidebar farms={farms} selected={selected} onSelect={setSelected} />
      <main className="flex-1 overflow-x-hidden">
        {selectedFarm ? (
          <FarmDetailPage farm={selectedFarm} />
        ) : selected === 'weekly-activity' ? (
          <WeeklyActivityPage />
        ) : (
          <OverviewPage />
        )}
      </main>
    </div>
  );
}

export default App;
