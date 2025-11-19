
import React, { useState, useEffect } from 'react';

export interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            // Allow time for fade-out animation before calling onClose
            setTimeout(onClose, 300);
        }, 3000); // Auto-dismiss after 3 seconds

        return () => clearTimeout(timer);
    }, [message, type, onClose]);

    const baseClasses = 'fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg text-white transition-all duration-300 pointer-events-none';
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
    };
    const visibilityClasses = visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}>
            {message}
        </div>
    );
};
