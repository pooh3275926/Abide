import React, { useState } from 'react';
import { generateRandomVerse } from '../services/geminiService';

interface HeaderProps {
  title: string;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const dailyVerses = [
  "左上角圖示點一下，可以刷新經文哦",
];

const Header: React.FC<HeaderProps> = ({ title, isDarkMode, setIsDarkMode }) => {
  const initialVerse = dailyVerses[new Date().getDate() % dailyVerses.length];
  const [currentVerse, setCurrentVerse] = useState(initialVerse);
  const [isGeneratingVerse, setIsGeneratingVerse] = useState(false);

  const handleGenerateVerse = async () => {
    setIsGeneratingVerse(true);
    const newVerse = await generateRandomVerse();
    setCurrentVerse(newVerse);
    setIsGeneratingVerse(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-beige-200/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md text-center">
      <div className="flex justify-between items-center">
        <button
          onClick={handleGenerateVerse}
          disabled={isGeneratingVerse}
          className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-beige-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gold-DEFAULT disabled:opacity-50"
          aria-label="Generate a new random verse"
        >
          {isGeneratingVerse ? '⏳' : '📓'}
        </button>
        <h1 className="text-xl font-bold text-gold-dark dark:text-gold-light">{title}</h1>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-beige-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gold-DEFAULT"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic truncate" title={currentVerse}>
        {currentVerse}
      </p>
    </header>
  );
};

export default Header;