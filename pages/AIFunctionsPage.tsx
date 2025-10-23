
import React from 'react';
import type { Page } from '../App';

interface AIFunctionsPageProps {
  setActivePage: (page: Page) => void;
}

const AIFunctionsPage: React.FC<AIFunctionsPageProps> = ({ setActivePage }) => {
  const aiItems: { page: Page; label: string; icon: string; description: string }[] = [
    { page: 'iNeedYou', label: '我需要祢', icon: '🌱', description: '為您的處境生成個人化禱告' },
    { page: 'quickRead', label: '快速讀經', icon: '⚡️', description: 'AI 協助您快速領受神的話語' },
    { page: 'jesusSaid', label: '耶穌說', icon: '💌', description: '每日領受鼓勵與盼望' },
  ];

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-beige-50 rounded-xl shadow-lg overflow-hidden">
        <ul className="divide-y divide-beige-200">
          {aiItems.map((item) => (
            <li key={item.page}>
              <button
                onClick={() => setActivePage(item.page)}
                className="w-full flex items-center p-4 text-left hover:bg-beige-100 transition-colors duration-200 focus:outline-none focus:bg-beige-100"
                aria-label={`前往 ${item.label}`}
              >
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-beige-200 rounded-lg">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-semibold text-lg text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="ml-4 text-gray-400">
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

export default AIFunctionsPage;