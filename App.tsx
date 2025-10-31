import React, { useState, useMemo } from 'react';
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
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import { Transaction, TransactionType } from './types';

function App() {
    // Hooks
    const { 
        transactions, 
        addTransaction, 
        updateTransaction, 
        deleteTransaction, 
        income, 
        expense,
        loading: transactionsLoading,
    } = useTransactions();
    const { 
        categories, 
        addCategory, 
        deleteCategory,
    } = useCategories();

    // Modal States
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isImportSlipModalOpen, setIsImportSlipModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Editing State
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    // Filter State
    const [filter, setFilter] = useState<{ type: 'all' | TransactionType }>({ type: 'all' });

    // Toast State
    const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

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
                // Remove id and createdAt if they are empty, for new transactions from slip analysis
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
        // Open the Add/Edit modal pre-filled with slip data for user confirmation.
        const newTransactionForEdit = {
            ...analyzedData,
            id: '', // dummy id for the modal to know it's a new item
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

    const filteredTransactions = useMemo(() => {
        if (filter.type === 'all') {
            return transactions;
        }
        return transactions.filter(t => t.type === filter.type);
    }, [transactions, filter]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans transition-colors">
            <Header onOpenReport={() => setIsReportModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)} />
            
            <main className="container mx-auto p-4 md:p-6">
                <SummaryCards income={income} expense={expense} />
                
                <div className="flex justify-between items-center my-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">ประวัติรายการ</h2>
                    <button
                        onClick={() => setIsImportSlipModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        นำเข้าสลิป
                    </button>
                </div>

                <FilterControls filter={filter} onFilterChange={setFilter} />

                {transactionsLoading ? (
                    <p className="text-center py-10">กำลังโหลดข้อมูลธุรกรรม...</p>
                ) : (
                    <TransactionList 
                        transactions={filteredTransactions} 
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
                transactions={transactions}
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
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

export default App;
