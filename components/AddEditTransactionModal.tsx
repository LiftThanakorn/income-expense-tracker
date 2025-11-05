import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from '../types';

interface AddEditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'> | Transaction) => void;
    transactionToEdit: Transaction | null;
    categories: Category[];
}

export const AddEditTransactionModal: React.FC<AddEditTransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit, categories }) => {
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

    const filteredCategories = categories.filter(c => c.type === type);

    useEffect(() => {
        if (isOpen) {
            if (transactionToEdit) {
                setType(transactionToEdit.type);
                setCategoryId(categories.find(c => c.name === transactionToEdit.category)?.id || '');
                setAmount(String(transactionToEdit.amount));
                setNote(transactionToEdit.note || '');
                setCreatedAt(new Date(transactionToEdit.createdAt).toISOString().split('T')[0]);
            } else {
                // Reset form for new transaction
                setType(TransactionType.EXPENSE);
                setCategoryId(categories.find(c => c.type === TransactionType.EXPENSE)?.id || '');
                setAmount('');
                setNote('');
                setCreatedAt(new Date().toISOString().split('T')[0]);
            }
        }
    }, [isOpen, transactionToEdit, categories]);

    useEffect(() => {
        // When type changes, reset category to the first available one for that type
        setCategoryId(filteredCategories[0]?.id || '');
    }, [type, categories]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const categoryName = categories.find(c => c.id === categoryId)?.name;
        if (!categoryName || !amount) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        const transactionData = {
            type,
            category: categoryName,
            amount: parseFloat(amount),
            note,
            createdAt: new Date(createdAt).toISOString(),
        };

        if (transactionToEdit && transactionToEdit.id) {
            onSave({ ...transactionData, id: transactionToEdit.id });
        } else {
            onSave(transactionData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{transactionToEdit ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">ประเภท</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as TransactionType)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={TransactionType.EXPENSE}>รายจ่าย</option>
                            <option value={TransactionType.INCOME}>รายรับ</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">หมวดหมู่</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            {filteredCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">จำนวนเงิน</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            required
                            step="0.01"
                        />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">วันที่</label>
                        <input
                            type="date"
                            value={createdAt}
                            onChange={(e) => setCreatedAt(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">บันทึก</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="(ไม่บังคับ)"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">{transactionToEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มรายการ'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
