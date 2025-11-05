import React from 'react';
import { Cog6ToothIcon, ChatBubbleLeftEllipsisIcon, ArrowRightOnRectangleIcon } from './Icons';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
    onOpenReport: () => void;
    onOpenSettings: () => void;
    onOpenChat: () => void;
    user: User;
    onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReport, onOpenSettings, onOpenChat, user, onSignOut }) => {
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
                <button onClick={onOpenChat} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700" title="AI Assistant">
                    <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
                </button>
                <button onClick={onOpenSettings} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700" title="ตั้งค่า">
                    <Cog6ToothIcon className="w-6 h-6" />
                </button>
                <div className="border-l border-gray-600 pl-2 md:pl-4 flex items-center gap-3">
                     <img 
                        src={user.user_metadata.avatar_url} 
                        alt="User Avatar" 
                        className="w-8 h-8 rounded-full"
                    />
                    <button onClick={onSignOut} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700" title="ออกจากระบบ">
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};