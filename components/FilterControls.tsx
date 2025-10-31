import React from 'react';
import { TransactionType } from '../types';

interface FilterControlsProps {
    onFilterChange: (filter: { type: 'all' | TransactionType }) => void;
    filter: { type: 'all' | TransactionType };
}

export const FilterControls: React.FC<FilterControlsProps> = ({ onFilterChange, filter }) => {
    const baseClasses = "px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors";
    const inactiveClasses = "bg-gray-700 hover:bg-gray-600";
    
    return (
        <div className="flex justify-center my-4">
            <div className="flex rounded-md shadow-sm">
                <button
                    onClick={() => onFilterChange({ type: 'all' })}
                    className={`${baseClasses} rounded-l-md ${filter.type === 'all' ? 'bg-blue-600 text-white' : inactiveClasses}`}
                >
                    ทั้งหมด
                </button>
                <button
                    onClick={() => onFilterChange({ type: TransactionType.INCOME })}
                    className={`${baseClasses} ${filter.type === TransactionType.INCOME ? 'bg-green-600 text-white' : `${inactiveClasses} text-green-400`}`}
                >
                    รายรับ
                </button>
                <button
                    onClick={() => onFilterChange({ type: TransactionType.EXPENSE })}
                    className={`${baseClasses} rounded-r-md ${filter.type === TransactionType.EXPENSE ? 'bg-red-600 text-white' : `${inactiveClasses} text-red-400`}`}
                >
                    รายจ่าย
                </button>
            </div>
        </div>
    );
};