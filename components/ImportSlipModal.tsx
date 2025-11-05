import React, { useState, useCallback } from 'react';
import { Transaction, Category } from '../types';
import { analyzeSlip } from '../services/geminiService';
import { ArrowUpTrayIcon } from './Icons';

interface ImportSlipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSlipAnalyzed: (analyzedTransaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
    categories: Category[];
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove "data:image/jpeg;base64," part
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export const ImportSlipModal: React.FC<ImportSlipModalProps> = ({ isOpen, onClose, onSlipAnalyzed, categories }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };
    
    const resetState = useCallback(() => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setLoading(false);
        setError(null);
    }, [previewUrl]);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setError(null);
        try {
            const base64Image = await fileToBase64(selectedFile);
            const mimeType = selectedFile.type;
            const result = await analyzeSlip(base64Image, mimeType, categories);
            onSlipAnalyzed(result);
            handleClose();
        } catch (e: any) {
            console.error(e);
            setError('ไม่สามารถวิเคราะห์สลิปได้: ' + (e.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">นำเข้าด้วยสลิป</h2>
                
                <div className="mb-4">
                    <label 
                        htmlFor="slip-upload" 
                        className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600"
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Slip preview" className="object-contain h-full w-full rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ArrowUpTrayIcon className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง</p>
                                <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                            </div>
                        )}
                        <input id="slip-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                    </label>
                </div>

                {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">
                        ยกเลิก
                    </button>
                    <button 
                        type="button" 
                        onClick={handleAnalyze}
                        disabled={!selectedFile || loading}
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์สลิป'}
                    </button>
                </div>
            </div>
        </div>
    );
};
