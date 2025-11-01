
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
        if (!id || typeof id !== 'string') {
            const error = new Error('ID ที่ระบุสำหรับลบหมวดหมู่ไม่ถูกต้อง');
            console.error('[useCategories] Delete failed:', error);
            throw error;
        }
    
        try {
            const categoryToDelete = categories.find(c => c.id === id);
            if (!categoryToDelete) {
                throw new Error(`ไม่พบหมวดหมู่ที่ต้องการลบในรายการปัจจุบัน (ID: ${id})`);
            }

            const { data: budgetsData, error: budgetError } = await supabase
                .from('budgets')
                .select('amount')
                .eq('category', categoryToDelete.name)
                .limit(1);

            if (budgetError) {
                console.error('[useCategories] Error checking for budgets:', budgetError);
                throw new Error('เกิดข้อผิดพลาดในการตรวจสอบงบประมาณที่เกี่ยวข้อง');
            }

            if (budgetsData && budgetsData.length > 0 && budgetsData[0].amount > 0) {
                throw new Error(`ไม่สามารถลบหมวดหมู่ '${categoryToDelete.name}' ได้ เนื่องจากมีการตั้งงบประมาณไว้ กรุณาตั้งค่าให้เป็น 0 ก่อน`);
            }
            
            const { data, error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)
                .select();
    
            if (error) {
                console.error('[useCategories] Supabase returned an error during deletion:', error);
                throw error;
            }
    
            if (!data || data.length === 0) {
                console.warn(`[useCategories] Category with ID: ${id} not found in database for deletion, but will be removed from local state.`);
            } else {
                 console.log('[useCategories] Successfully deleted category. Response data:', data);
            }
    
            setCategories(prev => prev.filter(c => c.id !== id));

        } catch (e: any) {
            console.error('[useCategories] An exception occurred in deleteCategory:', e);
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
