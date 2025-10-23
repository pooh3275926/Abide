// pages/BiblePage.tsx
import { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './BiblePage.css'; // 下面會提供 CSS

type BibleVerse = {
  chineses: string;
  engs: string;
  chap: number;
  sec: number;
  bible_text: string;
};

type BibleResponse = {
  status: string;
  record_count: number;
  record: BibleVerse[];
};

const fullNameToShortName: Record<string, string> = { /* 同上 */ };
const maxChapters: Record<string, number> = { /* 同上 */ };

export default function BiblePage() {
  const [book, setBook] = useState('創世記');
  const [chap, setChap] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapters, setChapters] = useState(50);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // 更新最大章節
  useEffect(() => {
    const maxChap = maxChapters[book] || 50;
    setChapters(maxChap);
    if (chap > maxChap) setChap(maxChap);
  }, [book]);

  // 讀取經文
  useEffect(() => {
    const fetchBible = async () => {
      setLoading(true);
      setError('');
      setVerses([]);
      try {
        const shortName = fullNameToShortName[book];
        if (!shortName) throw new Error('書卷名稱錯誤或不支援。');

        const fileName = `${shortName}.json`;
        const res = await fetch(`/bible/${fileName}`);
        if (!res.ok) throw new Error('檔案不存在');

        const data: BibleResponse = await res.json();
        const chapterVerses = data.record.filter(v => v.chap === chap);
        if (!chapterVerses.length) setError('找不到該章經文。');
        else setVerses(chapterVerses);
      } catch (err) {
        console.error(err);
        setError('讀取本地聖經資料失敗。');
      } finally {
        setLoading(false);
      }
    };
    fetchBible();
  }, [book, chap]);

  const prevChap = () => {
    if (chap > 1) {
      setDirection('left');
      setChap(chap - 1);
    }
  };
  const nextChap = () => {
    if (chap < chapters) {
      setDirection('right');
      setChap(chap + 1);
    }
  };

  const handleBookSelect = (value: string) => {
    if (fullNameToShortName[value]) {
      setBook(value);
      setChap(1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 font-sans">
      <h1 className="mt-4 text-3xl font-extrabold text-center mb-6 text-gold-600 dark:text-gold-400 drop-shadow-md">
        請查詢書卷與章節
      </h1>

      {/* 書卷與章節選擇 */}
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap sm:flex-nowrap">
        <input
          list="books"
          value={book}
          onChange={e => handleBookSelect(e.target.value)}
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-sm"
          placeholder="書卷"
        />
        <datalist id="books">
          {Object.keys(fullNameToShortName).map(b => <option key={b} value={b} />)}
        </datalist>

        <select
          value={chap}
          onChange={e => {
            const newChap = Number(e.target.value);
            setDirection(newChap > chap ? 'right' : 'left');
            setChap(newChap);
          }}
          className="w-20 p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-sm"
        >
          {Array.from({ length: chapters }, (_, i) => i + 1).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* 章節切換 */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={prevChap} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          <FaArrowLeft />
        </button>
        <h2 className="text-xl font-bold text-gold-700 dark:text-gold-300 drop-shadow">{book} 第 {chap} 章</h2>
        <button onClick={nextChap} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          <FaArrowRight />
        </button>
      </div>

      {loading && <p className="text-center text-gray-500">讀取中...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* 經文區動畫 */}
      <TransitionGroup className="bg-beige-50 dark:bg-gray-900 p-6 rounded-2xl shadow-lg overflow-x-auto">
        <CSSTransition key={`${book}-${chap}`} timeout={300} classNames={`slide-${direction}`}>
          <div className="space-y-3 text-gray-800 dark:text-gray-200">
            {verses.map(v => (
              <p key={v.sec} className="p-3 rounded-lg hover:bg-yellow-50 dark:hover:bg-gray-700 transition shadow-sm">
                <span className="font-semibold mr-2 text-gold-600 dark:text-gold-400">{v.sec}</span>
                {v.bible_text}
              </p>
            ))}
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}
