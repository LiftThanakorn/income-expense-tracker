import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from '../types';
import { CATEGORIES } from "../constants";

// Fix: Initialize the GoogleGenAI client according to guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Analyzes a list of transactions to provide a spending report.
 * @param transactions - An array of transaction objects.
 * @returns An object containing the analysis result.
 */
export const analyzeSpending = async (transactions: Transaction[]) => {
    if (transactions.length === 0) {
        // Handle case with no transactions to avoid API call
        return {
            summary: "ไม่มีข้อมูลธุรกรรมที่จะวิเคราะห์",
            topExpenseCategories: [],
            savingsSuggestions: ["เพิ่มธุรกรรมเพื่อรับคำแนะนำ"],
            monthlyChartData: { income: 0, expense: 0 },
        };
    }

    // Fix: Use a model suitable for complex text analysis like gemini-2.5-pro.
    const model = 'gemini-2.5-pro';

    const prompt = `
        วิเคราะห์ข้อมูลรายรับรายจ่ายต่อไปนี้ในสกุลเงินบาท (THB) และให้สรุปผลเป็นภาษาไทย:
        ${JSON.stringify(transactions)}

        โปรดสรุปภาพรวมการใช้จ่าย, ระบุหมวดหมู่รายจ่ายที่สูงสุด 3-5 อันดับแรกพร้อมจำนวนเงินและเปอร์เซ็นต์เทียบกับรายจ่ายทั้งหมด, 
        และให้คำแนะนำในการออมเงิน 3 ข้อที่เป็นรูปธรรม
        และคำนวณยอดรวมรายรับและรายจ่ายทั้งหมด
    `;

    // Fix: Define a response schema for structured JSON output.
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            summary: {
                type: Type.STRING,
                description: 'สรุปภาพรวมการใช้จ่ายเป็นภาษาไทย'
            },
            topExpenseCategories: {
                type: Type.ARRAY,
                description: 'หมวดหมู่รายจ่ายที่สูงสุด 3-5 อันดับแรก',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, description: 'ชื่อหมวดหมู่' },
                        amount: { type: Type.NUMBER, description: 'จำนวนเงิน' },
                        percentage: { type: Type.NUMBER, description: 'เปอร์เซ็นต์เทียบกับรายจ่ายทั้งหมด' }
                    },
                    required: ['category', 'amount', 'percentage']
                }
            },
            savingsSuggestions: {
                type: Type.ARRAY,
                description: 'คำแนะนำในการออมเงิน 3 ข้อที่เป็นรูปธรรม',
                items: {
                    type: Type.STRING
                }
            },
            monthlyChartData: {
                type: Type.OBJECT,
                description: 'ยอดรวมรายรับและรายจ่าย',
                properties: {
                    income: { type: Type.NUMBER, description: 'ยอดรวมรายรับ' },
                    expense: { type: Type.NUMBER, description: 'ยอดรวมรายจ่าย' }
                },
                required: ['income', 'expense']
            }
        },
        required: ['summary', 'topExpenseCategories', 'savingsSuggestions', 'monthlyChartData']
    };

    // Fix: Call the Gemini API using generateContent with the prompt and schema.
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    // Fix: Parse the JSON text from the response.
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse;
};

/**
 * Analyzes an image of a transaction slip to extract details.
 * @param base64Image - The base64 encoded string of the slip image.
 * @param mimeType - The MIME type of the image.
 * @returns A promise that resolves to a new transaction object.
 */
export const analyzeSlip = async (base64Image: string, mimeType: string): Promise<Omit<Transaction, 'id' | 'createdAt'>> => {
    // Fix: Use a multimodal model like gemini-2.5-flash for this task.
    const model = 'gemini-2.5-flash';

    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType
        }
    };

    const textPart = {
        text: `
            วิเคราะห์รูปภาพสลิปการโอนเงินนี้ และดึงข้อมูลออกมาเป็น JSON object.
            - amount: จำนวนเงินที่จ่าย (เป็นตัวเลขเท่านั้น)
            - category: หมวดหมู่ของรายจ่ายที่เหมาะสมที่สุดจากรายการต่อไปนี้: [${CATEGORIES.expense.join(', ')}]. ถ้าไม่แน่ใจ ให้ใช้ 'อื่นๆ'.
            - note: บันทึกช่วยจำสั้นๆ จากสลิป (เช่น ชื่อร้านค้า, บริการ, หรือบันทึกของผู้โอน). ถ้าไม่มีข้อมูล ให้เว้นว่างเป็น string เปล่า "".
            - type: ประเภทของธุรกรรม. เนื่องจากเป็นการจ่ายเงินจากสลิป ให้กำหนดเป็น '${TransactionType.EXPENSE}' เสมอ.
        `
    };

    // Fix: Define a response schema for structured JSON output.
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            amount: { type: Type.NUMBER, description: 'จำนวนเงิน' },
            category: { type: Type.STRING, description: 'หมวดหมู่', enum: CATEGORIES.expense },
            note: { type: Type.STRING, description: 'บันทึกช่วยจำ' },
            type: { type: Type.STRING, description: 'ประเภทธุรกรรม', enum: [TransactionType.EXPENSE] }
        },
        required: ['amount', 'category', 'note', 'type']
    };

    // Fix: Call the Gemini API with both image and text parts.
    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    
    // Fix: Parse the JSON text from the response.
    const jsonResponse = JSON.parse(response.text);

    // Basic validation to ensure the response is in the expected format.
    if (
        typeof jsonResponse.amount !== 'number' ||
        !CATEGORIES.expense.includes(jsonResponse.category) ||
        typeof jsonResponse.note !== 'string' ||
        jsonResponse.type !== TransactionType.EXPENSE
    ) {
        throw new Error('ข้อมูลที่ได้จากสลิปไม่ถูกต้องหรือไม่สมบูรณ์');
    }

    return jsonResponse;
};
