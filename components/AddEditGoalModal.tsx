
import React, { useState, useEffect } from 'react';
import { Goal, GoalType } from '../types';

interface AddEditGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id' | 'created_at'> | Goal) => void;
    goalToEdit?: Goal | null;
}

export const AddEditGoalModal: React.FC<AddEditGoalModalProps> = ({
    isOpen,
    onClose,
    onSave,
    goalToEdit,
}) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<GoalType>(GoalType.SAVING);
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        }
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) {
            setIsRendered(false);
        }
    };

    useEffect(() => {
        if (goalToEdit) {
            setName(goalToEdit.name);
            setType(goalToEdit.type);
            setTargetAmount(String(goalToEdit.target_amount));
            setCurrentAmount(String(goalToEdit.current_amount));
            setDeadline(goalToEdit.deadline ? goalToEdit.deadline.split('T')[0] : '');
        } else {
            setName('');
            setType(GoalType.SAVING);
            setTargetAmount('');
            setCurrentAmount('0');
            setDeadline('');
        }
    }, [goalToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numTarget = parseFloat(targetAmount);
        const numCurrent = parseFloat(currentAmount);

        if (!name || isNaN(numTarget) || numTarget <= 0) {
            alert('กรุณากรอกชื่อและยอดเป้าหมายให้ถูกต้อง');
            return;
        }

        const goalData = {
            name,
            type,
            target_amount: numTarget,
            current_amount: isNaN(numCurrent) ? 0 : numCurrent,
            deadline: deadline || undefined,
        };
        
        if (goalToEdit) {
            onSave({ ...goalData, id: goalToEdit.id, created_at: goalToEdit.created_at });
        } else {
            onSave(goalData);
        }
        onClose();
    };
    
    if (!isRendered) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`} 
            onClick={onClose}
            onTransitionEnd={handleAnimationEnd}
        >
            <div 
                className={`bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 m-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} 
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-200">
                    {goalToEdit ? 'แก้ไขเป้าหมาย' : 'สร้างเป้าหมายใหม่'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">ประเภทเป้าหมาย</label>
                        <div className="flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setType(GoalType.SAVING)} className={`px-4 py-2 w-1/2 rounded-l-md font-semibold focus:outline-none transition-colors ${type === GoalType.SAVING ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>การออม</button>
                            <button type="button" onClick={() => setType(GoalType.DEBT)} className={`px-4 py-2 w-1/2 rounded-r-md font-semibold focus:outline-none transition-colors ${type === GoalType.DEBT ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>ปลดหนี้</button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="goalName" className="block text-sm font-medium text-gray-300 mb-1">ชื่อเป้าหมาย</label>
                        <input type="text" id="goalName" value={name} onChange={e => setName(e.target.value)} placeholder={type === GoalType.SAVING ? "เช่น ซื้อ iPhone, เที่ยวญี่ปุ่น" : "เช่น หนี้บัตรเครดิต, ผ่อนรถ"} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="target" className="block text-sm font-medium text-gray-300 mb-1">ยอดเป้าหมาย</label>
                            <input type="number" id="target" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="current" className="block text-sm font-medium text-gray-300 mb-1">{type === GoalType.SAVING ? 'เก็บได้แล้ว' : 'จ่ายไปแล้ว'}</label>
                            <input type="number" id="current" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">วันกำหนดเป้าหมาย (ถ้ามี)</label>
                        <input type="date" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold text-gray-300 bg-gray-600 hover:bg-gray-500">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
