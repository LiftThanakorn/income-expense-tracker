import React from 'react';
import { PlusIcon } from './Icons';

interface EmptyStateProps {
    onAddTransaction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddTransaction }) => {
    return (
        <div className="text-center py-16 px-6">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">ไม่มีรายการธุรกรรม</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">เริ่มต้นบันทึกรายรับ-รายจ่ายของคุณ</p>
            <div className="mt-6">
                <button
                    type="button"
                    onClick={onAddTransaction}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    เพิ่มรายการแรก
                </button>
            </div>
        </div>
    );
};