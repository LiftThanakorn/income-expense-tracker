import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import { supabase } from '../services/supabaseClient';

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setError('ไม่สามารถโหลดข้อมูลจาก Supabase ได้: ' + error.message);
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        } else {
            // Map snake_case `created_at` from db to camelCase `createdAt` in the app
            const mappedData = data.map(t => ({
                ...t,
                note: t.note ?? '', // Ensure note is not null
                createdAt: t.created_at,
            }));
            setTransactions(mappedData as Transaction[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
        const { type, category, amount, note } = transaction;
        
        const { data, error } = await supabase
            .from('transactions')
            .insert([{ type, category, amount, note }])
            .select()
            .single();

        if (error) {
            setError('ไม่สามารถเพิ่มรายการได้: ' + error.message);
            console.error('Error adding transaction:', error);
        } else if (data) {
            const addedTransaction = { ...data, createdAt: data.created_at, note: data.note ?? '' } as Transaction;
            setTransactions(prev => [addedTransaction, ...prev]);
        }
    }, []);

    const updateTransaction = useCallback(async (updatedTransaction: Transaction) => {
        const { id, type, category, amount, note } = updatedTransaction;
        
        const { data, error } = await supabase
            .from('transactions')
            .update({ type, category, amount, note })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            setError('ไม่สามารถอัปเดตรายการได้: ' + error.message);
            console.error('Error updating transaction:', error);
        } else if(data) {
            const changedTransaction = { ...data, createdAt: data.created_at, note: data.note ?? '' } as Transaction;
            setTransactions(prev =>
                prev.map(t => (t.id === changedTransaction.id ? changedTransaction : t))
            );
        }
    }, []);

    const deleteTransaction = useCallback(async (id: string) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            setError('ไม่สามารถลบรายการได้: ' + error.message);
            console.error('Error deleting transaction:', error);
        } else {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    }, []);

    return { transactions, addTransaction, updateTransaction, deleteTransaction, loading, error };
};