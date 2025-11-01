
import React from 'react';

interface LineChartProps {
  data: { date: string; income: number; expense: number }[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
    if (!data || data.length < 2) {
        return <p className="text-gray-400 text-center py-4">มีข้อมูลไม่เพียงพอสำหรับสร้างกราฟเส้น</p>;
    }
    
    const width = 500;
    const height = 200;
    const padding = 30;
    
    const maxAmount = Math.max(...data.map(d => d.income), ...data.map(d => d.expense));
    if (maxAmount === 0) {
         return <p className="text-gray-400 text-center py-4">ไม่มีข้อมูลสำหรับแสดงกราฟเส้น</p>;
    }
    
    const scaleX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const scaleY = (value: number) => height - padding - (value / maxAmount) * (height - 2 * padding);
    
    const generatePoints = (key: 'income' | 'expense') => 
        data.map((d, i) => `${scaleX(i)},${scaleY(d[key])}`).join(' ');

    const incomePoints = generatePoints('income');
    const expensePoints = generatePoints('expense');
    
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    }

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[500px]">
                {/* Y Axis Grid Lines */}
                {[0.25, 0.5, 0.75, 1].map(ratio => (
                    <line
                        key={ratio}
                        x1={padding} y1={scaleY(maxAmount * ratio)}
                        x2={width - padding} y2={scaleY(maxAmount * ratio)}
                        stroke="#4A5568" strokeWidth="0.5"
                    />
                ))}
                
                {/* Y Axis Labels */}
                {[0, 0.5, 1].map(ratio => (
                    <text key={ratio} x={padding - 5} y={scaleY(maxAmount * ratio) + 3} fill="#A0AEC0" fontSize="10" textAnchor="end">
                        {(maxAmount * ratio).toLocaleString('th-TH', { notation: 'compact' })}
                    </text>
                ))}
                
                {/* X Axis Labels */}
                {data.map((d, i) => ( i % Math.max(1, Math.floor(data.length / 7)) === 0 &&
                    <text key={d.date} x={scaleX(i)} y={height - padding + 15} fill="#A0AEC0" fontSize="10" textAnchor="middle">
                        {formatDate(d.date)}
                    </text>
                ))}

                {/* Data Lines */}
                <polyline points={incomePoints} fill="none" stroke="#10B981" strokeWidth="2" />
                <polyline points={expensePoints} fill="none" stroke="#EF4444" strokeWidth="2" />
            </svg>
             <div className="flex justify-center mt-2 text-sm text-gray-400 gap-4">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span>รายรับ</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span>รายจ่าย</span>
                </div>
            </div>
        </div>
    );
};
