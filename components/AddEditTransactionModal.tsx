import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Category } from '../types';

interface AddEditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'> | Transaction) => void;
    transactionToEdit?: Transaction | null;
    categories: Category[];
}

export const AddEditTransactionModal: React.FC<AddEditTransactionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    transactionToEdit,
    categories = [],
}) => {
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [category, setCategory] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [note, setNote] = useState<string>('');

    const currentCategories = useMemo(() => {
        return categories.filter(c => c.type === type).map(c => c.name);
    }, [type, categories]);

    useEffect(() => {
        if (transactionToEdit) {
            setType(transactionToEdit.type);
            setCategory(transactionToEdit.category);
            setAmount(String(transactionToEdit.amount));
            setNote(transactionToEdit.note);
        } else {
            // Reset form for new transaction
            const defaultType = TransactionType.EXPENSE;
            const defaultCategories = categories.filter(c => c.type === defaultType).map(c => c.name);
            setType(defaultType);
            setCategory(defaultCategories[0] || '');
            setAmount('');
            setNote('');
        }
    }, [transactionToEdit, isOpen, categories]);

    useEffect(() => {
        const newCategoryList = categories.filter(c => c.type === type).map(c => c.name);
        if (!newCategoryList.includes(category)) {
            setCategory(newCategoryList[0] || '');
        }
    }, [type, category, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!category || isNaN(numericAmount) || numericAmount <= 0) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
            return;
        }

        const newTransaction = {
            type,
            category,
            amount: numericAmount,
            note,
        };
        
        if (transactionToEdit) {
            onSave({ ...newTransaction, id: transactionToEdit.id, createdAt: transactionToEdit.createdAt });
        } else {
            onSave(newTransaction);
        }
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-gray-200">
                    {transactionToEdit ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <div className="flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`px-4 py-2 w-1/2 rounded-l-md font-semibold focus:outline-none transition-colors ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>รายรับ</button>
                            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`px-4 py-2 w-1/2 rounded-r-md font-semibold focus:outline-none transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>รายจ่าย</button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">หมวดหมู่</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100">
                            {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">จำนวนเงิน (บาท)</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100" />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-1">บันทึก (ไม่บังคับ)</label>
                        <input type="text" id="note" value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold text-gray-300 bg-gray-600 hover:bg-gray-500">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};