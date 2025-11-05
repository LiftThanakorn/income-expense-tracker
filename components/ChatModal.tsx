import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, transactions }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{ user: string, text: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
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
        if (isOpen) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `คุณคือผู้ช่วยทางการเงินชื่อ 'มณี' ในแอปพลิเคชันติดตามรายรับรายจ่าย เป้าหมายของคุณคือช่วยให้ผู้ใช้เข้าใจพฤติกรรมการใช้จ่ายและตัดสินใจทางการเงินได้ดีขึ้น คุณต้องสื่อสารด้วยภาษาไทยเสมอ
                    
                    ใช้ข้อมูลธุรกรรมที่ให้มาเพื่อตอบคำถามของผู้ใช้ ข้อมูลธุรกรรมเป็น array ของ object ที่มีโครงสร้างดังนี้: { id, type, category, amount, note, createdAt } โดยที่ type คือ 'income' (รายรับ) หรือ 'expense' (รายจ่าย)
                    
                    พยายามให้คำตอบของคุณกระชับ เป็นประโยชน์ และเข้าใจง่าย
                    
                    นี่คือประวัติธุรกรรมของผู้ใช้:
                    ${JSON.stringify(transactions)}`
                },
            });
            setChat(newChat);
            setChatHistory([{ user: 'ai', text: 'สวัสดีค่ะ ดิฉัน "มณี" ผู้ช่วยทางการเงินของคุณ มีอะไรให้ช่วยไหมคะ?' }]);
        } else {
            // Reset on close
            setChat(null);
            setChatHistory([]);
            setMessage('');
            setLoading(false);
        }
    }, [isOpen, transactions]);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSend = async () => {
        if (!message.trim() || loading || !chat) return;
        
        const userMessageText = message;
        const userMessage = { user: 'user', text: userMessageText };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await chat.sendMessage({ message: userMessageText });
            const aiResponse = { user: 'ai', text: response.text };
            setChatHistory(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error communicating with AI:", error);
            const errorResponse = { user: 'ai', text: 'ขออภัยค่ะ เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้ง' };
            setChatHistory(prev => [...prev, errorResponse]);
        } finally {
            setLoading(false);
        }
    };

    if (!isRendered) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`}
            onClick={onClose}
            onTransitionEnd={handleAnimationEnd}
        >
            <div 
                className={`bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg h-[70vh] max-h-[600px] p-6 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-200">AI Assistant (มณี)</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-400 p-2 rounded-full -mr-2">&times;</button>
                </div>

                <div ref={chatContainerRef} className="flex-grow bg-gray-900 rounded-lg p-4 mb-4 overflow-y-auto scroll-smooth">
                    <div className="space-y-4">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`flex ${chat.user === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md p-3 rounded-lg whitespace-pre-wrap ${chat.user === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    {chat.text}
                                </div>
                            </div>
                        ))}
                         {loading && (
                            <div className="flex justify-start">
                                <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-700 text-gray-200">
                                    <div className="flex items-center space-x-1">
                                       <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                       <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                       <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
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