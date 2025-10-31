import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../constants';

// Initialize the Google Gemini API client. The API key must be provided
// through the `process.env.API_KEY` environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// This interface matches the expected structure in the ReportModal component.
interface AnalysisResult {
    summary: string;
    topExpenseCategories: { category: string; amount: number; percentage: number }[];
    savingsSuggestions: string[];
    monthlyChartData: { income: number; expense: number };
}

/**
 * Analyzes a list of transactions to provide a spending summary, top expense categories,
 * and savings suggestions using the Gemini API.
 * @param transactions - An array of transaction objects.
 * @returns A promise that resolves to an AnalysisResult object.
 */
export const analyzeSpending = async (transactions: Transaction[]): Promise<AnalysisResult> => {
    // If there are no transactions, return a default empty state.
    if (transactions.length === 0) {
        return {
            summary: 'ยังไม่มีข้อมูลธุรกรรมสำหรับวิเคราะห์',
            topExpenseCategories: [],
            savingsSuggestions: ['เพิ่มรายการธุรกรรมเพื่อรับคำแนะนำ'],
            monthlyChartData: { income: 0, expense: 0 },
        };
    }

    const model = 'gemini-2.5-flash';

    const prompt = `
        วิเคราะห์ข้อมูลรายรับรายจ่ายต่อไปนี้ในรูปแบบภาษาไทย:
        ${JSON.stringify(transactions)}

        โปรดให้ข้อมูลสรุปภาพรวมการใช้จ่าย, รายการหมวดหมู่รายจ่ายสูงสุด 3 อันดับแรก (พร้อมจำนวนเงินและเปอร์เซ็นต์เทียบกับรายจ่ายทั้งหมด), และคำแนะนำในการออม 3 ข้อ
    `;

    // Define the expected JSON schema for the model's response.
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            summary: {
                type: Type.STRING,
                description: 'สรุปภาพรวมการใช้จ่ายใน 1-2 ประโยค'
            },
            topExpenseCategories: {
                type: Type.ARRAY,
                description: 'รายการหมวดหมู่รายจ่ายสูงสุด 3 อันดับแรก',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, description: 'ชื่อหมวดหมู่' },
                        amount: { type: Type.NUMBER, description: 'จำนวนเงินรวมของหมวดหมู่นี้' },
                        percentage: { type: Type.NUMBER, description: 'เปอร์เซ็นต์เทียบกับรายจ่ายทั้งหมด' }
                    },
                    required: ['category', 'amount', 'percentage']
                }
            },
            savingsSuggestions: {
                type: Type.ARRAY,
                description: 'คำแนะนำในการออม 3 ข้อ',
                items: {
                    type: Type.STRING
                }
            }
        },
        required: ['summary', 'topExpenseCategories', 'savingsSuggestions']
    };

    // Call the Gemini API to generate content.
    const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });

    const jsonResponse = JSON.parse(result.text.trim());

    // Calculate income and expense totals locally for accuracy.
    const income = transactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        ...jsonResponse,
        monthlyChartData: { income, expense },
    };
};

/**
 * Analyzes an image of a transaction slip to extract transaction details
 * using the Gemini API's multimodal capabilities.
 * @param base64Image - The base64-encoded string of the slip image.
 * @param mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @returns A promise that resolves to a partial Transaction object.
 */
export const analyzeSlip = async (base64Image: string, mimeType: string): Promise<Omit<Transaction, 'id' | 'createdAt'>> => {
    const model = 'gemini-2.5-flash';

    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: `
            จากรูปภาพสลิปการโอนเงินนี้ โปรดดึงข้อมูลและจัดในรูปแบบ JSON ที่กำหนด
            - 'type': ประเภทของธุรกรรม ถ้าเป็นการจ่ายเงินให้เป็น 'expense' ถ้าเป็นการรับเงินให้เป็น 'income' สลิปส่วนใหญ่จะเป็น 'expense'
            - 'category': หมวดหมู่ของรายจ่าย/รายรับ โดยเลือกจากรายการต่อไปนี้เท่านั้น:
                - รายรับ: ${CATEGORIES.income.join(', ')}
                - รายจ่าย: ${CATEGORIES.expense.join(', ')}
              เลือกหมวดหมู่ที่เกี่ยวข้องที่สุด หากไม่แน่ใจให้ใช้ 'อื่นๆ'
            - 'amount': จำนวนเงิน (เป็นตัวเลขเท่านั้น)
            - 'note': บันทึกช่วยจำสั้นๆ จากในสลิป (เช่น ชื่อร้านค้า, ชื่อผู้รับ, หรือข้อความบันทึกช่วยจำ) หากไม่มีให้เว้นว่าง
        `,
    };
    
    // Define the expected JSON schema for the model's response.
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            type: {
                type: Type.STRING,
                enum: [TransactionType.INCOME, TransactionType.EXPENSE]
            },
            category: {
                type: Type.STRING,
                description: `เลือกหนึ่งหมวดหมู่จาก: ${[...CATEGORIES.income, ...CATEGORIES.expense].join(', ')}`
            },
            amount: {
                type: Type.NUMBER
            },
            note: {
                type: Type.STRING
            }
        },
        required: ['type', 'category', 'amount', 'note']
    };

    // Call the Gemini API with both image and text parts.
    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonResponse = JSON.parse(response.text.trim());
    
    // Validate the category returned by the model and fallback to 'อื่นๆ' if it's invalid.
    const validCategories = CATEGORIES[jsonResponse.type as TransactionType] || CATEGORIES.expense;
    if (!validCategories.includes(jsonResponse.category)) {
        jsonResponse.category = 'อื่นๆ';
    }

    return jsonResponse;
};
