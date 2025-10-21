import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateQuickRead } from '../services/geminiService';
import { QuickReadEntry } from '../types';
import ConfirmationModal from './ConfirmationModal';

const QuickReadPage: React.FC = () => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentResult, setCurrentResult] = useState<Omit<QuickReadEntry, 'id' | 'date' | 'userInput'> | null>(null);

    const [history, setHistory] = useLocalStorage<QuickReadEntry[]>('quickReadHistory', []);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
    
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState<Set<string>>(new Set());

    const handleGenerate = async () => {
        if (!userInput.trim()) {
            setError('請輸入經文或章節參考。');
            return;
        }
        setError('');
        setIsLoading(true);
        setCurrentResult(null);

        try {
            const result = await generateQuickRead(userInput);
            setCurrentResult(result);

            const newEntry: QuickReadEntry = {
                id: crypto.randomUUID(),
                date: new Date().toISOString().split('T')[0],
                userInput,
                ...result,
            };
            setHistory(prev => [newEntry, ...prev]);
            setUserInput('');
        } catch (err) {
            setError(err instanceof Error ? err.message : '生成時發生錯誤，請稍後再試。');
        } finally {
            setIsLoading(false);
        }
    };

    const sortedHistory = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return [...history]
            .filter(entry =>
                !lowerCaseSearch ||
                entry.userInput.toLowerCase().includes(lowerCaseSearch) ||
                entry.analysis.toLowerCase().includes(lowerCaseSearch) ||
                entry.application.toLowerCase().includes(lowerCaseSearch)
            )
            .sort((a, b) => {
                if (sortOrder === 'desc') {
                    return b.date.localeCompare(a.date);
                }
                return a.date.localeCompare(b.date);
            });
    }, [history, searchTerm, sortOrder]);

    const handleDeleteRequest = (ids: Set<string>) => {
        if (ids.size === 0) return;
        setItemsToDelete(ids);
        setShowConfirmation(true);
    };

    const handleConfirmDelete = () => {
        if (itemsToDelete.size > 0) {
            setHistory(prev => prev.filter(entry => !itemsToDelete.has(entry.id)));
        }
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

    return (
        <div className="container mx-auto max-w-2xl">
            <p className="mt-4 text-center text-gray-600 dark:text-gray-400 mb-6">
                貼上經文內容，或輸入創世記 1~2:12這類格式，<br />
                讓 AI 協助您快速領受神的話語。
            </p>

            <div className="mb-8">
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="例如：約翰福音 3:16"
                    rows={4}
                    className="w-full p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-gold-DEFAULT focus:outline-none"
                />
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="mt-4 w-full px-8 py-3 bg-gold-DEFAULT text-black dark:text-white rounded-lg shadow-md hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
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
                        '📖 產生靈修'
                    )}
                </button>
            </div>

            {currentResult && !isLoading && (
                <div className="mb-12 p-6 bg-beige-50 dark:bg-gray-800 rounded-lg shadow-inner text-left animate-fade-in">
                    <div className="space-y-4">
                        <div><h3 className="font-bold text-lg text-gold-dark dark:text-gold-light">📜 經文解析</h3><p className="mt-1 whitespace-pre-wrap">{currentResult.analysis}</p></div>
                        <div><h3 className="font-bold text-lg text-gold-dark dark:text-gold-light">💡 應用小幫手</h3><p className="mt-1 whitespace-pre-wrap">{currentResult.application}</p></div>
                        <div><h3 className="font-bold text-lg text-gold-dark dark:text-gold-light">🙏 結束禱告</h3><p className="mt-1 whitespace-pre-wrap">{currentResult.prayer}</p></div>
                    </div>
                </div>
            )}
            
            <div className="mt-12 text-left">
                <h3 className="text-xl font-bold text-gold-dark dark:text-gold-light mb-4 text-center">解經紀錄</h3>

                <div className="flex justify-between items-center mb-6 gap-4">
                    {!isSelectMode ? (
                        <>
                            <input
                                type="text"
                                placeholder="搜尋..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-grow p-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600"
                            />
                            <button onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')} className="p-2 rounded-lg bg-beige-200 dark:bg-gray-700 whitespace-nowrap text-sm">
                                {sortOrder === 'desc' ? '日期 🔽' : '日期 🔼'}
                            </button>
                            <button onClick={() => setIsSelectMode(true)} className="p-2 rounded-lg bg-beige-200 dark:bg-gray-700 whitespace-nowrap text-sm">
                                多選
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
                    {sortedHistory.length > 0 ? (
                        sortedHistory.map(entry => {
                            const isExpanded = expandedEntryId === entry.id;
                            return (
                                <div 
                                    key={entry.id}
                                    onClick={() => isSelectMode ? handleToggleSelection(entry.id) : setExpandedEntryId(isExpanded ? null : entry.id)}
                                    className={`relative bg-beige-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 cursor-pointer ${isSelectMode ? 'pl-10' : ''} ${selectedIds.has(entry.id) ? 'ring-2 ring-gold-DEFAULT' : ''}`}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter') isSelectMode ? handleToggleSelection(entry.id) : setExpandedEntryId(isExpanded ? null : entry.id)}}
                                    aria-expanded={isExpanded}
                                >
                                    {isSelectMode && (
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <input 
                                                type="checkbox"
                                                className="h-5 w-5 rounded text-gold-dark focus:ring-gold-dark"
                                                checked={selectedIds.has(entry.id)}
                                                readOnly
                                                tabIndex={-1}
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-grow pr-4">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</p>
                                                <p className="font-semibold mt-1 truncate">主題：{entry.userInput}</p>
                                            </div>
                                            {!isSelectMode && <span className={`text-xl transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>}
                                        </div>
                                    </div>

                                    {isExpanded && !isSelectMode && (
                                        <div className="px-4 pb-4 border-t border-beige-200 dark:border-gray-700">
                                            <div className="space-y-4 mt-4">
                                                <div><h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">經文解析</h4><p className="mt-1 text-sm whitespace-pre-wrap">{entry.analysis}</p></div>
                                                <div><h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">應用小幫手</h4><p className="mt-1 text-sm whitespace-pre-wrap">{entry.application}</p></div>
                                                <div><h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300">禱告</h4><p className="mt-1 text-sm whitespace-pre-wrap">{entry.prayer}</p></div>
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(new Set([entry.id])); }}
                                                        className="text-xs px-3 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 rounded"
                                                    >
                                                        ✘ 刪除
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 py-8">{searchTerm ? '找不到紀錄' : '還沒有解經紀錄'}</p>
                    )}
                </div>
            </div>

            {showConfirmation && (
                <ConfirmationModal
                    message={`您確定要刪除這 ${itemsToDelete.size} 筆紀錄嗎？此操作無法恢復。`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowConfirmation(false)}
                />
            )}
        </div>
    );
};

export default QuickReadPage;
