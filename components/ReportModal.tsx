// FIX: Corrected the import for React and hooks to resolve multiple compilation errors.
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { analyzeSpending } from '../services/geminiService';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
}

interface AnalysisResult {
    summary: string;
    topExpenseCategories: { category: string; amount: number; percentage: number }[];
    savingsSuggestions: string[];
    monthlyChartData: { income: number; expense: number };
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const IncomeExpenseBar: React.FC<{ income: number, expense: number }> = ({ income, expense }) => {
    const total = income + expense;
    if (total === 0) {
        return <div className="text-center text-gray-500 dark:text-gray-400">ไม่มีข้อมูลสำหรับแสดงกราฟ</div>;
    }

    const incomePercent = (income / total) * 100;
    const expensePercent = (expense / total) * 100;

    return (
        <div className="w-full">
            <div className="flex w-full h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div 
                    className="bg-green-500 transition-all duration-500" 
                    style={{ width: `${incomePercent}%` }}
                    title={`รายรับ: ${income.toLocaleString('th-TH')} บาท`}
                ></div>
                <div 
                    className="bg-red-500 transition-all duration-500" 
                    style={{ width: `${expensePercent}%` }}
                    title={`รายจ่าย: ${expense.toLocaleString('th-TH')} บาท`}
                ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span>รายรับ ({incomePercent.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span>รายจ่าย ({expensePercent.toFixed(1)}%)</span>
                </div>
            </div>
        </div>
    );
};


export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, transactions }) => {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const getAnalysis = async () => {
                setLoading(true);
                setError(null);
                setAnalysis(null);
                try {
                    const result = await analyzeSpending(transactions);
                    setAnalysis(result);
                } catch (e) {
                    setError('เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล กรุณาลองใหม่');
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            getAnalysis();
        }
    }, [isOpen, transactions]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] max-h-[800px] p-6 flex flex-col modal" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">รายงานสรุปผล</h2>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 p-2 rounded-full -mr-2">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {loading && <LoadingSpinner />}
                    {error && <p className="text-center text-red-500 mt-10">{error}</p>}
                    {analysis && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">ภาพรวมการใช้จ่าย</h3>
                                <p className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg text-gray-700 dark:text-gray-300">{analysis.summary}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-amber-600 dark:text-amber-400">สัดส่วนรายรับ-รายจ่าย</h3>
                                <IncomeExpenseBar 
                                    income={analysis.monthlyChartData.income}
                                    expense={analysis.monthlyChartData.expense}
                                />
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">หมวดหมู่รายจ่ายสูงสุด</h3>
                                {analysis.topExpenseCategories.length > 0 ? (
                                    <ul className="space-y-2">
                                        {analysis.topExpenseCategories.map((item, index) => (
                                            <li key={index} className="p-3 bg-red-50 dark:bg-red-900/50 rounded-lg">
                                                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                                    <span>{item.category}</span>
                                                    <span className="font-semibold">{item.amount.toLocaleString('th-TH')} บาท ({item.percentage}%)</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">ไม่มีข้อมูลรายจ่าย</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">คำแนะนำเพื่อการออม</h3>
                                <ul className="space-y-2">
                                    {analysis.savingsSuggestions.map((item, index) => (
                                        <li key={index} className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg list-none text-gray-700 dark:text-gray-300">💡 {item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};