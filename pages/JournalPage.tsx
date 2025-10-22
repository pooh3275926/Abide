import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { JournalEntry } from '../types';
import { BIBLE_BOOKS } from '../constants';
import ConfirmationModal from './ConfirmationModal';

type BibleTrackerProgress = Record<string, Record<number, boolean>>;

const JournalForm: React.FC<{
  entry: JournalEntry | null;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
}> = ({ entry, onSave, onCancel }) => {
  const [formData, setFormData] = useState<JournalEntry>(
    entry || {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      book: BIBLE_BOOKS[0].name,
      chapter: 1,
      highlights: '',
      scriptureAnalysis: '',
      applicationHelper: '',
      godMessage: '',
      prayer: '',
      completed: false,
    }
  );
  const [isGenerating, setIsGenerating] = useState({ analysis: false, application: false, prayer: false });
  const selectedBook = BIBLE_BOOKS.find(b => b.name === formData.book);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'book') setFormData(prev => ({ ...prev, chapter: 1 }));
  };

  // AI: 經文解析
  const handleGenerateAnalysis = async () => {
    setIsGenerating(prev => ({ ...prev, analysis: true }));
    try {
      const res = await fetch('/api/aiHandler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scriptureAnalysis',
          payload: { book: formData.book, chapter: formData.chapter },
        }),
      });
      const data = await res.json();
      setFormData(prev => ({ ...prev, scriptureAnalysis: data.result || '生成失敗，請稍後再試。' }));
    } catch (err) {
      console.error(err);
      setFormData(prev => ({ ...prev, scriptureAnalysis: '生成經文解析時發生錯誤，請稍後再試。' }));
    } finally {
      setIsGenerating(prev => ({ ...prev, analysis: false }));
    }
  };

  // AI: 應用小幫手
  const handleGenerateApplication = async () => {
    setIsGenerating(prev => ({ ...prev, application: true }));
    try {
      const res = await fetch('/api/aiHandler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'applicationHelper',
          payload: { book: formData.book, chapter: formData.chapter },
        }),
      });
      const data = await res.json();
      setFormData(prev => ({ ...prev, applicationHelper: data.result || '生成失敗，請稍後再試。' }));
    } catch (err) {
      console.error(err);
      setFormData(prev => ({ ...prev, applicationHelper: '生成應用建議時發生錯誤，請稍後再試。' }));
    } finally {
      setIsGenerating(prev => ({ ...prev, application: false }));
    }
  };

  // AI: 靈修禱告（根據經文 + 亮光）
  const handleGeneratePrayer = async () => {
    if (!formData.highlights.trim()) {
      alert('請先輸入亮光或摘要，AI 才能生成禱告。');
      return;
    }
    setIsGenerating(prev => ({ ...prev, prayer: true }));
    try {
      const res = await fetch('/api/aiHandler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'situationalPrayer', // 對應 aiHandler.ts 中禱告生成
          payload: {
            situation: `書卷：${formData.book} 章節：${formData.chapter} 亮光：${formData.highlights}`
          }
        }),
      });
      const data = await res.json();
      setFormData(prev => ({ ...prev, prayer: data.result || '生成失敗，請稍後再試。' }));
    } catch (err) {
      console.error(err);
      setFormData(prev => ({ ...prev, prayer: '生成禱告時發生錯誤，請稍後再試。' }));
    } finally {
      setIsGenerating(prev => ({ ...prev, prayer: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-20 flex justify-center items-center p-4">
      <div className="bg-beige-50 dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{entry ? '編輯' : '新增'}日記</h2>
        <div className="space-y-4">
          {/* 日期 / 書卷 / 章節 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 rounded border bg-white dark:bg-gray-700" />
            <select name="book" value={formData.book} onChange={handleChange} className="p-2 rounded border bg-white dark:bg-gray-700">
              {BIBLE_BOOKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
            <select name="chapter" value={formData.chapter} onChange={handleChange} className="p-2 rounded border bg-white dark:bg-gray-700">
              {selectedBook && Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <textarea name="highlights" placeholder="靈修亮光" value={formData.highlights} onChange={handleChange} rows={3} className="w-full p-2 rounded border bg-white dark:bg-gray-700" />

          {/* 經文解析 */}
          <div>
            <label className="font-semibold">經文解析</label>
            <textarea name="scriptureAnalysis" placeholder="AI 生成的經文解析" value={formData.scriptureAnalysis} onChange={handleChange} rows={3} className="w-full p-2 rounded border bg-white dark:bg-gray-700 mt-1" />
            <button onClick={handleGenerateAnalysis} disabled={isGenerating.analysis} className="mt-1 px-3 py-1 text-sm bg-gold-light dark:bg-gold-dark rounded disabled:opacity-50">{isGenerating.analysis ? '生成中...' : '🤖 產生解析'}</button>
          </div>

          {/* 應用小幫手 */}
          <div>
            <label className="font-semibold">應用小幫手</label>
            <textarea name="applicationHelper" placeholder="AI 生成的應用建議" value={formData.applicationHelper} onChange={handleChange} rows={3} className="w-full p-2 rounded border bg-white dark:bg-gray-700 mt-1" />
            <button onClick={handleGenerateApplication} disabled={isGenerating.application} className="mt-1 px-3 py-1 text-sm bg-gold-light dark:bg-gold-dark rounded disabled:opacity-50">{isGenerating.application ? '生成中...' : '🤖 產生建議'}</button>
          </div>

          {/* 神的話 */}
          <textarea name="godMessage" placeholder="神想告訴我什麼？" value={formData.godMessage} onChange={handleChange} rows={3} className="w-full p-2 rounded border bg-white dark:bg-gray-700" />

          {/* 禱告 */}
          <div>
            <label className="font-semibold">禱告</label>
            <textarea name="prayer" placeholder="AI 生成或手動輸入的禱告" value={formData.prayer} onChange={handleChange} rows={4} className="w-full p-2 rounded border bg-white dark:bg-gray-700 mt-1" />
            <button onClick={handleGeneratePrayer} disabled={isGenerating.prayer} className="mt-1 px-3 py-1 text-sm bg-gold-light dark:bg-gold-dark rounded disabled:opacity-50">{isGenerating.prayer ? '生成中...' : '🤖 產生禱告'}</button>
          </div>

          {/* 完成章節 */}
          <div className="flex items-center">
            <input type="checkbox" id="completed" name="completed" checked={formData.completed} onChange={handleChange} className="h-4 w-4 rounded" />
            <label htmlFor="completed" className="ml-2">是否完成本章全部內容</label>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600">取消</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 rounded bg-gold-DEFAULT text-black dark:text-white">儲存</button>
        </div>
      </div>
    </div>
  );
};

export default JournalForm;
