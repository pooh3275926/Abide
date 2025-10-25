
import React from 'react';
import type { Page } from '../App';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-gold-dark' : 'text-gray-500'
    }`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-xs">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  // 更新後的底部導覽列項目
  const navItems: { page: Page; label: string; icon: string }[] = [
    { page: 'bible', label: '聖經', icon: '📖' },
    { page: 'journal', label: '靈修日記', icon: '📝' },
    { page: 'prayer', label: '禱告清單', icon: '🤲🏻' },
    { page: 'ai', label: 'AI 功能', icon: '✦︎' },
    { page: 'more', label: '更多功能', icon: '⋯' },
  ];

  const getActiveTab = (page: Page): Page => {
    const aiPages: Page[] = ['iNeedYou', 'quickRead', 'jesusSaid', 'smallGroup'];
    const morePages: Page[] = ['tracker', 'settings', 'messageNotes', 'biblePlans']; // 新增 biblePlans

    if (aiPages.includes(page)) return 'ai';
    if (morePages.includes(page)) return 'more';
    return page;
  };

  const currentActiveTab = getActiveTab(activePage);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-beige-200/90 backdrop-blur-sm shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] flex justify-around items-center">
      {navItems.map((item) => (
        <NavItem
          key={item.page}
          label={item.label}
          icon={item.icon}
          isActive={currentActiveTab === item.page}
          onClick={() => setActivePage(item.page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;
