
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Budget } from '../types';

export function useBudgets(userId: string) {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBudgets = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;
            setBudgets(data as Budget[]);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch budgets');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const upsertBudget = async (budget: Omit<Budget, 'id' | 'created_at'>) => {
        if (!userId) throw new Error("User not logged in.");
        try {
            const budgetWithUser = { ...budget, user_id: userId };
            const { data, error } = await supabase
                .from('budgets')
                .upsert(budgetWithUser, { onConflict: 'user_id,category' })
                .select();
            
            if (error) throw error;
            
            if (data) {
                setBudgets(prev => {
                    const index = prev.findIndex(b => b.category === data[0].category);
                    if (index !== -1) {
                        const newBudgets = [...prev];
                        newBudgets[index] = data[0] as Budget;
                        return newBudgets;
                    }
                    return [...prev, data[0] as Budget];
                });
            }
            return data;
        } catch (e: any)
        {
            // A bit of a hack to handle Supabase's slightly tricky composite key conflict error message.
             if (e.message?.includes('duplicate key value violates unique constraint "budgets_user_id_category_key"')) {
                // This can happen in a race condition. Let's try to refetch to sync state.
                fetchBudgets(); 
                return;
            }
            setError(e.message || 'Failed to upsert budget');
            console.error(e);
            throw e;
        }
    };
    
    return {
        budgets,
        loading,
        error,
        upsertBudget
    };
}