import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, SparklesIcon, ArrowUpTrayIcon, PencilIcon } from './Icons';

interface FloatingActionMenuProps {
    onAddTransaction: () => void;
    onOpenChat: () => void;
    onOpenImportSlip: () => void;
}

const ActionButton: React.FC<{
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}> = ({ onClick, label, children }) => {
    return (
        <div className="flex items-center justify-end gap-4">
            <span className="bg-gray-700 text-white text-sm font-semibold px-3 py-1 rounded-md shadow-md">{label}</span>
            <button
                onClick={onClick}
                className="w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
                aria-label={label}
            >
                {children}
            </button>
        </div>
    );
};


export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ onAddTransaction, onOpenChat, onOpenImportSlip }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsOpen(!isOpen);
    
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, menuRef]);
    
    const createHandler = (action: () => void) => () => {
        action();
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
                <div className={`flex flex-col items-end gap-4 transition-all duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     <ActionButton onClick={createHandler(onOpenImportSlip)} label="นำเข้าสลิป">
                         <ArrowUpTrayIcon className="w-7 h-7" />
                    </ActionButton>
                    <ActionButton onClick={createHandler(onOpenChat)} label="AI Assistant">
                         <SparklesIcon className="w-7 h-7" />
                    </ActionButton>
                    <ActionButton onClick={createHandler(onAddTransaction)} label="เพิ่มรายการ">
                         <PencilIcon className="w-7 h-7" />
                    </ActionButton>
                </div>
             <button
                onClick={toggleMenu}
                className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-transform duration-300 ease-out"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>
    );
};