// pages/api/bible.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type BibleResponse = {
  status: string;
  record_count: number;
  record: { chineses: string; engs: string; chap: number; sec: number; bible_text: string }[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { book = '羅', chap = '1', gb = '0', version = 'nstrunv' } = req.query;

  try {
    const response = await fetch(
      `https://bible.fhl.net/qb.php?chineses=${book}&chap=${chap}&gb=${gb}&version=${version}`
    );
    const data: BibleResponse = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', record_count: 0, record: [] });
  }
}
