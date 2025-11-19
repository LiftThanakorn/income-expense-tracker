import React from 'react';
import { Transaction, TransactionType } from '../types';
import { PencilIcon, TrashIcon } from './Icons';
import { EmptyState } from './EmptyState';

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    onAddTransaction: () => void;
}

const TransactionItem: React.FC<{ transaction: Transaction; onEdit: (t: Transaction) => void; onDelete: (id: string) => void; index: number; }> = ({ transaction, onEdit, onDelete, index }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
    const sign = isIncome ? '+' : '-';
    
    return (
        <li 
            className="relative p-4 bg-gray-800 rounded-xl shadow-md flex items-center justify-between space-x-4 animate-list-item z-0 hover:bg-gray-750 transition-colors"
            style={{ animationDelay: `${index * 75}ms` }}
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{transaction.category}</p>
                <p className="text-sm text-gray-400 truncate">{transaction.note || ' '}</p>
            </div>
            <div className="flex-shrink-0 text-right">
                <p className={`text-sm font-semibold ${amountColor}`}>
                    {sign} {transaction.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 relative z-10">
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(transaction); }} 
                    className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-700 transition-colors"
                    title="แก้ไข"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(transaction.id); }} 
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-700 transition-colors"
                    title="ลบ"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </li>
    );
};


export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete, onAddTransaction }) => {
    if (transactions.length === 0) {
        return <EmptyState onAddTransaction={onAddTransaction} />;
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-200 mb-4">รายการล่าสุด</h2>
            <ul className="space-y-4 pb-4">
                {transactions.map((transaction, index) => (
                    <TransactionItem key={transaction.id} transaction={transaction} onEdit={onEdit} onDelete={onDelete} index={index} />
                ))}
            </ul>
        </div>
    );
};