import React, { useState } from 'react';
import { Transaction } from '../types';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, transactions }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{ user: string, text: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim() || loading) return;
        
        const userMessage = { user: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        // Placeholder for AI response
        setTimeout(() => {
            const aiResponse = { user: 'ai', text: 'AI response placeholder.' };
            setChatHistory(prev => [...prev, aiResponse]);
            setLoading(false);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg h-[70vh] max-h-[600px] p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-200">AI Assistant</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-400 p-2 rounded-full -mr-2">&times;</button>
                </div>

                <div className="flex-grow bg-gray-900 rounded-lg p-4 mb-4 overflow-y-auto">
                    <div className="space-y-4">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`flex ${chat.user === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${chat.user === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    {chat.text}
                                </div>
                            </div>
                        ))}
                         {loading && (
                            <div className="flex justify-start">
                                <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-700 text-gray-200">
                                    <span className="animate-pulse">...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="ถามคำถามเกี่ยวกับการเงินของคุณ..."
                        className="flex-grow px-4 py-2 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading || !message.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        ส่ง
                    </button>
                </div>
            </div>
        </div>
    );
};
