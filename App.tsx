import React, { useState, useEffect } from 'react';
import INeedYouPage from './pages/DashboardPage'; // Renamed Dashboard to INeedYouPage
import TrackerPage from './pages/TrackerPage';
import JournalPage from './pages/JournalPage';
import PrayerListPage from './pages/PrayerListPage';
import JesusSaidPage from './pages/JesusSaidPage';
import QuickReadPage from './pages/QuickReadPage'; // Import the new page
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import { useLocalStorage } from './hooks/useLocalStorage';

export type Page = 'iNeedYou' | 'tracker' | 'journal' | 'prayer' | 'jesusSaid' | 'quickRead';

const pageTitles: Record<Page, string> = {
  iNeedYou: '我需要祢',
  tracker: '聖經進度',
  journal: '靈修日記',
  prayer: '禱告清單',
  jesusSaid: '耶穌說',
  quickRead: '快速讀經',
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('iNeedYou');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderPage = () => {
    switch (activePage) {
      case 'iNeedYou':
        return <INeedYouPage />;
      case 'tracker':
        return <TrackerPage />;
      case 'journal':
        return <JournalPage />;
      case 'prayer':
        return <PrayerListPage />;
      case 'jesusSaid':
        return <JesusSaidPage />;
      case 'quickRead':
        return <QuickReadPage />;
      default:
        return <INeedYouPage />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-beige-100 dark:bg-gray-900 dark:text-gray-200">
      <Header title={pageTitles[activePage]} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <main className="pb-20 pt-24 px-4">
        {renderPage()}
      </main>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default App;