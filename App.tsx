
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
import { Transaction, TransactionType, Category, Budget, Goal, GoalType } from './types';
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
        const goalToDelete = goals.find(g => g.id === id);
        if (!goalToDelete) return;

        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมาย "${goalToDelete.name}"?`)) {
            try {
                // Check if there is money in the goal that needs to be refunded
                if (goalToDelete.current_amount > 0) {
                    const shouldRefund = window.confirm(
                        `เป้าหมายนี้มียอดเงินสะสมอยู่ ${goalToDelete.current_amount.toLocaleString()} บาท\n\nคุณต้องการ "คืนเงิน" ยอดนี้กลับเข้าสู่กระเป๋า (บันทึกเป็นรายรับ) เพื่อให้ยอดคงเหลือถูกต้องหรือไม่?`
                    );

                    if (shouldRefund) {
                         await addTransaction({
                            type: TransactionType.INCOME,
                            category: 'อื่นๆ', // Fallback category
                            amount: goalToDelete.current_amount,
                            note: `คืนเงินจากการลบเป้าหมาย: ${goalToDelete.name}`,
                        });
                    }
                }

                await deleteGoal(id);
                setToast({ message: 'ลบเป้าหมายสำเร็จ', type: 'success' });
            } catch (error: any) {
                setToast({ message: error.message || 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
            }
        }
    };

    const handleSaveGoal = async (goal: Omit<Goal, 'id' | 'created_at'> | Goal) => {
        try {
            const getCategoryName = (goalType: GoalType) => {
                if (goalType === GoalType.SAVING) {
                    const c = categories.find(c => c.name === 'เงินออม' && c.type === TransactionType.EXPENSE);
                    return c ? c.name : 'อื่นๆ';
                } else {
                    const c = categories.find(c => (c.name === 'ชำระหนี้' || c.name === 'บิล/ค่าบริการ') && c.type === TransactionType.EXPENSE);
                    return c ? c.name : 'อื่นๆ';
                }
            };

            if ('id' in goal) {
                // It's an Update
                const originalGoal = goals.find(g => g.id === goal.id);
                if (originalGoal) {
                    const diff = goal.current_amount - originalGoal.current_amount;
                    
                    if (diff > 0) {
                        const confirmExpense = window.confirm(
                            `คุณได้เพิ่มยอดเงินเป้าหมายขึ้น ${diff.toLocaleString()} บาท\n\nต้องการบันทึกเป็น "รายจ่าย" เพื่อตัดเงินออกจากยอดคงเหลือตามความเป็นจริงหรือไม่?`
                        );
                        if (confirmExpense) {
                             await addTransaction({
                                type: TransactionType.EXPENSE,
                                category: getCategoryName(goal.type),
                                amount: diff,
                                note: `ปรับปรุงเป้าหมาย (เพิ่ม): ${goal.name}`,
                             });
                        }
                    } else if (diff < 0) {
                         const refundAmount = Math.abs(diff);
                         const confirmRefund = window.confirm(
                            `คุณได้ลดยอดเงินเป้าหมายลง ${refundAmount.toLocaleString()} บาท\n\nต้องการ "คืนเงิน" ส่วนต่างนี้กลับเข้าสู่ยอดคงเหลือ (บันทึกเป็นรายรับ) หรือไม่?`
                        );
                        if (confirmRefund) {
                            await addTransaction({
                                type: TransactionType.INCOME,
                                category: 'อื่นๆ',
                                amount: refundAmount,
                                note: `ปรับปรุงเป้าหมาย (ลด): ${goal.name}`,
                             });
                        }
                    }
                }
                await updateGoal(goal);
                setToast({ message: 'อัปเดตเป้าหมายสำเร็จ', type: 'success' });
            } else {
                // New Goal
                if (goal.current_amount > 0) {
                     const confirmExpense = window.confirm(
                        `คุณตั้งยอดเริ่มต้นไว้ ${goal.current_amount.toLocaleString()} บาท\n\nต้องการบันทึกเป็น "รายจ่าย" เพื่อตัดเงินออกจากยอดคงเหลือทันทีหรือไม่?`
                    );
                    if (confirmExpense) {
                         await addTransaction({
                            type: TransactionType.EXPENSE,
                            category: getCategoryName(goal.type),
                            amount: goal.current_amount,
                            note: `เปิดเป้าหมายใหม่: ${goal.name}`,
                         });
                    }
                }
                await addGoal(goal);
                setToast({ message: 'สร้างเป้าหมายสำเร็จ', type: 'success' });
            }
        } catch (error: any) {
            setToast({ message: error.message || 'เกิดข้อผิดพลาดในการบันทึกเป้าหมาย', type: 'error' });
        }
    };

    const handleQuickAddGoal = async (goal: Goal, amount: number) => {
        try {
            // Check for overfill logic (double check, though UI also handles it)
            if (goal.current_amount + amount > goal.target_amount) {
                setToast({ message: 'ไม่สามารถเติมเงินเกินเป้าหมายได้', type: 'error' });
                return;
            }

            // 1. Update the goal amount
            await updateGoal({ ...goal, current_amount: goal.current_amount + amount });

            // 2. Ask the user if they want to link this to a transaction
            const confirmTransaction = window.confirm(
                `คุณต้องการบันทึกยอด ${amount.toLocaleString()} บาท เป็นรายการรายจ่ายด้วยหรือไม่?\n(จะช่วยตัดยอดเงินคงเหลือให้ตรงกับความเป็นจริง)`
            );

            if (confirmTransaction) {
                // Determine the category based on goal type
                let categoryName = 'อื่นๆ';
                
                if (goal.type === GoalType.SAVING) {
                    // Try to find 'เงินออม' or 'Investment'
                    const savingCat = categories.find(c => c.name === 'เงินออม' && c.type === TransactionType.EXPENSE);
                    categoryName = savingCat ? savingCat.name : 'อื่นๆ';
                } else if (goal.type === GoalType.DEBT) {
                     // Try to find 'ชำระหนี้' or 'บิล/ค่าบริการ'
                    const debtCat = categories.find(c => (c.name === 'ชำระหนี้' || c.name === 'บิล/ค่าบริการ') && c.type === TransactionType.EXPENSE);
                    categoryName = debtCat ? debtCat.name : 'อื่นๆ';
                }

                // Create the expense transaction
                await addTransaction({
                    type: TransactionType.EXPENSE,
                    category: categoryName,
                    amount: amount,
                    note: `เติมเป้าหมาย: ${goal.name}`,
                });
                
                setToast({ message: 'อัปเดตเป้าหมายและบันทึกรายจ่ายเรียบร้อย', type: 'success' });
            } else {
                setToast({ message: 'อัปเดตยอดเป้าหมายสำเร็จ', type: 'success' });
            }

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
            {/* Increased bottom padding to pb-40 to prevent floating button from blocking content */}
            <main className="container mx-auto p-4 md:p-6 pb-40">
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
