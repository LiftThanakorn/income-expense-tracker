
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Goal } from '../types';

export function useGoals(userId: string) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', userId)
                .order('deadline', { ascending: true });

            if (error) throw error;
            setGoals(data as Goal[]);
        } catch (e: any) {
            // Silently fail if table doesn't exist yet (user hasn't run migration)
            if (e.message?.includes('relation "goals" does not exist')) {
                console.warn("Goals table does not exist.");
                setGoals([]);
            } else {
                setError(e.message || 'Failed to fetch goals');
                console.error(e);
            }
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const addGoal = async (goal: Omit<Goal, 'id' | 'created_at'>) => {
        if (!userId) throw new Error("User not logged in.");
        try {
            const goalWithUser = { ...goal, user_id: userId };
            const { data, error } = await supabase
                .from('goals')
                .insert([goalWithUser])
                .select();

            if (error) throw error;
            if (!data?.[0]) throw new Error("Failed to add goal.");

            setGoals(current => [...current, data[0] as Goal]);
            return data[0];
        } catch (e: any) {
            console.error("Error adding goal:", e);
            throw e;
        }
    };

    const updateGoal = async (goal: Goal) => {
        if (!userId) throw new Error("User not logged in.");
        try {
            const { id, created_at, ...updatePayload } = goal;
            const { data, error } = await supabase
                .from('goals')
                .update(updatePayload)
                .eq('id', id)
                .eq('user_id', userId)
                .select();

            if (error) throw error;
            
            setGoals(current => 
                current.map(g => g.id === id ? (data[0] as Goal) : g)
            );
        } catch (e: any) {
            console.error("Error updating goal:", e);
            throw e;
        }
    };

    const deleteGoal = async (id: string) => {
        if (!userId) throw new Error("User not logged in.");
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;
            
            setGoals(current => current.filter(g => g.id !== id));
        } catch (e: any) {
            console.error("Error deleting goal:", e);
            throw e;
        }
    };

    return {
        goals,
        loading,
        error,
        addGoal,
        updateGoal,
        deleteGoal,
        refreshGoals: fetchGoals
    };
}
