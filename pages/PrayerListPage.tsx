// pages/PrayerListPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PrayerItem } from '../types';
import PrayerForm from '../components/PrayerForm';
import ConfirmationModal from './ConfirmationModal';

const PrayerListPage: React.FC = () => {
    const [items, setItems] = useLocalStorage<PrayerItem[]>('prayerItems', []);
    const [editingItem, setEditingItem] = useState<PrayerItem | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState<Set<string>>(new Set());

    // 新增狀態
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filteredItems = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return items
            .filter(item => 
                item.person.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.content.toLowerCase().includes(lowerCaseSearchTerm)
            )
            .sort((a, b) => {
                if(sortOrder === 'desc') {
                    return b.prayerDate.localeCompare(a.prayerDate);
                }
                return a.prayerDate.localeCompare(b.prayerDate);
            });
    }, [items, searchTerm, sortOrder]);

    const handleSave = useCallback((item: PrayerItem) => {
        setItems(prev => {
            const exists = prev.some(i => i.id === item.id);
            if (exists) {
                return prev.map(i => i.id === item.id ? item : i);
            }
            return [...prev, item];
        });
        setIsFormOpen(false);
        setEditingItem(null);
    }, [setItems]);

    const handleDeleteRequest = (ids: Set<string>) => {
        if (ids.size === 0) return;
        setItemsToDelete(ids);
        setShowConfirmation(true);
    };

    const handleConfirmDelete = useCallback(() => {
        if (itemsToDelete.size > 0) {
            setItems(prevItems => prevItems.filter(item => !itemsToDelete.has(item.id)));
        }
        setItemsToDelete(new Set());
        setShowConfirmation(false);
        setIsSelectMode(false);
        setSelectedIds(new Set());
    }, [itemsToDelete, setItems]);

    const handleCancelDelete = useCallback(() => {
        setItemsToDelete(new Set());
        setShowConfirmation(false);
    }, []);

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
    
    const calculateDaysPassed = (dateStr: string) => {
        const prayerDate = new Date(dateStr);
        const today = new Date();
        prayerDate.setUTCHours(0, 0, 0, 0);
        today.setUTCHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - prayerDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                {!isSelectMode ? (
                    <>
                        <input
                            type="text"
                            placeholder="搜尋標題、對象或內容..."
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
                            onClick={() => { 
                                setEditingItem(null); 
                                setIsFormOpen(true); 
                            }} 
                            className="px-4 py-2 bg-gold-DEFAULT text-gray-900 dark:text-white rounded-lg shadow-md hover:bg-gold-dark transition-colors whitespace-nowrap"
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
                {filteredItems.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">{searchTerm ? '找不到禱告事項' : '開始禱告、讓神工作'}</p>
                ) : (
                    filteredItems.map(item => (
                        <div 
                            key={item.id} 
                            className={`relative rounded-lg shadow-sm transition-all duration-300 ${item.answered ? 'bg-gold-light/60 dark:bg-gold-dark/40' : 'bg-beige-50 dark:bg-gray-800'} ${isSelectMode ? 'pl-10 cursor-pointer' : ''} ${selectedIds.has(item.id) ? 'ring-2 ring-gold-DEFAULT' : ''}`}
                            onClick={() => isSelectMode && handleToggleSelection(item.id)}
                            role={isSelectMode ? 'button' : undefined}
                            tabIndex={isSelectMode ? 0 : -1}
                            onKeyDown={(e) => {
                                if (isSelectMode && e.key === 'Enter') {
                                    handleToggleSelection(item.id);
                                }
                            }}
                        >
                            {isSelectMode && (
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <input 
                                    type="checkbox"
                                    className="h-5 w-5 rounded text-gold-dark focus:ring-gold-dark pointer-events-none"
                                    checked={selectedIds.has(item.id)}
                                    readOnly
                                    tabIndex={-1}
                                    aria-label={`Select prayer item: ${item.title}`}
                                />
                                </div>
                            )}
                            <div className="p-4 flex items-start">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold">{item.title} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({item.person})</span></h3>
                                            <p className="mt-2 text-sm whitespace-pre-wrap">{item.content}</p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2 ml-2 flex-shrink-0">
                                            {item.answered ? (
                                                <span title={`應允於 ${item.answeredDate}`} className="text-xl text-gold-dark dark:text-gold-light">✞ 神已應允</span>
                                            ) : (
                                                <span title="禱告中" className="text-xl text-gold-DEFAULT">🪶 願神垂聽</span>
                                            )}
                                            {!isSelectMode && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setEditingItem(item); 
                                                            setIsFormOpen(true); 
                                                        }} 
                                                        className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                                                    >
                                                        ᝰ 編輯
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation();
                                                            handleDeleteRequest(new Set([item.id])); 
                                                        }} 
                                                        className="text-xs px-2 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 rounded"
                                                    >
                                                        ✘ 刪除
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 py-3 px-4 border-t border-beige-200 dark:border-gray-700 flex justify-between">
                                <span>禱告日: {item.prayerDate}</span>
                                <span>已過天數: {calculateDaysPassed(item.prayerDate)} 天</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {isFormOpen && <PrayerForm item={editingItem} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}

            {showConfirmation && (
                <ConfirmationModal
                    message={`您確定要刪除這 ${itemsToDelete.size} 個禱告事項嗎？此操作無法恢復。`}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default PrayerListPage;
