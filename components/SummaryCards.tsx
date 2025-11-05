import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { AnimatedAmount } from './AnimatedAmount';

interface SummaryCardsProps {
    transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; amount: number; color: string }> = ({ title, amount, color }) => (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <AnimatedAmount amount={amount} className={`text-3xl font-bold mt-2 ${color}`} />
    </div>
);

export const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
    const { income, expense, balance } = useMemo(() => {
        return transactions.reduce(
            (acc, transaction) => {
                if (transaction.type === TransactionType.INCOME) {
                    acc.income += transaction.amount;
                } else {
                    acc.expense += transaction.amount;
                }
                acc.balance = acc.income - acc.expense;
                return acc;
            },
            { income: 0, expense: 0, balance: 0 }
        );
    }, [transactions]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <StatCard title="รายรับ" amount={income} color="text-green-400" />
            <StatCard title="รายจ่าย" amount={expense} color="text-red-400" />
            <StatCard title="คงเหลือ" amount={balance} color={balance >= 0 ? "text-blue-400" : "text-red-400"} />
        </div>
    );
};