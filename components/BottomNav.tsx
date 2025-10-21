
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
      isActive ? 'text-gold-dark dark:text-gold-light' : 'text-gray-500 dark:text-gray-400'
    }`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-xs">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const navItems: { page: Page; label: string; icon: string }[] = [
    { page: 'iNeedYou', label: '我需要祢', icon: '🌱' },
    { page: 'tracker', label: '聖經進度', icon: '📜' },
    { page: 'journal', label: '日記', icon: '📝' },
    { page: 'prayer', label: '禱告清單', icon: '🤲🏻' },
    { page: 'jesusSaid', label: '耶穌說', icon: '💌' },
    { page: 'quickRead', label: '快速讀經', icon: '⚡️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-beige-200/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] flex justify-around items-center">
      {navItems.map((item) => (
        <NavItem
          key={item.page}
          label={item.label}
          icon={item.icon}
          isActive={activePage === item.page}
          onClick={() => setActivePage(item.page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;