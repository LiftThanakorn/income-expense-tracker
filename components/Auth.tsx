import React from 'react';
import { supabase } from '../services/supabaseClient';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.617-3.27-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


export const Auth = () => {
    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            console.error('Error logging in with Google:', error.message);
            alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-sm p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg text-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-200">
                        💰 Money Tracker
                    </h1>
                    <p className="mt-2 text-gray-400">
                        บันทึกรายรับ-รายจ่ายของคุณอย่างชาญฉลาด
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleLogin}
                        type="button"
                        className="w-full inline-flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-lg border border-transparent bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <GoogleIcon />
                        เข้าสู่ระบบด้วย Google
                    </button>
                </div>
                 <p className="text-xs text-gray-500">
                    ข้อมูลของคุณจะถูกจัดเก็บอย่างปลอดภัยและเป็นส่วนตัว
                </p>
            </div>
        </div>
    );
};