
// FIX: Corrected the import for React and hooks to resolve multiple compilation errors.
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { analyzeSpending } from '../services/geminiService';
import { PieChart } from './PieChart';
import { LineChart } from './LineChart';

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

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, transactions }) => {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && transactions.length > 0) {
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
        } else if (isOpen) {
            setLoading(false);
            setError(null);
            setAnalysis(null);
        }
    }, [isOpen, transactions]);

    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { pieData: [], lineData: [] };
        }

        const expenseByCategory = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const pieData = Object.entries(expenseByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const dataByDay = transactions.reduce((acc, t) => {
            const day = new Date(t.createdAt).toISOString().split('T')[0];
            if (!acc[day]) {
                acc[day] = { date: day, income: 0, expense: 0 };
            }
            acc[day][t.type] += t.amount;
            return acc;
        }, {} as Record<string, { date: string, income: number, expense: number }>);
        
        const lineData = Object.values(dataByDay)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return { pieData, lineData };
    }, [transactions]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl h-[90vh] max-h-[800px] p-6 flex flex-col modal" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-200">รายงานสรุปผล</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-400 p-2 rounded-full -mr-2">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-8">
                    {transactions.length === 0 ? (
                         <p className="text-center text-gray-400 mt-10">ไม่มีข้อมูลธุรกรรมในช่วงเวลานี้</p>
                    ) : (
                        <>
                             <div>
                                <h3 className="text-lg font-semibold mb-3 text-amber-400">แนวโน้มการเงิน</h3>
                                <LineChart data={chartData.lineData} />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-fuchsia-400">สัดส่วนรายจ่าย</h3>
                                <PieChart data={chartData.pieData} />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-blue-400">AI วิเคราะห์ภาพรวม</h3>
                                {loading && <LoadingSpinner />}
                                {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                                {analysis && (
                                    <div className="space-y-6">
                                        <p className="bg-blue-900/50 p-4 rounded-lg text-gray-300">{analysis.summary}</p>
                                        <div>
                                            <h4 className="text-md font-semibold mb-2 text-green-400">คำแนะนำเพื่อการออม</h4>
                                            <ul className="space-y-2">
                                                {analysis.savingsSuggestions.map((item, index) => (
                                                    <li key={index} className="p-3 bg-green-900/50 rounded-lg list-none text-gray-300">💡 {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
