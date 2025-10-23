
import React, { useState } from 'react';
import { generateRandomVerse } from '../services/geminiService';

interface HeaderProps {
  title: string;
}

const dailyVerses = [
  "左上角圖示點一下，可以刷新經文哦",
];

const Header: React.FC<HeaderProps> = ({ title }) => {
  const initialVerse = dailyVerses[new Date().getDate() % dailyVerses.length];
  const [currentVerse, setCurrentVerse] = useState(initialVerse);
  const [isGeneratingVerse, setIsGeneratingVerse] = useState(false);

  const handleGenerateVerse = async () => {
    setIsGeneratingVerse(true);
    const newVerse = await generateRandomVerse();
    setCurrentVerse(newVerse);
    setIsGeneratingVerse(false);
  };
  
  const handleScrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-beige-200/80 backdrop-blur-sm shadow-md text-center">
      <div className="flex justify-between items-center">
        <button
          onClick={handleGenerateVerse}
          disabled={isGeneratingVerse}
          className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-beige-300 focus:outline-none focus:ring-2 focus:ring-gold-DEFAULT disabled:opacity-50"
          aria-label="Generate a new random verse"
        >
          {isGeneratingVerse ? '⏳' : '📓'}
        </button>
        <h1 className="text-xl font-bold text-gold-dark">{title}</h1>
        <button 
          onClick={handleScrollToTop} 
          className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-beige-300 focus:outline-none focus:ring-2 focus:ring-gold-DEFAULT"
          aria-label="Scroll to top"
        >
          {'▲'}
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1 italic truncate" title={currentVerse}>
        {currentVerse}
      </p>
    </header>
  );
};

export default Header;
