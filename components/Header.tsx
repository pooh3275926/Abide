import React, { useState } from 'react';

interface HeaderProps {
  title: string;
}

const dailyVerses = [
  "詩篇 23:1 — 耶和華是我的牧者，我必不至缺乏。",
  "腓立比書 4:6-7 — 應當一無掛慮，只要凡事藉著禱告、祈求和感謝，將你們所要的告訴神。神所賜出人意外的平安，必在基督耶穌裡保守你們的心懷意念。",
  "以賽亞書 41:10 — 你不要害怕，因為我與你同在；不要驚惶，因為我是你的神。我必堅固你，我必幫助你，我必用公義的右手扶持你。",
  "馬太福音 11:28 — 凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。",
  "羅馬書 8:28 — 我們曉得萬事都互相效力，叫愛神的人得益處，就是按祂旨意被召的人。",
  "約書亞記 1:9 — 你當剛強壯膽，不要懼怕，也不要驚惶，因為無論你往哪裡去，耶和華你的神必與你同在。",
  "詩篇 46:1 — 神是我們的避難所，是我們的力量，是我們在患難中隨時的幫助。",
  "耶利米哀歌 3:22-23 — 我們不致消滅，是出於耶和華諸般的慈愛；祂的憐憫不致斷絕。每早晨這都是新的；祢的誠實極其廣大。",
  "哥林多後書 12:9 — 我的恩典夠你用的，因為我的能力是在人的軟弱上顯得完全。",
  "詩篇 34:18 — 耶和華靠近傷心的人，拯救靈性痛悔的人。",
  "約翰福音 14:27 — 我留下平安給你們；我將我的平安賜給你們。我所賜的，不像世人所賜的。你們心裡不要憂愁，也不要膽怯。",
  "箴言 3:5-6 — 你要專心仰賴耶和華，不可倚靠自己的聰明。在你一切所行的事上都要認定祂，祂必指引你的路。",
  "以賽亞書 40:31 — 但那等候耶和華的，必重新得力。他們必如鷹展翅上騰；他們奔跑卻不困倦，行走卻不疲乏。",
  "羅馬書 15:13 — 但願使人有盼望的神，因信將諸般的喜樂平安充滿你們的心，使你們藉著聖靈的能力大有盼望。",
  "詩篇 91:1-2 — 住在至高者隱密處的，必住在全能者的蔭下。我要論到耶和華說：祂是我的避難所，是我的山寨，是我的神，是我所倚靠的。",
  "約翰一書 4:18 — 愛裡沒有懼怕；愛既完全，就把懼怕除去。",
  "詩篇 121:1-2 — 我要向山舉目。我的幫助從何而來？我的幫助從造天地的耶和華而來。",
  "以賽亞書 43:2 — 你從水中經過，我必與你同在；你趟過江河，水必不漫過你；你從火中行過，必不被燒，火焰也不著在你身上。",
  "詩篇 27:1 — 耶和華是我的亮光，是我的拯救，我還怕誰呢？耶和華是我性命的保障，我還懼誰呢？",
  "希伯來書 13:5 — 我總不撇下你，也不丟棄你。",
  "約翰福音 16:33 — 在世上你們有苦難，但你們可以放心，我已經勝了世界。",
  "哥林多前書 10:13 — 你們所遇見的試探，無非是人所能受的。神是信實的，必不叫你們受試探過於所能受的。",
  "詩篇 37:4 — 又要以耶和華為樂，祂就將你心裡所求的賜給你。",
  "以弗所書 3:20 — 神能照著運行在我們心裡的大力，充充足足地成就一切，超過我們所求所想的。",
  "約翰福音 3:16 — 神愛世人，甚至將祂的獨生子賜給他們，叫一切信祂的，不致滅亡，反得永生。",
  "詩篇 55:22 — 你要把你的重擔卸給耶和華，祂必撫養你；祂永不叫義人動搖。",
  "馬可福音 9:23 — 在信的人，凡事都能。",
  "哥林多後書 5:17 — 若有人在基督裡，他就是新造的人，舊事已過，都變成新的了。",
  "詩篇 30:5 — 一宿雖然有哭泣，早晨便必歡呼。",
  "啟示錄 21:4 — 神要擦去他們一切的眼淚；不再有死亡，也不再有悲哀、哭號、疼痛。",
  "詩篇 139:23-24 — 神啊，求你鑒察我，知道我的心思；試煉我，知道我的意念。看在我裡面有甚麼惡行沒有，引導我走永生的道路。",
  "以賽亞書 26:3 — 堅心倚賴你的，你必保守他十分平安，因為他倚靠你。",
  "約翰一書 1:9 — 我們若認自己的罪，神是信實的，是公義的，必要赦免我們的罪，洗淨我們一切的不義。",
  "詩篇 32:7 — 你是我藏身之處；你必保佑我脫離苦難，以得救的樂歌四面環繞我。",
  "馬太福音 6:33 — 你們要先求他的國和他的義，這些東西都要加給你們了。",
  "詩篇 103:2-4 — 我的心哪，你要稱頌耶和華，不可忘記他的一切恩惠。他赦免你的一切罪孽，醫治你的一切疾病，救贖你的命脫離死亡。",
  "羅馬書 5:8 — 惟有基督在我們還作罪人的時候為我們死，神的愛就在此向我們顯明了。",
  "詩篇 18:2 — 耶和華是我的岩石，我的山寨，我的救主，我的神，我所投靠的磐石。",
  "雅各書 1:5 — 你們中間若有缺少智慧的，應當求那厚賜與眾人、也不斥責人的神，主就必賜給他。",
  "詩篇 16:8 — 我將耶和華常擺在我面前，因他在我右邊，我便不致搖動。",
  "彼得前書 5:7 — 你們要將一切的憂慮卸給神，因為他顧念你們。",
  "詩篇 19:14 — 耶和華—我的磐石、我的救贖主啊，願我口中的言語、心裡的意念在你面前蒙悅納。",
  "哥林多後書 4:17 — 我們這至暫至輕的苦楚，要為我們成就極重無比、永遠的榮耀。",
  "約翰福音 15:5 — 我是葡萄樹，你們是枝子；常在我裡面的，我也常在他裡面，這人就多結果子。",
  "羅馬書 12:12 — 在指望中要喜樂，在患難中要忍耐，禱告要恆切。",
  "詩篇 119:105 — 你的話是我腳前的燈，是我路上的光。",
  "希伯來書 11:1 — 信就是所望之事的實底，是未見之事的確據。",
  "詩篇 145:18 — 凡求告耶和華的，就是誠心求告他的，耶和華便與他相近。",
  "歌林多後書 9:8 — 神能將各樣的恩惠多多地加給你們，使你們凡事常常充足，能多行各樣善事。",
  "詩篇 100:5 — 因為耶和華本為善；他的慈愛存到永遠，他的信實直到萬代。",
];

