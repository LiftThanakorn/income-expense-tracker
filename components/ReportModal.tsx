
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction, TransactionType } from '../types';
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

const COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F', '#AF19FF'];

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

    const chartData = [
        { name: 'รายรับ', value: analysis?.monthlyChartData.income ?? 0 },
        { name: 'รายจ่าย', value: analysis?.monthlyChartData.expense ?? 0 },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] max-h-[800px] p-6 flex flex-col modal" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">รายงานสรุปผล</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {loading && <LoadingSpinner />}
                    {error && <p className="text-center text-red-500 mt-10">{error}</p>}
                    {analysis && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">ภาพรวมการใช้จ่าย</h3>
                                <p className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">{analysis.summary}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-amber-600 dark:text-amber-400">สัดส่วนรายรับ-รายจ่าย</h3>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                                <Cell key={`cell-0`} fill="#00C49F" />
                                                <Cell key={`cell-1`} fill="#FF8042" />
                                            </Pie>
                                            <Tooltip formatter={(value: number) => value.toLocaleString('th-TH') + ' บาท'} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">หมวดหมู่รายจ่ายสูงสุด</h3>
                                <ul className="space-y-2">
                                {analysis.topExpenseCategories.map((item, index) => (
                                     <li key={index} className="p-3 bg-red-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span>{item.category}</span>
                                            <span className="font-semibold">{item.amount.toLocaleString('th-TH')} บาท ({item.percentage}%)</span>
                                        </div>
                                     </li>
                                ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">คำแนะนำเพื่อการออม</h3>
                                <ul className="space-y-2 list-disc list-inside">
                                    {analysis.savingsSuggestions.map((item, index) => (
                                        <li key={index} className="p-3 bg-green-50 dark:bg-gray-700 rounded-lg">{item}</li>
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
