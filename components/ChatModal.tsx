import { GoogleGenAI } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';
import { Transaction } from '../types';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, transactions }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if(isOpen) {
            setMessages([
                { role: 'model', text: 'สวัสดีครับ ผมคือผู้ช่วย AI ด้านการเงิน ถามผมเกี่ยวกับข้อมูลรายรับรายจ่ายของคุณได้เลย' }
            ]);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const transactionsContext = `Here is the user's transaction data in JSON format: ${JSON.stringify(transactions, null, 2)}`;
            const systemInstruction = `You are a helpful and friendly financial assistant for a money tracking app. Your name is "FinAI". Analyze the provided transaction data to answer the user's questions in Thai. Be concise and clear. The current date is ${new Date().toLocaleDateString('th-TH')}.`;

            // We will simplify history for now and just send the latest question with full context.
            // For a more complex conversation, you'd build a history of user/model turns.
            const prompt = `${systemInstruction}\n\n${transactionsContext}\n\nUser Question: ${input}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction
                }
            });

            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error('Gemini API error:', error);
            const errorMessage: Message = { role: 'model', text: 'ขออภัยครับ เกิดข้อผิดพลาดในการสื่อสารกับ AI' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">FinAI Assistant</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {loading && (
                            <div className="flex justify-start">
                                <div className="max-w-xs p-3 rounded-lg bg-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="ถามเกี่ยวกับรายจ่ายของคุณ..."
                            className="flex-grow p-2 bg-gray-700 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        />
                        <button onClick={handleSend} disabled={loading || !input.trim()} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
                            ส่ง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
