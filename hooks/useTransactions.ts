import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Transaction, TransactionType } from '../types';

// Helper to map DB snake_case to app camelCase, ensuring data consistency.
const mapTransactionFromDb = (dbTransaction: any): Transaction => ({
    id: dbTransaction.id,
    type: dbTransaction.type,
    category: dbTransaction.category,
    amount: dbTransaction.amount,
    note: dbTransaction.note,
    createdAt: dbTransaction.created_at,
});


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
            setTransactions(data ? data.map(mapTransactionFromDb) : []);
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
            const { data, error } = await supabase
                .from('transactions')
                .insert([transaction])
                .select();
            
            if (error) {
                throw error;
            }
            
            if (data) {
                setTransactions(prev => [mapTransactionFromDb(data[0]), ...prev]);
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
            const { id, createdAt, ...updatePayload } = transaction;
            const { data, error } = await supabase
                .from('transactions')
                .update(updatePayload)
                .eq('id', id)
                .select();

            if (error) {
                throw error;
            }
            
            if (data) {
                const updatedTx = mapTransactionFromDb(data[0]);
                setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
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