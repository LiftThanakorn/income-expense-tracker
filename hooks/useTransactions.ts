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

            if (error) throw error;
            if (!data?.[0]) throw new Error("Failed to add transaction: No data returned.");

            const newTransaction = mapTransactionFromDb(data[0]);
            setTransactions(current => [newTransaction, ...current]);

        } catch (e: any) {
            console.error("Error adding transaction:", e);
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
        console.log(`[useTransactions] Attempting to delete transaction with ID: ${id}`);
    
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
                .select(); // Ask Supabase to return the deleted row(s) for confirmation
    
            if (error) {
                console.error('[useTransactions] Supabase returned an error during deletion:', error);
                throw error;
            }
    
            if (!data || data.length === 0) {
                const notFoundError = new Error(`ไม่พบรายการที่ต้องการลบ (ID: ${id}) ในฐานข้อมูล อาจถูกลบไปแล้ว`);
                console.warn('[useTransactions] Delete operation completed, but no rows were affected.', notFoundError);
                throw notFoundError;
            }
    
            console.log('[useTransactions] Successfully deleted transaction. Response data:', data);
    
            // Update local state for immediate UI response
            setTransactions(currentTransactions =>
                currentTransactions.filter(transaction => transaction.id !== id)
            );
    
        } catch (e: any) {
            // This catches errors from the checks above or any other unexpected errors.
            console.error('[useTransactions] An exception occurred in deleteTransaction:', e);
            // Re-throw the error so the calling component can handle it.
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