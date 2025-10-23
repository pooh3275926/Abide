import { useEffect, useState } from 'react';

type BibleRecord = {
  chineses: string;
  engs: string;
  chap: number;
  sec: number;
  bible_text: string;
};

const BiblePage = () => {
  const [book, setBook] = useState('羅');
  const [chap, setChap] = useState(1);
  const [records, setRecords] = useState<BibleRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBible = async () => {
      setLoading(true);
      const res = await fetch(`/api/bible?book=${book}&chap=${chap}`);
      const data = await res.json();
      setRecords(data.record);
      setLoading(false);
    };
    fetchBible();
  }, [book, chap]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📖 {book} {chap} 章</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={book}
          onChange={(e) => setBook(e.target.value)}
          placeholder="輸入書卷"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={chap}
          onChange={(e) => setChap(Number(e.target.value))}
          placeholder="章"
          className="border p-2 rounded w-20"
        />
      </div>

      {loading ? (
        <p>載入中...</p>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <p key={`${r.chap}-${r.sec}`} className="text-sm">
              <span className="font-bold">{r.sec} </span>
              {r.bible_text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default BiblePage;
