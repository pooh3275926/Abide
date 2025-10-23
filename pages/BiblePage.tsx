// pages/BiblePage.tsx
import { useState, useEffect } from 'react';
import './BiblePage.css';

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

const fullNameToShortName: Record<string, string> = {
  '創世記': '創', '出埃及記': '出', '利未記': '利', '民數記': '民', '申命記': '申',
  '約書亞記': '書', '士師記': '士', '路得記': '得', '撒母耳記上': '撒上', '撒母耳記下': '撒下',
  '列王紀上': '王上', '列王紀下': '王下', '歷代志上': '代上', '歷代志下': '代下',
  '以斯拉記': '拉', '尼希米記': '尼', '以斯帖記': '斯', '約伯記': '伯', '詩篇': '詩',
  '箴言': '箴', '傳道書': '傳', '雅歌': '歌', '以賽亞書': '賽', '耶利米書': '耶',
  '耶利米哀歌': '哀', '以西結書': '結', '但以理書': '但', '何西阿書': '何', '約珥書': '珥',
  '阿摩司書': '摩', '俄巴底亞書': '俄', '約拿書': '拿', '彌迦書': '彌', '那鴻書': '鴻',
  '哈巴谷書': '哈', '西番雅書': '番', '哈該書': '該', '撒迦利亞書': '亞', '瑪拉基書': '瑪',
  '馬太福音': '太', '馬可福音': '可', '路加福音': '路', '約翰福音': '約', '使徒行傳': '徒',
  '羅馬書': '羅', '哥林多前書': '林前', '哥林多後書': '林後', '加拉太書': '加', '以弗所書': '弗',
  '腓立比書': '腓', '歌羅西書': '西', '帖撒羅尼迦前書': '帖前', '帖撒羅尼迦後書': '帖後',
  '提摩太前書': '提前', '提摩太後書': '提後', '提多書': '多', '腓利門書': '門', '希伯來書': '來',
  '雅各書': '雅', '彼得前書': '彼前', '彼得後書': '彼後', '約翰一書': '約一', '約翰二書': '約二',
  '約翰三書': '約三', '猶大書': '猶', '啟示錄': '啟',
};

const maxChapters: Record<string, number> = {
  '創世記':50,'出埃及記':40,'利未記':27,'民數記':36,'申命記':34,
  '約書亞記':24,'士師記':21,'路得記':4,'撒母耳記上':31,'撒母耳記下':24,
  '列王紀上':22,'列王紀下':25,'歷代志上':29,'歷代志下':36,'以斯拉記':10,
  '尼希米記':13,'以斯帖記':10,'約伯記':42,'詩篇':150,'箴言':31,
  '傳道書':12,'雅歌':8,'以賽亞書':66,'耶利米書':52,'耶利米哀歌':5,
  '以西結書':48,'但以理書':12,'何西阿書':14,'約珥書':3,'阿摩司書':9,
  '俄巴底亞書':1,'約拿書':4,'彌迦書':7,'那鴻書':3,'哈巴谷書':3,
  '西番雅書':3,'哈該書':2,'撒迦利亞書':14,'瑪拉基書':4,
  '馬太福音':28,'馬可福音':16,'路加福音':24,'約翰福音':21,'使徒行傳':28,
  '羅馬書':16,'哥林多前書':16,'哥林多後書':13,'加拉太書':6,'以弗所書':6,
  '腓立比書':4,'歌羅西書':4,'帖撒羅尼迦前書':5,'帖撒羅尼迦後書':3,
  '提摩太前書':6,'提摩太後書':4,'提多書':3,'腓利門書':1,'希伯來書':13,
  '雅各書':5,'彼得前書':5,'彼得後書':3,'約翰一書':5,'約翰二書':1,
  '約翰三書':1,'猶大書':1,'啟示錄':22,
};

export default function BiblePage() {
  const [book, setBook] = useState('創世記');
  const [chap, setChap] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapters, setChapters] = useState(50);
  const [direction, setDirection] = useState<'left'|'right'>('right');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const maxChap = maxChapters[book] || 50;
    setChapters(maxChap);
    if (chap > maxChap) setChap(1);
  }, [book]);

  useEffect(() => {
    const fetchBible = async () => {
      setLoading(true);
      setError('');
      setVerses([]);
      try {
        const shortName = fullNameToShortName[book];
        if (!shortName) throw new Error('書卷名稱錯誤或不支援');
        const res = await fetch(`/bible/${shortName}.json`);
        if (!res.ok) throw new Error('檔案不存在');
        const data: BibleResponse = await res.json();
        const chapterVerses = data.record.filter(v => v.chap === chap);
        if (chapterVerses.length === 0) setError('找不到該章經文。');
        else {
          setAnimate(true);
          setTimeout(() => setAnimate(false), 300);
          setVerses(chapterVerses);
        }
      } catch (err) {
        console.error(err);
        setError('讀取本地聖經資料失敗。');
      } finally { setLoading(false); }
    };
    fetchBible();
  }, [book, chap]);

  const prevChap = () => {
    if (chap > 1) { setDirection('left'); setChap(chap-1); }
  };
  const nextChap = () => {
    if (chap < chapters) { setDirection('right'); setChap(chap+1); }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">請查詢書卷與章節</h1>

      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        <input
          list="books"
          value={book}
          onChange={e => { setBook(e.target.value); setChap(1); }}
          placeholder="書卷"
          className="p-2 border rounded"
        />
        <datalist id="books">
          {Object.keys(fullNameToShortName).map(b => <option key={b} value={b} />)}
        </datalist>

        <select
          value={chap}
          onChange={e => {
            const newChap = Number(e.target.value);
            setDirection(newChap>chap?'right':'left');
            setChap(newChap);
          }}
        >
          {Array.from({length: chapters}, (_, i)=>i+1).map(c=><option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={()=>setChap(chap)}>查詢</button>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={prevChap}>◀</button>
        <span>{book} 第 {chap} 章</span>
        <button onClick={nextChap}>▶</button>
      </div>

      {loading && <p className="text-center">讀取中...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className={`bible-content ${animate?`slide-${direction}`:''}`}>
        {verses.map(v => (
          <p key={v.sec}><strong>{v.sec}</strong> {v.bible_text}</p>
        ))}
      </div>
    </div>
  );
}
