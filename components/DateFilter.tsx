
import React from 'react';

type FilterKey = 'thisMonth' | 'thisWeek' | 'allTime';

interface DateFilterProps {
    onFilterChange: (filter: FilterKey) => void;
    currentFilter: FilterKey;
}

export const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, currentFilter }) => {
    const baseClasses = "px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-sm";
    const activeClasses = "bg-indigo-600 text-white";
    const inactiveClasses = "bg-gray-700 hover:bg-gray-600 text-gray-300";

    const filters: { key: FilterKey, label: string }[] = [
        { key: 'thisMonth', label: 'เดือนนี้' },
        { key: 'thisWeek', label: 'สัปดาห์นี้' },
        { key: 'allTime', label: 'ทั้งหมด' },
    ];

    return (
        <div className="flex justify-start my-4">
            <div className="flex rounded-md shadow-sm">
                {filters.map((filter, index) => (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        className={`${baseClasses} ${currentFilter === filter.key ? activeClasses : inactiveClasses} ${index === 0 ? 'rounded-l-md' : ''} ${index === filters.length - 1 ? 'rounded-r-md' : 'border-r border-gray-600'}`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
