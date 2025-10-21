// pages/PrayerListPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PrayerItem } from '../types';
import PrayerForm from '../components/PrayerForm';
import ConfirmationModal from './ConfirmationModal'; // <-- 引入新的確認 Modal 組件

const PrayerListPage: React.FC = () => {
    const [items, setItems] = useLocalStorage<PrayerItem[]>('prayerItems', []);
    const [editingItem, setEditingItem] = useState<PrayerItem | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 新增狀態來控制確認 Modal
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null); // 儲存待刪除項目的 ID

    const filteredItems = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return items
            .filter(item => 
                item.person.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.content.toLowerCase().includes(lowerCaseSearchTerm)
            )
            .sort((a, b) => b.prayerDate.localeCompare(a.prayerDate));
    }, [items, searchTerm]);

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

    // 觸發確認 Modal 的顯示
    const confirmDeleteItem = useCallback((id: string) => {
        setItemToDeleteId(id);
        setShowConfirmation(true);
    }, []);

    // 當使用者在自定義 Modal 中點擊「確認」時
    const handleConfirmDelete = useCallback(() => {
        if (itemToDeleteId) {
            console.log('使用者確認刪除，正在執行刪除邏輯，ID:', itemToDeleteId);
            setItems(prevItems => prevItems.filter(item => item.id !== itemToDeleteId));
            setItemToDeleteId(null); // 清空待刪除 ID
        }
        setShowConfirmation(false); // 關閉確認 Modal
    }, [itemToDeleteId, setItems]);

    // 當使用者在自定義 Modal 中點擊「取消」時
    const handleCancelDelete = useCallback(() => {
        console.log('使用者取消刪除。');
        setItemToDeleteId(null); // 清空待刪除 ID
        setShowConfirmation(false); // 關閉確認 Modal
    }, []);
    
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
                <input
                    type="text"
                    placeholder="搜尋標題、對象或內容..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600"
                />
                <button 
                    onClick={() => { 
                        setEditingItem(null); 
                        setIsFormOpen(true); 
                    }} 
                    className="px-4 py-2 bg-gold-DEFAULT text-gray-900 dark:text-white rounded-lg shadow-md hover:bg-gold-dark transition-colors whitespace-nowrap"
                >
                    新增禱告
                </button>
            </div>

            <div className="space-y-4">
                {filteredItems.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">開始禱告、讓神工作</p>
                ) : (
                    filteredItems.map(item => {
                        return (
                            <div 
                                key={item.id} 
                                className={`rounded-lg shadow-sm ${item.answered ? 'bg-gold-light/60 dark:bg-gold-dark/40' : 'bg-beige-50 dark:bg-gray-800'}`}
                            >
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
                                                            // 這裡不再直接呼叫 handleDelete，而是觸發確認 Modal
                                                            confirmDeleteItem(item.id); 
                                                        }} 
                                                        className="text-xs px-2 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 rounded"
                                                    >
                                                        ✘ 刪除
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 py-3 px-4 border-t border-beige-200 dark:border-gray-700 flex justify-between">
                                    <span>禱告日: {item.prayerDate}</span>
                                    <span>已過天數: {calculateDaysPassed(item.prayerDate)} 天</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
            {/* 渲染表單 Modal */}
            {isFormOpen && <PrayerForm item={editingItem} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}

            {/* 渲染自定義確認 Modal */}
            {showConfirmation && (
                <ConfirmationModal
                    message="您確定要刪除這個禱告事項嗎？此操作無法恢復。"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default PrayerListPage;