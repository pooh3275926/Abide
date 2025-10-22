import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { JournalEntry } from '../types';
import { BIBLE_BOOKS } from '../constants';
import { generateApplication, generatePrayer, generateScriptureAnalysis } from '../services/geminiService';
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
  const [isGenerating, setIsGenerating] = useState({ application: false, prayer: false, analysis: false });
  const selectedBook = BIBLE_BOOKS.find(b => b.name === formData.book);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: target.value }));
    }
    if (name === 'book') {
      setFormData(prev => ({ ...prev, chapter: 1 }));
    }
  };

  const handleGenerateAnalysis = async () => {
    setIsGenerating(prev => ({ ...prev, analysis: true }));
    const res = await fetch('/api/aiHandler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'scriptureAnalysis',
        payload: { book: formData.book, chapter: formData.chapter }
      })
    });
    const data = await res.json();
    setFormData(prev => ({ ...prev, scriptureAnalysis: data.result }));
    setIsGenerating(prev => ({ ...prev, analysis: false }));
  };

  const handleGenerateApplication = async () => {
    setIsGenerating(prev => ({ ...prev, application: true }));
    const res = await fetch('/api/aiHandler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'applicationHelper',
        payload: { book: formData.book, chapter: formData.chapter }
      })
    });
    const data = await res.json();
    setFormData(prev => ({ ...prev, applicationHelper: data.result }));
    setIsGenerating(prev => ({ ...prev, application: false }));
  };

  const handleGeneratePrayer = async () => {
    setIsGenerating(prev => ({ ...prev, prayer: true }));
    const res = await fetch('/api/aiHandler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'situationalPrayer',
        payload: { book: formData.book, chapter: formData.chapter, highlights: formData.highlights }
      })
    });
    const data = await res.json();
    setFormData(prev => ({ ...prev, prayer: data.result }));
    setIsGenerating(prev => ({ ...prev, prayer: false }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-20 flex justify-center items-center p-4">
      <div className="bg-beige-50 dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{entry ? '編輯' : '新增'}日記</h2>
        <div className="space-y-4">
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

          <div>
            <label className="font-semibold">經文解析</label>
            <textarea name="scriptureAnalysis" placeholder="AI 生成的經文解析" value={formData.scriptureAnalysis} onChange={handleChange} rows={3} className="w-full p-2 rounded border bg-white dark:bg-gray-700 mt-1" />
            <button onClick={handleGenerateAnalysis} disabled={isGenerating.analysis} className="mt-1 px-3 py-1 text-sm bg-gold-light dark:bg-gold-dark rounded disabled:opacity-50">{isGenerating.analysis ? '生成中...' : '🤖 產生解析'}</button>
          </div>

          <div>
            <label className="font-semibold">應用小幫手</label>
            <textarea name="applicationHelper" placeholder="AI 生成的應用建議" value={formData.applicationHelper} onChange={handleChange} rows={3} className="w-full p-2 rounded border bg-white dark:bg-gray-700 mt-1" />
            <button onClick={handleGenerateApplication} disabled={isGenerating.application} className="mt-1 px-3 py-1 text-sm bg-gold-light dark:bg-gold-dark rounded disabled:opacity-50">{isGenerating.application ? '生成中...' : '🤖 產生建議'}</button>
          </div>

          <textarea name="godMessage" placeholder="神想告訴我什麼？" value={formData.godMessage} onChange={handleChange} rows={3} className="w-full p-2 rounded border bg-white dark:bg-gray-700" />

          <div>
            <label className="font-semibold">禱告</label>
            <textarea name="prayer" placeholder="AI 生成或手動輸入的禱告" value={formData.prayer} onChange={handleChange} rows={4} className="w-full p-2 rounded border bg-white dark:bg-gray-700 mt-1" />
            <button onClick={handleGeneratePrayer} disabled={isGenerating.prayer} className="mt-1 px-3 py-1 text-sm bg-gold-light dark:bg-gold-dark rounded disabled:opacity-50">{isGenerating.prayer ? '生成中...' : '🤖 產生禱告'}</button>
          </div>

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

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [, setTrackerProgress] = useLocalStorage<BibleTrackerProgress>('bibleTrackerProgress', {});
  const [, setGracePoints] = useLocalStorage<number>('gracePoints', 0);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // 新增狀態
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sortedEntries = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return [...entries]
      .filter(entry => 
        !lowerCaseSearchTerm ||
        entry.book.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(entry.chapter).includes(lowerCaseSearchTerm) ||
        entry.highlights.toLowerCase().includes(lowerCaseSearchTerm)
      )
      .sort((a, b) => {
        if (sortOrder === 'desc') {
            return b.date.localeCompare(a.date);
        }
        return a.date.localeCompare(b.date);
      });
  }, [entries, searchTerm, sortOrder]);

  const handleSave = (entry: JournalEntry) => {
    const oldEntry = entries.find(e => e.id === entry.id);
    const wasCompleted = oldEntry?.completed ?? false;
    if (entry.completed && !wasCompleted) {
        setGracePoints(prev => prev + 1);
    }
    
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => e.id === entry.id);
      if (existingIndex > -1) {
        const newEntries = [...prev];
        newEntries[existingIndex] = entry;
        return newEntries;
      }
      return [...prev, entry];
    });

    setTrackerProgress(prev => {
      const bookProgress = { ...(prev[entry.book] || {}) };
      
      if (entry.completed) {
        bookProgress[entry.chapter] = true;
      } else {
        delete bookProgress[entry.chapter];
      }

      if (Object.keys(bookProgress).length > 0) {
        return { ...prev, [entry.book]: bookProgress };
      } else {
        const newProgress = { ...prev };
        delete newProgress[entry.book];
        return newProgress;
      }
    });

    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteRequest = (ids: Set<string>) => {
    if (ids.size === 0) return;
    setItemsToDelete(ids);
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setItemsToDelete(new Set());
    setShowConfirmation(false);
  };

  const handleConfirmDelete = () => {
    if (itemsToDelete.size === 0) return;

    const entriesToDelete = entries.filter(e => itemsToDelete.has(e.id));
    const completedEntriesToDelete = entriesToDelete.filter(e => e.completed);

    // 更新 tracker progress
    if (completedEntriesToDelete.length > 0) {
        setTrackerProgress(currentProgress => {
            const newProgress = JSON.parse(JSON.stringify(currentProgress)); // Deep copy
            completedEntriesToDelete.forEach(entry => {
                if (newProgress[entry.book]) {
                    delete newProgress[entry.book][entry.chapter];
                    if (Object.keys(newProgress[entry.book]).length === 0) {
                        delete newProgress[entry.book];
                    }
                }
            });
            return newProgress;
        });
    }

    setEntries(prev => prev.filter(e => !itemsToDelete.has(e.id)));
    
    // Reset state
    setItemsToDelete(new Set());
    setShowConfirmation(false);
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };
  
  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleToggleExpand = (id: string) => {
    setExpandedEntryId(prevId => (prevId === id ? null : id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        {!isSelectMode ? (
          <>
            <input
                type="text"
                placeholder="搜尋書卷、章節或亮光..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow w-full p-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600"
            />
            <button onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')} className="p-2 rounded-lg bg-beige-200 dark:bg-gray-700 whitespace-nowrap text-sm">
              {sortOrder === 'desc' ? '日期 🔽' : '日期 🔼'}
            </button>
            <button onClick={() => setIsSelectMode(true)} className="p-2 rounded-lg bg-beige-200 dark:bg-gray-700 whitespace-nowrap text-sm">
              多選
            </button>
            <button 
                onClick={() => { setEditingEntry(null); setIsFormOpen(true); }} 
                className="px-6 py-2 bg-gold-DEFAULT text-black dark:text-white rounded-lg shadow-md hover:bg-gold-dark transition-colors whitespace-nowrap"
            >
              新增
            </button>
          </>
        ) : (
          <div className="w-full flex justify-between items-center p-2 bg-beige-200 dark:bg-gray-800 rounded-lg">
            <button onClick={() => setIsSelectMode(false)} className="px-3 py-2 text-sm rounded-lg bg-gray-300 dark:bg-gray-600">
              取消
            </button>
            <span className="font-bold text-sm">{`已選取 ${selectedIds.size} 項`}</span>
            <button onClick={() => handleDeleteRequest(selectedIds)} disabled={selectedIds.size === 0} className="px-3 py-2 text-sm rounded-lg bg-red-500 text-white disabled:bg-red-300">
              刪除
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sortedEntries.length > 0 ? (
          sortedEntries.map(entry => {
            const isExpanded = expandedEntryId === entry.id;
            return (
              <div key={entry.id} className={`relative bg-beige-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${isSelectMode ? 'pl-10' : ''} ${selectedIds.has(entry.id) ? 'ring-2 ring-gold-DEFAULT' : ''}`}>
                {isSelectMode && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <input 
                      type="checkbox"
                      className="h-5 w-5 rounded text-gold-dark focus:ring-gold-dark"
                      checked={selectedIds.has(entry.id)}
                      onChange={() => handleToggleSelection(entry.id)}
                      aria-label={`Select journal entry for ${entry.book} ${entry.chapter}`}
                    />
                  </div>
                )}
                <div 
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => isSelectMode ? handleToggleSelection(entry.id) : handleToggleExpand(entry.id)}
                  role="button" 
                  tabIndex={0} 
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          isSelectMode ? handleToggleSelection(entry.id) : handleToggleExpand(entry.id);
                      }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{entry.date}</p>
                        <h3 className="text-lg font-bold">{entry.book} {entry.chapter}</h3>
                        {!isExpanded && <p className="mt-2 text-sm italic">"{entry.highlights.substring(0, 100)}{entry.highlights.length > 100 ? '...' : ''}"</p>}
                      </div>
                      {!isSelectMode && (
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          {entry.completed && <span title="已完成" className="text-xl">✓</span>}
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); setIsFormOpen(true); }}
                            className="text-xl p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            aria-label={`編輯日記 ${entry.book} ${entry.chapter}`}
                          >
                            ᝰ
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteRequest(new Set([entry.id])); }}
                            className="text-xl p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50"
                            aria-label={`刪除日記 ${entry.book} ${entry.chapter}`}
                          >
                            ✘
                          </button>
                          <span className={`text-xl transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && !isSelectMode && (
                  <div className="px-4 pb-4 border-t border-beige-200 dark:border-gray-700">
                    <div className="space-y-4 mt-4">
                      <div><h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">靈修亮光</h4><p className="mt-1 text-sm whitespace-pre-wrap">{entry.highlights || '無'}</p></div>
                      <div><h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">經文解析</h4><p className="mt-1 text-sm whitespace-pre-wrap">{entry.scriptureAnalysis || '無'}</p></div>
                      <div><h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">應用小幫手</h4><p className="mt-1 text-sm whitespace-pre-wrap">{entry.applicationHelper || '無'}</p></div>
                      <div><h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">神想告訴我什麼？</h4><p className="mt-1 text-sm whitespace-pre-wrap">{entry.godMessage || '無'}</p></div>
                      <div><h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">禱告</h4><p className="mt-1 text-sm whitespace-pre-wrap">{entry.prayer || '無'}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {searchTerm ? '找不到符合的日記。' : '今天，神有話要對你說'}
          </p>
        )}
      </div>

      {isFormOpen && <JournalForm entry={editingEntry} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
      
      {showConfirmation && (
        <ConfirmationModal
            message={`您確定要刪除這 ${itemsToDelete.size} 篇日記嗎？此操作無法恢復。`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default JournalPage;
