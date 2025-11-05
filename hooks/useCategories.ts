

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Category, TransactionType } from '../types';

const defaultCategories = [
  // Income
  { name: 'เงินเดือน', type: TransactionType.INCOME },
  { name: 'รายได้เสริม', type: TransactionType.INCOME },
  { name: 'เงินคืน', type: TransactionType.INCOME },
  { name: 'ของขวัญ/โบนัส', type: TransactionType.INCOME },
  { name: 'อื่นๆ', type: TransactionType.INCOME },
  // Expense
  { name: 'อาหาร', type: TransactionType.EXPENSE },
  { name: 'เดินทาง', type: TransactionType.EXPENSE },
  { name: 'ที่อยู่อาศัย', type: TransactionType.EXPENSE },
  { name: 'บันเทิง', type: TransactionType.EXPENSE },
  { name: 'ชอปปิง', type: TransactionType.EXPENSE },
  { name: 'สุขภาพ', type: TransactionType.EXPENSE },
  { name: 'การศึกษา', type: TransactionType.EXPENSE },
  { name: 'บิล/ค่าบริการ', type: TransactionType.EXPENSE },
  { name: 'อื่นๆ', type: TransactionType.EXPENSE },
];

export function useCategories(userId: string) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCategories(data as Category[]);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch categories');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
        if (!userId) throw new Error("User not logged in.");
        try {
            const categoryWithUser = { ...category, user_id: userId };
            const { data, error } = await supabase
                .from('categories')
                .insert([categoryWithUser])
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

    const addDefaultCategories = async () => {
        if (!userId) throw new Error("User not logged in.");
        try {
            const categoriesWithUser = defaultCategories.map(cat => ({ ...cat, user_id: userId }));
            const { data, error } = await supabase
                .from('categories')
                .insert(categoriesWithUser)
                .select();
            
            if (error) throw error;
            
            if (data) {
                setCategories(prev => [...(data as Category[]), ...prev]);
            }
            return data;
        } catch (e: any) {
            setError(e.message || 'Failed to add default categories');
            console.error(e);
            throw e;
        }
    };

    const deleteCategory = async (id: string) => {
        if (!userId) throw new Error("User not logged in.");
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
                .eq('user_id', userId)
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
                .eq('user_id', userId)
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
        deleteCategory,
        addDefaultCategories
    };
}