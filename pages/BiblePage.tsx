import { useState, useEffect } from 'react';

type BibleVerse = {
  chineses: string; // 書卷名稱（中文）
  engs: string;     // 書卷英文代碼
  chap: number;     // 章
  sec: number;      // 節
  bible_text: string; // 經文內容
};

export default function BiblePage() {
  const [book, setBook] = useState('創'); // 預設：創世記
  const [chap, setChap] = useState(1);   // 預設第一章
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🕊️ 抽出 fetchBible 函式
  const fetchBible = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/bible?book=${book}&chap=${chap}`);
      const data = await res.json();

      if (data.status === 'not_found') {
        setError('找不到該章經文。');
        setVerses([]);
      } else if (data.status === 'error') {
        setError('讀取聖經資料失敗。');
        setVerses([]);
      } else {
        setVerses(data.record);
      }
    } catch (err) {
      console.error(err);
      setError('無法連接伺服器。');
    } finally {
      setLoading(false);
    }
  };

  // 📖 預設載入創世記第一章
  useEffect(() => {
    fetchBible();
  }, []);

  // 🧭 上一章／下一章控制
  const handlePrevChapter = () => {
    if (chap > 1) {
      setChap((prev) => prev - 1);
      fetchBible(); // 立即重新載入
    }
  };

  const handleNextChapter = () => {
    setChap((prev) => prev + 1);
    fetchBible(); // 立即重新載入
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-gold-dark dark:text-gold-light">
        📖 聖經閱讀
      </h1>

      {/* --- 控制列 --- */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <input
          type="text"
          value={book}
          onChange={(e) => setBook(e.target.value)}
          className="p-2 border rounded-lg w-32 text-center dark:bg-gray-700 dark:border-gray-600"
          placeholder="書卷 (例: 羅)"
        />
        <input
          type="number"
          value={chap}
          onChange={(e) => setChap(Number(e.target.value))}
          className="p-2 border rounded-lg w-24 text-center dark:bg-gray-700 dark:border-gray-600"
          min="1"
          placeholder="章數"
        />
        <button
          onClick={fetchBible}
          className="px-4 py-2 bg-gold-dark text-white rounded-lg hover:bg-gold-light transition"
        >
          查詢
        </button>
      </div>

      {/* --- 上下章控制 --- */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevChapter}
          disabled={chap <= 1}
          className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded-lg disabled:opacity-50"
        >
          ⬅ 上一章
        </button>
        <button
          onClick={handleNextChapter}
          className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded-lg"
        >
          下一章 ➡
        </button>
      </div>

      {/* --- 狀態顯示 --- */}
      {loading && <p className="text-center text-gray-500">讀取中...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* --- 經文內容 --- */}
      <div className="bg-beige-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm leading-relaxed">
        {verses.length > 0 ? (
          <>
            <h2 className="text-center font-bold mb-4 text-lg">
              {verses[0].chineses} 第 {verses[0].chap} 章
            </h2>
            <div className="space-y-2 text-gray-800 dark:text-gray-200">
              {verses.map((v) => (
                <p key={v.sec}>
                  <span className="font-semibold mr-2 text-gold-dark dark:text-gold-light">
                    {v.sec}
                  </span>
                  {v.bible_text}
                </p>
              ))}
            </div>
          </>
        ) : (
          !loading &&
          !error && (
            <p className="text-center text-gray-500">
              請輸入書卷與章節後點擊「查詢」。
            </p>
          )
        )}
      </div>
    </div>
  );
}
