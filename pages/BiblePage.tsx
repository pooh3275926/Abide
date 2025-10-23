// pages/BiblePage.tsx
import { useState, useEffect } from 'react';

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

export default function BiblePage() {
  const [book, setBook] = useState('創'); // 預設創世記
  const [chap, setChap] = useState(1);     // 預設第一章
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 讀取本地 JSON 經文
  useEffect(() => {
    const fetchBible = async () => {
      setLoading(true);
      setError('');
      setVerses([]);

      try {
        // 假設檔案命名為 book+chap.json，例如 創1.json
        const fileName = `${book}${chap}.json`;
        const res = await fetch(`/bible/${fileName}`);
        if (!res.ok) throw new Error('檔案不存在');

        const data: BibleResponse = await res.json();

        if (!data.record || data.record.length === 0) {
          setError('找不到該章經文。');
        } else {
          setVerses(data.record);
        }
      } catch (err) {
        console.error(err);
        setError('讀取本地聖經資料失敗。');
      } finally {
        setLoading(false);
      }
    };

    fetchBible();
  }, [book, chap]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-gold-dark dark:text-gold-light">
        📖 聖經閱讀
      </h1>

      {/* 控制列 */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <input
          type="text"
          value={book}
          onChange={(e) => setBook(e.target.value)}
          className="p-2 border rounded-lg w-32 text-center dark:bg-gray-700 dark:border-gray-600"
          placeholder="書卷 (例: 創)"
        />
        <input
          type="number"
          value={chap}
          onChange={(e) => setChap(Number(e.target.value))}
          className="p-2 border rounded-lg w-24 text-center dark:bg-gray-700 dark:border-gray-600"
          min={1}
          placeholder="章數"
        />
        <button
          onClick={() => {
            setVerses([]); 
            setError('');
          }}
          className="px-4 py-2 bg-gold-dark text-white rounded-lg hover:bg-gold-light transition"
        >
          查詢
        </button>
      </div>

      {/* 狀態顯示 */}
      {loading && <p className="text-center text-gray-500">讀取中...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* 經文內容 */}
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
