import React from 'react';
import { Goal, GoalType } from '../types';
import { TrophyIcon, CreditCardIcon, PencilIcon, TrashIcon, PlusIcon } from './Icons';

interface GoalListProps {
    goals: Goal[];
    onEdit: (goal: Goal) => void;
    onDelete: (id: string) => void;
    onAddGoal: () => void;
    onQuickAdd: (goal: Goal, amount: number) => void;
}

const GoalItem: React.FC<{ goal: Goal; onEdit: (g: Goal) => void; onDelete: (id: string) => void; onQuickAdd: (g: Goal, amt: number) => void }> = ({ goal, onEdit, onDelete, onQuickAdd }) => {
    const isSaving = goal.type === GoalType.SAVING;
    const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    
    const barColor = isSaving ? 'bg-green-500' : 'bg-orange-500';
    const iconColor = isSaving ? 'text-green-400' : 'text-orange-400';
    const bgIcon = isSaving ? <TrophyIcon className="w-6 h-6" /> : <CreditCardIcon className="w-6 h-6" />;

    const remaining = goal.target_amount - goal.current_amount;
    const isCompleted = remaining <= 0;

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (isCompleted) return;

        // Prompt for quick add amount
        const amountStr = prompt(`เพิ่มยอด${isSaving ? 'การออม' : 'การชำระหนี้'}สำหรับ "${goal.name}"\n(ขาดอีก ${remaining.toLocaleString()} บาท):`, "1000");
        
        if (amountStr) {
            const amount = parseFloat(amountStr);
            
            if (isNaN(amount) || amount <= 0) {
                 alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
                 return;
            }

            if (amount > remaining) {
                alert(`⚠️ ไม่สามารถเติมเงินเกินเป้าหมายได้!\nคุณสามารถเติมได้สูงสุด ${remaining.toLocaleString()} บาท`);
                return;
            }

            onQuickAdd(goal, amount);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg relative overflow-hidden group">
             {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full ${isSaving ? 'bg-green-500' : 'bg-orange-500'} pointer-events-none`}></div>

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-700 ${iconColor}`}>
                        {bgIcon}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">{goal.name}</h3>
                        {goal.deadline && (
                            <p className="text-xs text-gray-400">
                                เป้าหมาย: {new Date(goal.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </p>
                        )}
                    </div>
                </div>
                {/* Modified opacity logic: Always visible on touch devices/hover on desktop can be handled, but for safety making them always interactive */}
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onEdit(goal); }} 
                        className="p-1 text-gray-400 hover:text-blue-400 rounded hover:bg-gray-700"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }} 
                        className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-gray-700"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="mt-4 space-y-2 relative z-10">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{isSaving ? 'เก็บได้แล้ว' : 'ชำระแล้ว'}</span>
                    <span className="font-medium text-gray-200">{goal.current_amount.toLocaleString('th-TH')} / {goal.target_amount.toLocaleString('th-TH')}</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                        {isCompleted 
                            ? <span className="text-green-400 font-bold">สำเร็จแล้ว! 🎉</span> 
                            : `เหลืออีก ${remaining.toLocaleString('th-TH')}`
                        }
                    </p>
                    {!isCompleted && (
                        <button 
                            type="button"
                            onClick={handleQuickAdd}
                            className={`text-xs px-2 py-1 rounded flex items-center gap-1 hover:opacity-80 text-white ${isSaving ? 'bg-green-600' : 'bg-orange-600'}`}
                        >
                            <PlusIcon className="w-3 h-3" />
                            เติม
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const GoalList: React.FC<GoalListProps> = ({ goals, onEdit, onDelete, onAddGoal, onQuickAdd }) => {
    if (goals.length === 0) {
        return (
            <div className="my-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-200">เป้าหมายทางการเงิน</h2>
                    <button onClick={onAddGoal} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <PlusIcon className="w-4 h-4" /> สร้างเป้าหมาย
                    </button>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 border-dashed text-center">
                    <p className="text-gray-400 mb-3">คุณยังไม่มีเป้าหมายการออมหรือการชำระหนี้</p>
                    <button onClick={onAddGoal} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        เริ่มต้นตั้งเป้าหมาย
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-200">เป้าหมายทางการเงิน</h2>
                <button onClick={onAddGoal} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-blue-400">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map(goal => (
                    <GoalItem 
                        key={goal.id} 
                        goal={goal} 
                        onEdit={onEdit} 
                        onDelete={onDelete}
                        onQuickAdd={onQuickAdd}
                    />
                ))}
            </div>
        </div>
    );
};