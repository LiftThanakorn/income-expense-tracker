import React, { useState, useMemo } from 'react';
import { Category, TransactionType } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface CategorySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onAddCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
    onDeleteCategory: (id: string) => Promise<void>;
}

const CategoryList: React.FC<{
    title: string;
    type: TransactionType;
    categories: Category[];
    onAddCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
    onDeleteCategory: (id: string) => Promise<void>;
}> = ({ title, type, categories, onAddCategory, onDeleteCategory }) => {
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            await onAddCategory({ name: newCategoryName.trim(), type });
            setNewCategoryName('');
        }
    };

    return (
        <div>
            <h3 className={`text-lg font-semibold mb-2 ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{title}</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-3">
                {categories.map(cat => (
                    <li key={cat.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <span className="text-gray-800 dark:text-gray-200">{cat.name}</span>
                        <button onClick={() => onDeleteCategory(cat.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAdd} className="flex gap-2">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="เพิ่มหมวดหมู่ใหม่"
                    className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button type="submit" className="p-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export const CategorySettingsModal: React.FC<CategorySettingsModalProps> = ({
    isOpen,
    onClose,
    categories,
    onAddCategory,
    onDeleteCategory,
}) => {
    const incomeCategories = useMemo(() => categories.filter(c => c.type === TransactionType.INCOME), [categories]);
    const expenseCategories = useMemo(() => categories.filter(c => c.type === TransactionType.EXPENSE), [categories]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl h-auto max-h-[90vh] p-6 flex flex-col modal" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">ตั้งค่าหมวดหมู่</h2>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 p-2 rounded-full -mr-2">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CategoryList
                        title="หมวดหมู่รายรับ"
                        type={TransactionType.INCOME}
                        categories={incomeCategories}
                        onAddCategory={onAddCategory}
                        onDeleteCategory={onDeleteCategory}
                    />
                    <CategoryList
                        title="หมวดหมู่รายจ่าย"
                        type={TransactionType.EXPENSE}
                        categories={expenseCategories}
                        onAddCategory={onAddCategory}
                        onDeleteCategory={onDeleteCategory}
                    />
                </div>
                
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold text-white bg-gray-500 hover:bg-gray-600">
                        เสร็จสิ้น
                    </button>
                </div>
            </div>
        </div>
    );
};