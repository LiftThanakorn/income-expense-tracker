
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from './Icons';

interface SummaryCardsProps {
    income: number;
    expense: number;
}

const SummaryCard: React.FC<{ title: string; amount: number; type: 'income' | 'expense' }> = ({ title, amount, type }) => {
    const isIncome = type === 'income';
    const bgColor = isIncome ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50';
    const textColor = isIncome ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300';
    const iconColor = isIncome ? 'text-green-500' : 'text-red-500';
    const Icon = isIncome ? ArrowUpIcon : ArrowDownIcon;

    return (
        <div className={`rounded-xl p-4 flex items-center gap-4 shadow ${bgColor}`}>
            <div className={`p-2 rounded-full ${iconColor} bg-white dark:bg-gray-700`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-gray-500 dark:text-gray-400">{title}</p>
                <p className={`text-2xl font-bold ${textColor}`}>
                    {amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 })}
                </p>
            </div>
        </div>
    );
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({ income, expense }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <SummaryCard title="รายรับ" amount={income} type="income" />
            <SummaryCard title="รายจ่าย" amount={expense} type="expense" />
        </div>
    );
};
