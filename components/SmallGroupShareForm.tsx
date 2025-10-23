import React, { useState, useMemo } from 'react';
import { SmallGroupShare } from '../types';
import { BIBLE_BOOKS } from '../constants';
import { generateSmallGroupTopics } from '../services/geminiService';

const SmallGroupShareForm: React.FC<{
  share: SmallGroupShare | null;
  onSave: (share: SmallGroupShare) => void;
  onCancel: () => void;
}> = ({ share, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SmallGroupShare>(
    share || {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      groupName: '',
      book: BIBLE_BOOKS[0].name,
      chapter: 1,
      verse: '',
      topic: '',
      myShare: '',
    }
  );
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  const selectedBook = useMemo(() => BIBLE_BOOKS.find(b => b.name === formData.book) || BIBLE_BOOKS[0], [formData.book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'book') {
      setFormData(prev => ({ ...prev, chapter: 1 }));
    }
  };

  const handleGenerateTopics = async () => {
    setIsGenerating(true);
    setGenerationError('');
    const scripture = `${formData.book} ${formData.chapter}${formData.verse ? `:${formData.verse}`: ''}`;
    try {
      const topics = await generateSmallGroupTopics(scripture);
      if (topics.length > 0) {
        setFormData(prev => ({ ...prev, topic: topics.join('\n\n') }));
      } else {
        setGenerationError('AI 未能產生題目，請稍後再試。');
      }
    } catch (error) {
        setGenerationError(error instanceof Error ? error.message : '生成時發生未知錯誤。');
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-20 flex justify-center items-center p-4">
      <div className="bg-beige-50 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{share ? '編輯' : '新增'}小組分享</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="groupName" placeholder="小組名稱" value={formData.groupName} onChange={handleChange} className="w-full p-2 rounded border bg-white" />
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 rounded border bg-white" />
          </div>

          <div className="p-4 bg-beige-100 rounded-lg space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">查考經文</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select name="book" value={formData.book} onChange={handleChange} className="p-2 rounded border bg-white">
                {BIBLE_BOOKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
              <select name="chapter" value={formData.chapter} onChange={handleChange} className="p-2 rounded border bg-white">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" name="verse" placeholder="節 (例如 1-5)" value={formData.verse} onChange={handleChange} className="p-2 rounded border bg-white" />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="topic" className="font-semibold">討論題目</label>
                <button 
                  onClick={handleGenerateTopics} 
                  disabled={isGenerating}
                  className="px-3 py-1 text-xs bg-gold-light text-gold-dark font-semibold rounded-full hover:bg-gold-DEFAULT hover:text-black transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {isGenerating ? '生成中...' : '✨ AI 產生建議'}
                </button>
            </div>
            <textarea id="topic" name="topic" placeholder="分享討論的題目..." value={formData.topic} onChange={handleChange} rows={4} className="w-full p-2 rounded border bg-white" />
            {generationError && <p className="text-xs text-red-500 mt-1">{generationError}</p>}
          </div>
          
          <textarea name="myShare" placeholder="我的分享..." value={formData.myShare} onChange={handleChange} rows={6} className="w-full p-2 rounded border bg-white" />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300">取消</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 rounded bg-gold-DEFAULT text-black">儲存</button>
        </div>
      </div>
    </div>
  );
};

export default SmallGroupShareForm;
