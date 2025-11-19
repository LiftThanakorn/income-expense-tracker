
import React, { useState, useEffect, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { AddEditTransactionModal } from './components/AddEditTransactionModal';
import { ReportModal } from './components/ReportModal';
import { CategorySettingsModal } from './components/CategorySettingsModal';
import { ChatModal } from './components/ChatModal';
import { ImportSlipModal } from './components/ImportSlipModal';
import { FilterControls } from './components/FilterControls';
import { DateFilter } from './components/DateFilter';
import { BudgetStatusList } from './components/BudgetStatusList';
import { GoalList } from './components/GoalList';
import { AddEditGoalModal } from './components/AddEditGoalModal';
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import { useBudgets } from './hooks/useBudgets';
import { useGoals } from './hooks/useGoals';
import { Transaction, TransactionType, Category, Budget, Goal } from './types';
import { Toast, ToastProps } from './components/Toast';
import { getDateRanges } from './utility/dateUtils';
import { FloatingActionMenu } from './components/FloatingActionMenu';

type DateFilterKey = 'thisMonth' | 'thisWeek' | 'allTime';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const user = session?.user;

    // State for modals
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isChatModalOpen, setChatModalOpen] = useState(false);
    const [isImportSlipModalOpen, setImportSlipModalOpen] = useState(false);
    
    // Goals Modal State
    const [isGoalModalOpen, setGoalModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);

    // Filters
    const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
    const [dateFilter, setDateFilter] = useState<DateFilterKey>('thisMonth');

    // Hooks
    const { transactions, addTransaction, updateTransaction, deleteTransaction, loading: transactionsLoading } = useTransactions(user?.id ?? '');
    const { categories, addCategory, deleteCategory, loading: categoriesLoading } = useCategories(user?.id ?? '');
    const { budgets, upsertBudget, loading: budgetsLoading } = useBudgets(user?.id ?? '');
    const { goals, addGoal, updateGoal, deleteGoal, loading: goalsLoading } = useGoals(user?.id ?? '');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAddClick = () => {
        setTransactionToEdit(null);
        setAddEditModalOpen(true);
    };

    const handleEditClick = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setAddEditModalOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
            try {
                await deleteTransaction(id);
                setToast({ message: 'ลบรายการสำเร็จ', type: 'success' });
            } catch (error: any) {
                console.error(error);
                setToast({ message: error.message || 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
            }
        }
    };

    const handleSaveTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'> | Transaction) => {
        try {
            if ('id' in transaction) {
                await updateTransaction(transaction);
                setToast({ message: 'อัปเดตรายการสำเร็จ', type: 'success' });
            } else {
                await addTransaction(transaction);
                setToast({ message: 'เพิ่มรายการสำเร็จ', type: 'success' });
            }
        } catch (error: any) {
            console.error(error);
            setToast({ message: error.message || 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
        }
    };
    
    const handleAddCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
        try {
            await addCategory(category);
            setToast({ message: 'เพิ่มหมวดหมู่สำเร็จ', type: 'success' });
        } catch (error: any) {
            setToast({ message: error.message || 'ชื่อหมวดหมู่นี้มีอยู่แล้ว', type: 'error' });
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (window.confirm('การลบหมวดหมู่จะไม่ลบรายการธุรกรรมที่ใช้หมวดหมู่นี้ไปแล้ว ยืนยันที่จะลบ?')) {
            try {
                await deleteCategory(id);
                setToast({ message: 'ลบหมวดหมู่สำเร็จ', type: 'success' });
            } catch (error: any) {
                setToast({ message: error.message || 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
            }
        }
    };
    
    const handleUpsertBudget = async (category: string, amount: number) => {
        try {
            await upsertBudget({ category, amount });
             setToast({ message: 'บันทึกงบประมาณสำเร็จ', type: 'success' });
        } catch (error: any) {
             setToast({ message: error.message || 'เกิดข้อผิดพลาดในการตั้งงบประมาณ', type: 'error' });
        }
    };

    // Goal Handlers
    const handleAddGoalClick = () => {
        setGoalToEdit(null);
        setGoalModalOpen(true);
    };

    const handleEditGoalClick = (goal: Goal) => {
        setGoalToEdit(goal);
        setGoalModalOpen(true);
    };

    const handleDeleteGoalClick = async (id: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมายนี้?')) {
            try {
                await deleteGoal(id);
                setToast({ message: 'ลบเป้าหมายสำเร็จ', type: 'success' });
            } catch (error: any) {
                setToast({ message: error.message || 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
            }
        }
    };

    const handleSaveGoal = async (goal: Omit<Goal, 'id' | 'created_at'> | Goal) => {
        try {
            if ('id' in goal) {
                await updateGoal(goal);
                setToast({ message: 'อัปเดตเป้าหมายสำเร็จ', type: 'success' });
            } else {
                await addGoal(goal);
                setToast({ message: 'สร้างเป้าหมายสำเร็จ', type: 'success' });
            }
        } catch (error: any) {
            setToast({ message: error.message || 'เกิดข้อผิดพลาดในการบันทึกเป้าหมาย', type: 'error' });
        }
    };

    const handleQuickAddGoal = async (goal: Goal, amount: number) => {
        try {
            await updateGoal({ ...goal, current_amount: goal.current_amount + amount });
            setToast({ message: 'อัปเดตยอดสำเร็จ', type: 'success' });
        } catch (error: any) {
            setToast({ message: error.message || 'เกิดข้อผิดพลาด', type: 'error' });
        }
    };


    const handleSlipAnalyzed = (analyzedTransaction: Omit<Transaction, 'id' | 'createdAt'>) => {
        // This opens the Add/Edit modal with pre-filled data from the slip
        setTransactionToEdit({ ...analyzedTransaction, id: '', createdAt: new Date().toISOString() });
        setAddEditModalOpen(true);
    };

    const filteredTransactions = useMemo(() => {
        const { thisWeek, thisMonth } = getDateRanges();
        let dateFiltered = transactions;

        if (dateFilter === 'thisMonth') {
            dateFiltered = transactions.filter(t => new Date(t.createdAt) >= thisMonth.start && new Date(t.createdAt) <= thisMonth.end);
        } else if (dateFilter === 'thisWeek') {
            dateFiltered = transactions.filter(t => new Date(t.createdAt) >= thisWeek.start && new Date(t.createdAt) <= thisWeek.end);
        }

        if (typeFilter === 'all') {
            return dateFiltered;
        }
        return dateFiltered.filter(t => t.type === typeFilter);
    }, [transactions, typeFilter, dateFilter]);
    
    const allTimeFilteredTransactionsForReport = useMemo(() => {
        if (typeFilter === 'all') {
            return transactions;
        }
        return transactions.filter(t => t.type === typeFilter);
    }, [transactions, typeFilter]);

    if (!session) {
        return <Auth />;
    }

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen">
            <Header
                user={session.user}
                onSignOut={() => supabase.auth.signOut()}
                onOpenReport={() => setReportModalOpen(true)}
                onOpenSettings={() => setSettingsModalOpen(true)}
            />
            <main className="container mx-auto p-4 md:p-6 pb-24">
                <SummaryCards transactions={filteredTransactions} />
                
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <DateFilter currentFilter={dateFilter} onFilterChange={setDateFilter} />
                </div>

                 <BudgetStatusList 
                    budgets={budgets} 
                    transactions={filteredTransactions} 
                    title={`งบประมาณ (${dateFilter === 'thisMonth' ? 'เดือนนี้' : dateFilter === 'thisWeek' ? 'สัปดาห์นี้' : 'ทั้งหมด'})`}
                />
                
                <GoalList 
                    goals={goals}
                    onEdit={handleEditGoalClick}
                    onDelete={handleDeleteGoalClick}
                    onAddGoal={handleAddGoalClick}
                    onQuickAdd={handleQuickAddGoal}
                />

                <FilterControls filter={{ type: typeFilter }} onFilterChange={({ type }) => setTypeFilter(type)} />
                
                {transactionsLoading ? (
                    <p className="text-center">กำลังโหลดข้อมูล...</p>
                ) : (
                    <TransactionList
                        transactions={filteredTransactions}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onAddTransaction={handleAddClick}
                    />
                )}
            </main>

            <FloatingActionMenu
                onAddTransaction={handleAddClick}
                onOpenChat={() => setChatModalOpen(true)}
                onOpenImportSlip={() => setImportSlipModalOpen(true)}
            />
            
            <AddEditTransactionModal
                isOpen={isAddEditModalOpen}
                onClose={() => setAddEditModalOpen(false)}
                onSave={handleSaveTransaction}
                transactionToEdit={transactionToEdit}
                categories={categories}
            />
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setReportModalOpen(false)}
                transactions={allTimeFilteredTransactionsForReport}
            />
            <CategorySettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                categories={categories}
                budgets={budgets}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onUpsertBudget={handleUpsertBudget}
            />
            <ChatModal
                isOpen={isChatModalOpen}
                onClose={() => setChatModalOpen(false)}
                transactions={transactions}
            />
            <ImportSlipModal 
                isOpen={isImportSlipModalOpen}
                onClose={() => setImportSlipModalOpen(false)}
                onSlipAnalyzed={handleSlipAnalyzed}
                categories={categories}
            />
            
            <AddEditGoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setGoalModalOpen(false)}
                onSave={handleSaveGoal}
                goalToEdit={goalToEdit}
            />
            
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default App;
