import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Transaction } from '../types';

// Helper to map DB snake_case to app camelCase, ensuring data consistency.
const mapTransactionFromDb = (dbTransaction: any): Transaction => ({
    id: dbTransaction.id,
    type: dbTransaction.type,
    category: dbTransaction.category,
    amount: dbTransaction.amount,
    note: dbTransaction.note || '', // Ensure note is always a string to match the type
    createdAt: dbTransaction.created_at,
});


export function useTransactions(userId: string) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
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
    }, [userId]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
        if (!userId) throw new Error("User not logged in.");
        try {
            const transactionWithUser = { ...transaction, user_id: userId };
            const { data, error } = await supabase
                .from('transactions')
                .insert([transactionWithUser])
                .select();

            if (error) throw error;
            if (!data?.[0]) throw new Error("Failed to add transaction: No data returned.");

            const newTransaction = mapTransactionFromDb(data[0]);
            setTransactions(current => [newTransaction, ...current].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

        } catch (e: any) {
            console.error("Error adding transaction:", e);
            throw e;
        }
    };

    const updateTransaction = async (transaction: Transaction) => {
        if (!userId) throw new Error("User not logged in.");
        try {
            const { id, createdAt, ...updatePayload } = transaction;
            const { data, error } = await supabase
                .from('transactions')
                .update(updatePayload)
                .eq('id', id)
                .eq('user_id', userId)
                .select();

            if (error) throw error;
            if (!data?.[0]) throw new Error(`Failed to update transaction: ID ${id} not found.`);

            const updatedTransaction = mapTransactionFromDb(data[0]);
            setTransactions(current => 
                current.map(t => t.id === id ? updatedTransaction : t)
            );

        } catch (e: any) {
            console.error("Error updating transaction:", e);
            throw e;
        }
    };

    const deleteTransaction = async (id: string) => {
        if (!userId) throw new Error("User not logged in.");
        console.log(`[useTransactions] Attempting to delete transaction with ID: ${id} for user: ${userId}`);
    
        if (!id || typeof id !== 'string') {
            const error = new Error('ID ที่ระบุสำหรับลบข้อมูลไม่ถูกต้อง');
            console.error('[useTransactions] Delete failed:', error);
            throw error;
        }
    
        try {
            const { data, error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('user_id', userId)
                .select(); 
    
            if (error) {
                console.error('[useTransactions] Supabase returned an error during deletion:', error);
                throw error;
            }
    
            if (!data || data.length === 0) {
                const notFoundError = new Error(`ไม่พบรายการที่ต้องการลบ (ID: ${id}) ในฐานข้อมูล อาจถูกลบไปแล้ว`);
                console.warn('[useTransactions] Delete operation completed, but no rows were affected.', notFoundError);
                // We still filter from state in case of a sync issue
            } else {
                console.log('[useTransactions] Successfully deleted transaction. Response data:', data);
            }
    
            setTransactions(currentTransactions =>
                currentTransactions.filter(transaction => transaction.id !== id)
            );
    
        } catch (e: any) {
            console.error('[useTransactions] An exception occurred in deleteTransaction:', e);
            throw e;
        }
    };

    return {
        transactions,
        loading,
        error,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
    };
}