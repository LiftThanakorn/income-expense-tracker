import React, { useState, useEffect } from 'react';
import { Category, TransactionType, Budget } from '../types';
import { TrashIcon, PlusIcon } from './Icons';

interface CategorySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    budgets: Budget[];
    onAddCategory: (category: Omit<Category, 'id' | 'created_at'>) => void;
    onDeleteCategory: (id: string) => void;
    onUpsertBudget: (category: string, amount: number) => void;
}

export const CategorySettingsModal: React.FC<CategorySettingsModalProps> = ({ isOpen, onClose, categories, budgets, onAddCategory, onDeleteCategory, onUpsertBudget }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [budgetAmounts, setBudgetAmounts] = useState<{ [key: string]: string }>({});
    const [activeTab, setActiveTab] = useState<'categories' | 'budgets'>('categories');

    const incomeCategories = categories.filter(c => c.type === TransactionType.INCOME);
    const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);

    useEffect(() => {
        if (isOpen) {
            const initialBudgets = budgets.reduce((acc, budget) => {
                acc[budget.category] = String(budget.amount);
                return acc;
            }, {} as { [key: string]: string });
            setBudgetAmounts(initialBudgets);
        }
    }, [isOpen, budgets]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            onAddCategory({ name: newCategoryName.trim(), type: newCategoryType });
            setNewCategoryName('');
        }
    };
    
    const handleBudgetChange = (categoryName: string, amountStr: string) => {
        setBudgetAmounts(prev => ({ ...prev, [categoryName]: amountStr }));
    };
    
    const handleBudgetBlur = (categoryName: string) => {
        const amountStr = budgetAmounts[categoryName];
        const amount = parseFloat(amountStr) || 0;
        const existingBudget = budgets.find(b => b.category === categoryName)?.amount || 0;
        
        // Only call API if value has changed
        if(amount !== existingBudget) {
            onUpsertBudget(categoryName, amount);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">ตั้งค่า</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="border-b border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('categories')} className={`${activeTab === 'categories' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-400'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>
                            หมวดหมู่
                        </button>
                        <button onClick={() => setActiveTab('budgets')} className={`${activeTab === 'budgets' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-400'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>
                            งบประมาณ
                        </button>
                    </nav>
                </div>

                <div className="overflow-y-auto flex-grow">
                    {activeTab === 'categories' && (
                        <div>
                            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่" className="flex-grow p-2 bg-gray-700 rounded border border-gray-600"/>
                                <select value={newCategoryType} onChange={e => setNewCategoryType(e.target.value as TransactionType)} className="p-2 bg-gray-700 rounded border border-gray-600">
                                    <option value={TransactionType.EXPENSE}>รายจ่าย</option>
                                    <option value={TransactionType.INCOME}>รายรับ</option>
                                </select>
                                <button type="submit" className="p-2 bg-blue-600 rounded"><PlusIcon className="w-5 h-5"/></button>
                            </form>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold text-green-400 mb-2">รายรับ</h3>
                                    <ul className="space-y-2">
                                        {incomeCategories.map(cat => (
                                            <li key={cat.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                                                <span>{cat.name}</span>
                                                <button onClick={() => onDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-red-400 mb-2">รายจ่าย</h3>
                                    <ul className="space-y-2">
                                        {expenseCategories.map(cat => (
                                            <li key={cat.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                                                <span>{cat.name}</span>
                                                <button onClick={() => onDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'budgets' && (
                         <div>
                            <h3 className="font-semibold text-blue-400 mb-2">ตั้งงบประมาณรายจ่าย</h3>
                            <p className="text-sm text-gray-500 mb-4">กำหนดงบประมาณสำหรับแต่ละหมวดหมู่รายจ่าย การเปลี่ยนแปลงจะถูกบันทึกอัตโนมัติ</p>
                             <ul className="space-y-3">
                                {expenseCategories.map(cat => (
                                    <li key={cat.id} className="flex justify-between items-center gap-4">
                                        <label htmlFor={`budget-${cat.id}`} className="flex-grow">{cat.name}</label>
                                        <div className="relative">
                                            <input
                                                id={`budget-${cat.id}`}
                                                type="number"
                                                value={budgetAmounts[cat.name] || ''}
                                                onChange={e => handleBudgetChange(cat.name, e.target.value)}
                                                onBlur={() => handleBudgetBlur(cat.name)}
                                                placeholder="0"
                                                className="w-32 p-2 bg-gray-700 rounded border border-gray-600 text-right pr-8"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">บาท</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
