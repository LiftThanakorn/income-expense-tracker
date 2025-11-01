
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { AddEditTransactionModal } from './components/AddEditTransactionModal';
import { ReportModal } from './components/ReportModal';
import { ImportSlipModal } from './components/ImportSlipModal';
import { CategorySettingsModal } from './components/CategorySettingsModal';
import { FilterControls } from './components/FilterControls';
import { FloatingActionButton } from './components/FloatingActionButton';
import { Toast, ToastProps } from './components/Toast';
import { ChatModal } from './components/ChatModal';
import { DateFilter } from './components/DateFilter';
import { BudgetStatusList } from './components/BudgetStatusList';
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import { useBudgets } from './hooks/useBudgets';
import { Transaction, TransactionType } from './types';
import { getDateRanges } from './utility/dateUtils';

type DateFilterKey = 'thisMonth' | 'thisWeek' | 'allTime';

const dateFilterLabels: Record<DateFilterKey, string> = {
    thisMonth: 'เดือนนี้',
    thisWeek: 'สัปดาห์นี้',
    allTime: 'ทั้งหมด'
};

function App() {
    // Hooks
    const { 
        transactions, 
        addTransaction, 
        updateTransaction, 
        deleteTransaction, 
        loading: transactionsLoading,
    } = useTransactions();
    const { categories, addCategory, deleteCategory } = useCategories();
    const { budgets, upsertBudget } = useBudgets();

    // Modal States
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isImportSlipModalOpen, setIsImportSlipModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    // Editing State
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    // Filter States
    const [filter, setFilter] = useState<{ type: 'all' | TransactionType }>({ type: 'all' });
    const [dateFilterKey, setDateFilterKey] = useState<DateFilterKey>('allTime');
    const [dateRange, setDateRange] = useState(getDateRanges().thisMonth);

    useEffect(() => {
        if (dateFilterKey === 'allTime') {
            setDateRange({ start: new Date(0), end: new Date() });
        } else {
            setDateRange(getDateRanges()[dateFilterKey]);
        }
    }, [dateFilterKey]);

    // Toast State
    const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    // Filtered Data
    const dateFilteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const txDate = new Date(t.createdAt);
            return txDate >= dateRange.start && txDate <= dateRange.end;
        });
    }, [transactions, dateRange]);

    const finalFilteredTransactions = useMemo(() => {
        if (filter.type === 'all') {
            return dateFilteredTransactions;
        }
        return dateFilteredTransactions.filter(t => t.type === filter.type);
    }, [dateFilteredTransactions, filter]);

    const { income, expense } = useMemo(() => {
        return dateFilteredTransactions.reduce((acc, t) => {
            if (t.type === TransactionType.INCOME) acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [dateFilteredTransactions]);


    // Handlers
    const handleAddClick = () => {
        setTransactionToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditClick = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsAddEditModalOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
            try {
                await deleteTransaction(id);
                showToast('ลบรายการสำเร็จ', 'success');
            } catch (error) {
                showToast('เกิดข้อผิดพลาดในการลบ', 'error');
            }
        }
    };

    const handleSaveTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'> | Transaction) => {
        try {
            if ('id' in transaction && transaction.id) {
                await updateTransaction(transaction as Transaction);
                showToast('อัปเดตรายการสำเร็จ', 'success');
            } else {
                const newTransaction = { ...transaction };
                delete (newTransaction as any).id;
                delete (newTransaction as any).createdAt;
                await addTransaction(newTransaction);
                showToast('เพิ่มรายการสำเร็จ', 'success');
            }
            setIsAddEditModalOpen(false);
            setTransactionToEdit(null);
        } catch (error) {
            showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
        }
    };
    
    const handleSlipAnalyzed = (analyzedData: Omit<Transaction, 'id' | 'createdAt'>) => {
        const newTransactionForEdit = {
            ...analyzedData,
            id: '',
            createdAt: new Date().toISOString()
        };
        setTransactionToEdit(newTransactionForEdit as any);
        setIsImportSlipModalOpen(false);
        setIsAddEditModalOpen(true);
    };
    
    const handleAddCategory = async (category: Omit<any, 'id' | 'created_at'>) => {
        try {
            await addCategory(category);
            showToast('เพิ่มหมวดหมู่สำเร็จ', 'success');
        } catch (error) {
            showToast('เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่', 'error');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (window.confirm('การลบหมวดหมู่จะทำให้รายการที่เกี่ยวข้องไม่มีหมวดหมู่ คุณแน่ใจหรือไม่?')) {
            try {
                await deleteCategory(id);
                showToast('ลบหมวดหมู่สำเร็จ', 'success');
            } catch (error) {
                showToast('เกิดข้อผิดพลาดในการลบหมวดหมู่', 'error');
            }
        }
    };

    const handleUpsertBudget = async (category: string, amount: number) => {
        try {
            await upsertBudget({ category, amount });
            showToast('บันทึกงบประมาณสำเร็จ', 'success');
        } catch (error) {
             showToast('เกิดข้อผิดพลาดในการบันทึกงบประมาณ', 'error');
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-gray-100 font-sans">
            <Header 
                onOpenReport={() => setIsReportModalOpen(true)} 
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenChat={() => setIsChatModalOpen(true)}
            />
            
            <main className="container mx-auto p-4 md:p-6">
                <SummaryCards income={income} expense={expense} />
                
                <BudgetStatusList 
                    budgets={budgets} 
                    transactions={dateFilteredTransactions} 
                    title={`สถานะงบประมาณ (${dateFilterLabels[dateFilterKey]})`}
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-6 gap-4">
                    <div className="flex-grow">
                        <h2 className="text-xl font-bold text-gray-200">ประวัติรายการ</h2>
                        <DateFilter currentFilter={dateFilterKey} onFilterChange={setDateFilterKey} />
                    </div>
                    <button
                        onClick={() => setIsImportSlipModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 self-end md:self-center"
                    >
                        นำเข้าสลิป
                    </button>
                </div>

                <FilterControls filter={filter} onFilterChange={setFilter} />

                {transactionsLoading ? (
                    <p className="text-center py-10">กำลังโหลดข้อมูลธุรกรรม...</p>
                ) : (
                    <TransactionList 
                        transactions={finalFilteredTransactions} 
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onAddTransaction={handleAddClick}
                    />
                )}
            </main>

            <FloatingActionButton onClick={handleAddClick} />
            
            <AddEditTransactionModal 
                isOpen={isAddEditModalOpen}
                onClose={() => {
                    setIsAddEditModalOpen(false);
                    setTransactionToEdit(null);
                }}
                onSave={handleSaveTransaction}
                transactionToEdit={transactionToEdit}
                categories={categories}
            />

            <ReportModal 
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                transactions={dateFilteredTransactions}
            />

            <ImportSlipModal
                isOpen={isImportSlipModalOpen}
                onClose={() => setIsImportSlipModalOpen(false)}
                onSlipAnalyzed={handleSlipAnalyzed}
                categories={categories}
            />

            <CategorySettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                categories={categories}
                budgets={budgets}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onUpsertBudget={handleUpsertBudget}
            />

            <ChatModal
                isOpen={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
                transactions={transactions}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default App;
