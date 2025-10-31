import React from 'react';
import { Cog6ToothIcon } from './Icons';

interface HeaderProps {
    onOpenReport: () => void;
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReport, onOpenSettings }) => {
    return (
        <header className="sticky top-0 z-30 p-4 flex justify-between items-center shadow-md bg-gray-800">
            <h1 className="text-2xl font-bold text-gray-200">
                💰 Money Tracker
            </h1>
            <div className="flex items-center gap-2 md:gap-4">
                <button 
                    onClick={onOpenReport}
                    className="hidden sm:inline-block px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    ดูรายงาน
                </button>
                <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Settings"
                >
                    <Cog6ToothIcon className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};