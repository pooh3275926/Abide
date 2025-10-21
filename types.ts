export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  book: string;
  chapter: number;
  highlights: string;
  scriptureAnalysis: string;
  applicationHelper: string;
  godMessage: string;
  prayer: string;
  completed: boolean;
}

export interface PrayerItem {
  id: string;
  title: string;
  person: string;
  content: string;
  prayerDate: string; // YYYY-MM-DD
  answered: boolean;
  answeredDate?: string; // YYYY-MM-DD
}

export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'Old' | 'New';
}

export interface SituationalPrayer {
  id: string;
  date: string; // YYYY-MM-DD
  situation: string;
  prayer: string;
}

export interface JesusSaidCard {
  id: string;
  date: string; // YYYY-MM-DD
  verse: string;
  message: string;
  prayer: string;
}

export interface QuickReadEntry {
  id: string;
  date: string; // YYYY-MM-DD
  userInput: string; // The original input from the user
  analysis: string;
  application: string;
  prayer: string;
}