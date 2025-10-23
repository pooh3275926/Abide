// pages/api/bible.ts
import type { NextApiRequest, NextApiResponse } from 'next';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    book = '創',
    chap = '1',
    gb = '0',
    version = 'nstrunv',
  } = req.query;

  try {
    const apiUrl = `https://bible.fhl.net/json/qb.php?chineses=${book}&chap=${chap}&gb=${gb}&version=${version}`;
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // ⚡ 改成 text，再手動過濾、parse
    const rawText = await response.text();

    // 移除 HTML、換行、空白，只保留 JSON 區段
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    const cleanJson = rawText.slice(jsonStart, jsonEnd + 1);

    const data: BibleResponse = JSON.parse(cleanJson);

    if (!data || !data.record || data.record.length === 0) {
      return res.status(404).json({
        status: 'not_found',
        record_count: 0,
        record: [],
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Bible API Error:', err);
    return res.status(500).json({
      status: 'error',
      record_count: 0,
      record: [],
    });
  }
}
