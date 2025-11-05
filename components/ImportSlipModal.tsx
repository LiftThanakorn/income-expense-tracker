import React, { useState, useRef, useEffect } from 'react';
import { Transaction, Category } from '../types';
import { analyzeSlip } from '../services/geminiService';
import { ArrowUpTrayIcon } from './Icons';

interface ImportSlipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSlipAnalyzed: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
    categories: Category[];
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

export const ImportSlipModal: React.FC<ImportSlipModalProps> = ({ isOpen, onClose, onSlipAnalyzed, categories }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        try {
            const base64Image = await fileToBase64(selectedFile);
            const result = await analyzeSlip(base64Image, selectedFile.type, categories);
            onSlipAnalyzed(result);
            handleClose(); // Close modal on success and reset state
        } catch (err) {
            console.error("Error analyzing slip:", err);
            setError('ไม่สามารถวิเคราะห์สลิปได้ กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setSelectedFile(null);
        setPreview(null);
        setLoading(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    if (!isRendered) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`} 
            onClick={handleClose}
            onTransitionEnd={handleAnimationEnd}
        >
            <div 
                className={`bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 m-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-200">นำเข้าสลิป</h2>
                
                <div className="mb-4">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                    
                    {!preview ? (
                        <div onClick={triggerFileSelect} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-400">
                            <div className="space-y-1 text-center">
                                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-500" />
                                <p className="text-sm text-gray-400">
                                    <span className="font-medium text-blue-400">อัปโหลดไฟล์</span> หรือลากและวาง
                                </p>
                                <p className="text-xs text-gray-400">PNG, JPG, GIF</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 text-center">
                            <img src={preview} alt="Slip preview" className="max-h-60 mx-auto rounded-md shadow-md" />
                            <button onClick={triggerFileSelect} className="mt-2 text-sm text-blue-400 hover:underline">เปลี่ยนรูปภาพ</button>
                        </div>
                    )}
                </div>

                {error && <p className="text-red-500 text-sm text-center my-2">{error}</p>}

                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md font-semibold text-gray-300 bg-gray-600 hover:bg-gray-500">ยกเลิก</button>
                    <button 
                        type="button" 
                        onClick={handleAnalyze}
                        disabled={!selectedFile || loading}
                        className="px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                กำลังวิเคราะห์...
                            </>
                        ) : 'วิเคราะห์สลิป'}
                    </button>
                </div>
            </div>
        </div>
    );
};