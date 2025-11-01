
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Budget } from '../types';

export function useBudgets() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBudgets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('budgets')
                .select('*');

            if (error) throw error;
            setBudgets(data as Budget[]);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch budgets');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const upsertBudget = async (budget: Omit<Budget, 'id' | 'created_at'>) => {
        try {
            const { data, error } = await supabase
                .from('budgets')
                .upsert(budget, { onConflict: 'category' })
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
        } catch (e: any) {
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
