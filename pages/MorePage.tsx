import React from 'react';
import type { Page } from '../App';

interface MorePageProps {
  setActivePage: (page: Page) => void;
}

const MorePage: React.FC<MorePageProps> = ({ setActivePage }) => {
  const moreItems: { page: Page; label: string; icon: string; description: string }[] = [
    { page: 'tracker', label: '聖經進度', icon: '📜', description: '追蹤您的讀經旅程' },
    { page: 'messageNotes', label: '信息筆記', icon: '✍️', description: '記錄講道、學習與心得' },
    { page: 'settings', label: '設定', icon: '⚙️', description: '匯入與匯出您的資料' },
  ];

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-beige-50 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <ul className="divide-y divide-beige-200 dark:divide-gray-700">
          {moreItems.map((item) => (
            <li key={item.page}>
              <button
                onClick={() => setActivePage(item.page)}
                className="w-full flex items-center p-4 text-left hover:bg-beige-100 dark:hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:bg-beige-100 dark:focus:bg-gray-700/50"
                aria-label={`前往 ${item.label}`}
              >
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-beige-200 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">{item.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
                <div className="ml-4 text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MorePage;
