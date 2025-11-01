
import React from 'react';

interface PieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#8B5CF6'];

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-400 text-center py-4">ไม่มีข้อมูลรายจ่าย</p>;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <svg viewBox="0 0 36 36" className="w-40 h-40">
                {data.map((item, index) => {
                    const percent = (item.value / total) * 100;
                    const offset = cumulativePercent;
                    cumulativePercent += percent;
                    return (
                        <circle
                            key={index}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth="3.8"
                            strokeDasharray={`${percent} ${100 - percent}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 18 18)"
                        />
                    );
                })}
                 <circle cx="18" cy="18" r="12" fill="#1F2937" />
            </svg>
            <div className="w-full">
                <ul className="space-y-2">
                    {data.map((item, index) => (
                        <li key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="text-gray-300">{item.name}</span>
                            </div>
                            <span className="font-semibold text-gray-200">{item.value.toLocaleString('th-TH')} บาท</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
