import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Transaction, TransactionType } from '../types';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }
            setTransactions(data as Transaction[]);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch transactions');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
        try {
            const newTransaction = {
                ...transaction,
                // Supabase client maps camelCase to snake_case automatically on insert
            };
            const { data, error } = await supabase
                .from('transactions')
                .insert([newTransaction])
                .select();
            
            if (error) {
                throw error;
            }
            
            if (data) {
                setTransactions(prev => [data[0] as Transaction, ...prev]);
            }
            return data;
        } catch (e: any) {
            setError(e.message || 'Failed to add transaction');
            console.error(e);
            throw e;
        }
    };

    const updateTransaction = async (transaction: Transaction) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .update(transaction)
                .eq('id', transaction.id)
                .select();

            if (error) {
                throw error;
            }
            
            if (data) {
                setTransactions(prev => prev.map(t => (t.id === transaction.id ? data[0] as Transaction : t)));
            }
            return data;
        } catch (e: any) {
            setError(e.message || 'Failed to update transaction');
            console.error(e);
            throw e;
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }
            
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (e: any) {
            setError(e.message || 'Failed to delete transaction');
            console.error(e);
            throw e;
        }
    };

    const income = transactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        transactions,
        loading,
        error,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        income,
        expense
    };
}