import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { AddEditTransactionModal } from './components/AddEditTransactionModal';
import { ReportModal } from './components/ReportModal';
import { ImportSlipModal } from './components/ImportSlipModal';
import { FilterControls } from './components/FilterControls';
import { FloatingActionButton } from './components/FloatingActionButton';
import { useTransactions } from './hooks/useTransactions';
import { Transaction, TransactionType } from './types';

function App() {
    const { transactions, addTransaction, updateTransaction, deleteTransaction, loading, error } = useTransactions();

    // Modal states
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    
    // Filter state
    const [filter, setFilter] = useState<{ type: 'all' | TransactionType }>({ type: 'all' });

    const handleOpenAddModal = () => {
        setTransactionToEdit(null);
        setAddEditModalOpen(true);
    };

    const handleOpenEditModal = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setAddEditModalOpen(true);
    };
    
    const handleSaveTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'> | Transaction) => {
        if ('id' in transactionData && transactionData.id) {
            updateTransaction(transactionData as Transaction);
        } else {
            addTransaction(transactionData as Omit<Transaction, 'id' | 'createdAt'>);
        }
    };

    const handleSlipAnalyzed = (analyzedData: Omit<Transaction, 'id' | 'createdAt'>) => {
        const tempTransaction: Transaction = {
            id: '', // Falsy ID ensures it's treated as a new transaction
            createdAt: new Date().toISOString(), // Placeholder
            ...analyzedData,
        };
        setTransactionToEdit(tempTransaction);
        setAddEditModalOpen(true);
    }

    const { income, expense, filteredTransactions } = useMemo(() => {
        const income = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const filteredTransactions = transactions.filter(
            t => filter.type === 'all' || t.type === filter.type
        );

        return { income, expense, filteredTransactions };
    }, [transactions, filter]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
            <Header onOpenReport={() => setReportModalOpen(true)} onOpenImport={() => setImportModalOpen(true)} />
            
            <main className="max-w-4xl mx-auto p-4">
                <SummaryCards income={income} expense={expense} />
                <FilterControls filter={filter} onFilterChange={setFilter} />
                
                {loading && <p className="text-center">กำลังโหลด...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && (
                    <TransactionList
                        transactions={filteredTransactions}
                        onEdit={handleOpenEditModal}
                        onDelete={deleteTransaction}
                        onAddTransaction={handleOpenAddModal}
                    />
                )}
            </main>
            
            <FloatingActionButton onClick={handleOpenAddModal} />
            
            <AddEditTransactionModal
                isOpen={isAddEditModalOpen}
                onClose={() => setAddEditModalOpen(false)}
                onSave={handleSaveTransaction}
                transactionToEdit={transactionToEdit}
            />
            
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setReportModalOpen(false)}
                transactions={transactions}
            />

            <ImportSlipModal
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSlipAnalyzed={handleSlipAnalyzed}
            />
        </div>
    );
}

export default App;
