

import React, { useState, useMemo, useEffect } from 'react';
import { Category, TransactionType, Budget } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface CategorySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    budgets: Budget[];
    // FIX: Use a union type with `|` instead of a comma for multiple keys in Omit.
    onAddCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
    onDeleteCategory: (id: string) => Promise<void>;
    onUpsertBudget: (category: string, amount: number) => Promise<void>;
}

const CategoryList: React.FC<{
    title: string;
    type: TransactionType;
    categories: Category[];
    budgets: { [key: string]: number };
    // FIX: Use a union type with `|` instead of a comma for multiple keys in Omit.
    onAddCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
    onDeleteCategory: (id: string) => Promise<void>;
    onBudgetChange: (category: string, amount: number) => void;
}> = ({ title, type, categories, budgets, onAddCategory, onDeleteCategory, onBudgetChange }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [localBudgets, setLocalBudgets] = useState(budgets);

    useEffect(() => {
        setLocalBudgets(budgets);
    }, [budgets]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            await onAddCategory({ name: newCategoryName.trim(), type });
            setNewCategoryName('');
        }
    };
    
    const handleBudgetInputChange = (category: string, value: string) => {
        const amount = Number(value);
        setLocalBudgets(prev => ({...prev, [category]: amount }));
    };

    const handleBudgetSave = (category: string) => {
        const amount = localBudgets[category];
        if (typeof amount === 'number') {
            onBudgetChange(category, amount);
        }
    };

    return (
        <div>
            <h3 className={`text-lg font-semibold mb-2 ${type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{title}</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-3">
                {categories.map(cat => (
                    <li key={cat.id} className="p-2 bg-gray-700 rounded-md">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-200">{cat.name}</span>
                            <button onClick={() => onDeleteCategory(cat.id)} className="p-1 text-gray-500 hover:text-red-400">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        {type === TransactionType.EXPENSE && (
                             <div className="mt-2 flex items-center gap-2">
                                <label htmlFor={`budget-${cat.id}`} className="text-sm text-gray-400">งบประมาณ:</label>
                                <input
                                    id={`budget-${cat.id}`}
                                    type="number"
                                    placeholder="0"
                                    value={localBudgets[cat.name] || ''}
                                    onChange={(e) => handleBudgetInputChange(cat.name, e.target.value)}
                                    onBlur={() => handleBudgetSave(cat.name)}
                                    className="w-full px-2 py-1 border border-gray-600 rounded-md shadow-sm bg-gray-600 text-gray-100 text-sm"
                                />
                             </div>
                        )}
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAdd} className="flex gap-2">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="เพิ่มหมวดหมู่ใหม่"
                    className="flex-grow w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
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
    budgets,
    onAddCategory,
    onDeleteCategory,
    onUpsertBudget
}) => {
    const incomeCategories = useMemo(() => categories.filter(c => c.type === TransactionType.INCOME), [categories]);
    const expenseCategories = useMemo(() => categories.filter(c => c.type === TransactionType.EXPENSE), [categories]);
    const budgetMap = useMemo(() => budgets.reduce((acc, b) => {
        acc[b.category] = b.amount;
        return acc;
    }, {} as { [key: string]: number }), [budgets]);

    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        }
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) {
            setIsRendered(false);
        }
    };

    if (!isRendered) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0'}`} 
            onClick={onClose}
            onTransitionEnd={handleAnimationEnd}
        >
            <div 
                className={`bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl h-auto max-h-[90vh] p-6 flex flex-col modal transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-200">ตั้งค่าหมวดหมู่ & งบประมาณ</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-400 p-2 rounded-full -mr-2">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CategoryList
                        title="หมวดหมู่รายรับ"
                        type={TransactionType.INCOME}
                        categories={incomeCategories}
                        budgets={{}}
                        onAddCategory={onAddCategory}
                        onDeleteCategory={onDeleteCategory}
                        onBudgetChange={() => {}}
                    />
                    <CategoryList
                        title="หมวดหมู่รายจ่าย"
                        type={TransactionType.EXPENSE}
                        categories={expenseCategories}
                        budgets={budgetMap}
                        onAddCategory={onAddCategory}
                        onDeleteCategory={onDeleteCategory}
                        onBudgetChange={onUpsertBudget}
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