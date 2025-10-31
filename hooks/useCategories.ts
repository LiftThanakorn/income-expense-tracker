import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Category } from '../types';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCategories(data as Category[]);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch categories');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([category])
                .select();
            
            if (error) throw error;
            
            if (data) {
                setCategories(prev => [...prev, data[0] as Category]);
            }
            return data;
        } catch (e: any) {
            setError(e.message || 'Failed to add category');
            console.error(e);
            throw e;
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (e: any) {
            setError(e.message || 'Failed to delete category');
            console.error(e);
            throw e;
        }
    };

    return {
        categories,
        loading,
        error,
        addCategory,
        deleteCategory
    };
}