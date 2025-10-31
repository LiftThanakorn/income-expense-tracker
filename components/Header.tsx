import React from 'react';
import { DocumentChartBarIcon, ArrowUpTrayIcon } from './Icons';

interface HeaderProps {
    onOpenReport: () => void;
    onOpenImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReport, onOpenImport }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">💰 บัญชีรายรับ-รายจ่าย</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenReport}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="ดูรายงาน"
                    >
                        <DocumentChartBarIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onOpenImport}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="นำเข้าสลิป"
                    >
                        <ArrowUpTrayIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};
