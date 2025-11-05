import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { analyzeSpending } from '../services/geminiService';
import { PieChart } from './PieChart';

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

const SimpleBarChart: React.FC<{ data: { income: number, expense: number } }> = ({ data }) => {
    const total = data.income + data.expense;
    const incomePercent = total > 0 ? (data.income / total) * 100 : 0;
    const expensePercent = total > 0 ? (data.expense / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="text-green-400">รายรับ</span>
                <span className="font-semibold">{data.income.toLocaleString('th-TH')} บาท</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-red-400">รายจ่าย</span>
                 <span className="font-semibold">{data.expense.toLocaleString('th-TH')} บาท</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 flex overflow-hidden">
                <div 
                    className="bg-green-500 h-4" 
                    style={{ width: `${incomePercent}%` }}
                    title={`รายรับ: ${data.income.toLocaleString('th-TH')}`}
                ></div>
                <div 
                    className="bg-red-500 h-4" 
                    style={{ width: `${expensePercent}%` }}
                    title={`รายจ่าย: ${data.expense.toLocaleString('th-TH')}`}
                ></div>
            </div>
        </div>
    );
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, transactions }) => {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && transactions.length > 0) {
            const getAnalysis = async () => {
                setLoading(true);
                setError(null);
                setResult(null);
                try {
                    const analysisResult = await analyzeSpending(transactions);
                    setResult(analysisResult);
                } catch (e: any) {
                    setError('เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล: ' + e.message);
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            getAnalysis();
        } else if (isOpen) {
             setResult({
                summary: "ไม่มีข้อมูลธุรกรรมที่จะวิเคราะห์",
                topExpenseCategories: [],
                savingsSuggestions: ["เพิ่มรายการธุรกรรมเพื่อรับคำแนะนำ"],
                monthlyChartData: { income: 0, expense: 0 }
            });
        }
    }, [isOpen, transactions]);

    if (!isOpen) return null;

    const pieChartData = result?.topExpenseCategories.map(c => ({ name: c.category, value: c.amount })) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">รายงานสรุปการเงิน</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                {loading && <p className="text-center">กำลังวิเคราะห์ข้อมูลด้วย AI...</p>}
                {error && <p className="text-center text-red-400">{error}</p>}
                {result && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-blue-400">ภาพรวม</h3>
                            <p className="text-gray-300">{result.summary}</p>
                        </div>
                        
                        <div>
                             <h3 className="text-lg font-semibold mb-2 text-blue-400">รายรับ vs รายจ่าย</h3>
                            <SimpleBarChart data={result.monthlyChartData} />
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-blue-400">หมวดหมู่รายจ่ายสูงสุด</h3>
                             <PieChart data={pieChartData} />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-blue-400">💡 คำแนะนำเพื่อการออม</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {result.savingsSuggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
