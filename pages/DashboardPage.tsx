import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateSituationalPrayer } from '../services/geminiService';
import { SituationalPrayer } from '../types';
import ConfirmationModal from './ConfirmationModal';

// 編輯禱告彈窗
const PrayerHistoryEditForm: React.FC<{
  prayer: SituationalPrayer;
  onSave: (updatedPrayer: SituationalPrayer) => void;
  onCancel: () => void;
}> = ({ prayer, onSave, onCancel }) => {
  const [currentSituation, setCurrentSituation] = useState(prayer.situation);

  const handleSave = () => {
    onSave({ ...prayer, situation: currentSituation });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex justify-center items-center p-4">
      <div className="bg-beige-50 dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">編輯狀況</h2>
        <textarea
          value={currentSituation}
          onChange={(e) => setCurrentSituation(e.target.value)}
          rows={5}
          className="w-full p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-gold-DEFAULT focus:outline-none"
          aria-label="Edit your situation"
        />
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600">取消</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-gold-DEFAULT text-gray-900 dark:text-white">儲存</button>
        </div>
      </div>
    </div>
  );
};

// 主頁面
const INeedYouPage: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [prayer, setPrayer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [prayerHistory, setPrayerHistory] = useLocalStorage<SituationalPrayer[]>('situationalPrayers', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPrayerId, setExpandedPrayerId] = useState<string | null>(null);
  const [editingPrayer, setEditingPrayer] = useState<SituationalPrayer | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  // 刪除禱告
  const handleDeleteRequest = (id: string) => {
    setItemToDeleteId(id);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDeleteId) {
      setPrayerHistory(prev => prev.filter(p => p.id !== itemToDeleteId));
    }
    setItemToDeleteId(null);
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setItemToDeleteId(null);
    setShowConfirmation(false);
  };

  // 過濾與排序
  const filteredHistory = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return prayerHistory
      .filter(p => !searchTerm || p.situation.toLowerCase().includes(lowerSearch) || p.prayer.toLowerCase().includes(lowerSearch))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [prayerHistory, searchTerm]);

  // 生成禱告
  const handleGeneratePrayer = async () => {
    if (!situation.trim()) {
      setError('請輸入您的狀況或感受。');
      return;
    }
    setError('');
    setIsLoading(true);
    setPrayer('');

    try {
      const generatedPrayer = await generateSituationalPrayer(situation);
      setPrayer(generatedPrayer);

      const newPrayerRecord: SituationalPrayer = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        situation,
        prayer: generatedPrayer,
      };
      setPrayerHistory(prev => [newPrayerRecord, ...prev]);
      setSituation('');
    } catch {
      setError('生成禱告時發生錯誤，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  // 重新生成禱告
  const handleRegeneratePrayer = async (prayerToRegen: SituationalPrayer) => {
    setRegeneratingId(prayerToRegen.id);
    try {
      const newPrayerText = await generateSituationalPrayer(prayerToRegen.situation);
      setPrayerHistory(prev => prev.map(p => p.id === prayerToRegen.id ? { ...p, prayer: newPrayerText } : p));
    } catch (err) {
      console.error('Failed to regenerate prayer', err);
    } finally {
      setRegeneratingId(null);
    }
  };

  // 儲存編輯後的禱告
  const handleSaveEditedPrayer = (updatedPrayer: SituationalPrayer) => {
    setPrayerHistory(prev => prev.map(p => (p.id === updatedPrayer.id ? updatedPrayer : p)));
    setEditingPrayer(null);
  };

  return (
    <div className="container mx-auto max-w-xl text-center p-4">
      <p className="mt-4 text-gray-600 dark:text-gray-400 mb-6">
        無論您正經歷什麼，都可以來到神的面前。<br />
        請告訴我們您的處境，讓 Abide 協助您組織禱告。
      </p>

      {/* 輸入區 */}
      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        placeholder="例如：我對未來感到迷惘，請為我禱告..."
        rows={5}
        className="w-full p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-gold-DEFAULT focus:outline-none"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        onClick={handleGeneratePrayer}
        disabled={isLoading}
        className="mt-4 px-8 py-3 bg-gold-DEFAULT text-black dark:text-white rounded-lg shadow-md hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            生成中...
          </>
        ) : (
          '🕊️ 產生禱告'
        )}
      </button>

      {/* 顯示 AI 生成的禱告 */}
      {prayer && !isLoading && (
        <div className="mt-8 p-6 bg-beige-50 dark:bg-gray-800 rounded-lg shadow-inner text-left">
          <h3 className="text-lg font-semibold mb-3">我們一起禱告：</h3>
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{prayer}</p>
        </div>
      )}

      {/* 禱告紀錄 */}
      <div className="mt-12 text-left">
        <h3 className="text-xl font-bold text-gold-dark dark:text-gold-light mb-4 text-center">禱告紀錄</h3>

        <input
          type="text"
          placeholder="搜尋狀況或禱告內容..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 mb-4"
        />

        <div className="space-y-4">
          {filteredHistory.length > 0 ? filteredHistory.map(p => {
            const isExpanded = expandedPrayerId === p.id;
            return (
              <div key={p.id} className="bg-beige-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300">
                <div 
                  className="p-4 cursor-pointer" 
                  onClick={() => setExpandedPrayerId(isExpanded ? null : p.id)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setExpandedPrayerId(isExpanded ? null : p.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{p.date}</p>
                      <p className="font-semibold mt-1 truncate">狀況：{p.situation}</p>
                    </div>
                    <span className={`text-xl transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-beige-200 dark:border-gray-700">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">禱告內容</h4>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{p.prayer}</p>

                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRegeneratePrayer(p); }}
                          disabled={regeneratingId === p.id}
                          className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded disabled:opacity-50 flex items-center"
                        >
                          {regeneratingId === p.id ? '生成中...' : '↺ 重新生成'}
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingPrayer(p); }}
                          className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                        >
                          ᝰ 編輯
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRequest(p.id); }}
                          className="text-xs px-3 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-700"
                        >
                          ✘ 刪除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <p className="text-center text-gray-500 py-4">我們一起禱告吧</p>
          )}
        </div>
      </div>

      {/* 編輯彈窗 */}
      {editingPrayer && (
        <PrayerHistoryEditForm
          prayer={editingPrayer}
          onSave={handleSaveEditedPrayer}
          onCancel={() => setEditingPrayer(null)}
        />
      )}

      {/* 確認刪除彈窗 */}
      {showConfirmation && (
        <ConfirmationModal
            message="您確定要刪除這筆禱告紀錄嗎？此操作無法恢復。"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default INeedYouPage;