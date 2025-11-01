
import React, { useMemo } from 'react';
import { Budget, Transaction, TransactionType } from '../types';

interface BudgetProgressItemProps {
    budget: Budget;
    spent: number;
}

const BudgetProgressItem: React.FC<BudgetProgressItemProps> = ({ budget, spent }) => {
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    let progressBarColor = 'bg-green-500';
    if (percentage > 100) {
        progressBarColor = 'bg-red-500';
    } else if (percentage > 80) {
        progressBarColor = 'bg-yellow-500';
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-200">{budget.category}</span>
                <span className="text-sm text-gray-400">
                    {spent.toLocaleString('th-TH')} / {budget.amount.toLocaleString('th-TH')} บาท
                </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${progressBarColor}`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
            {percentage > 100 && (
                 <p className="text-xs text-red-400 mt-1 text-right">
                    เกินงบประมาณ {Math.abs(budget.amount - spent).toLocaleString('th-TH')} บาท
                </p>
            )}
        </div>
    );
};

interface BudgetStatusListProps {
    budgets: Budget[];
    transactions: Transaction[];
    title: string;
}

export const BudgetStatusList: React.FC<BudgetStatusListProps> = ({ budgets, transactions, title }) => {
    const spendingByCategroy = useMemo(() => {
        // The transactions prop is now pre-filtered by date range from App.tsx
        return transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as { [key: string]: number });
    }, [transactions]);

    const relevantBudgets = useMemo(() => {
        // Only show budgets that have spending in the current period or have an amount > 0
        return budgets.filter(b => spendingByCategroy[b.category] !== undefined || b.amount > 0);
    }, [budgets, spendingByCategroy]);
    
    if (relevantBudgets.length === 0) {
        return null;
    }

    return (
        <div className="my-6">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relevantBudgets.map(budget => (
                    <BudgetProgressItem 
                        key={budget.id}
                        budget={budget}
                        spent={spendingByCategroy[budget.category] || 0}
                    />
                ))}
            </div>
        </div>
    );
};