// 👉 新增：本地隨機抽經文
const getRandomVerse = () => {
  const randomIndex = Math.floor(Math.random() * dailyVerses.length);
  return dailyVerses[randomIndex];
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const initialVerse = dailyVerses[new Date().getDate() % dailyVerses.length];
  const [currentVerse, setCurrentVerse] = useState(initialVerse);
  const [isGeneratingVerse, setIsGeneratingVerse] = useState(false);

  // 👉 改成直接從本地陣列抽
  const handleGenerateVerse = () => {
    setIsGeneratingVerse(true);
    setTimeout(() => {
      const newVerse = getRandomVerse();
      setCurrentVerse(newVerse);
      setIsGeneratingVerse(false);
    }, 400); // 小延遲讓按鈕動畫更自然
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-beige-200/80 backdrop-blur-sm shadow-md text-center">
      <div className="flex justify-between items-center">
        <button
          onClick={handleGenerateVerse}
          disabled={isGeneratingVerse}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-beige-300 focus:outline-none focus:ring-2 focus:ring-gold-DEFAULT disabled:opacity-50"
          aria-label="Generate a new random verse"
        >
          <span>{isGeneratingVerse ? '⏳' : '↻'}</span>
        </button>
        <h1 className="text-xl font-bold text-gold-dark">{title}</h1>
        <button
          onClick={handleScrollToTop}
          className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-beige-300 focus:outline-none focus:ring-0 active:outline-none"
          aria-label="Scroll to top"
        >
          {'▲'}
        </button>
      </div>
      <p className="mt-4 text-xs text-gray-600 mt-1 italic truncate" title={currentVerse}>
        {currentVerse}
      </p>
    </header>
  );
};

export default Header;