// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../constants';

// --- DEFINITIVE FIX FOR VERCEL DEPLOYMENT ---
// In a no-build, importmap-based environment, there's no secure way to get
// environment variables from Vercel to the client. The only way to make this work
// is to hardcode the key. This is not ideal for security but necessary for this architecture.
const API_KEY = 'AIzaSyCEA0rxnPZHvE0tWmGTdLi9Z9R57GYcfcY';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief summary of spending habits, in Thai."
        },
        topExpenseCategories: {
            type: Type.ARRAY,
            description: "An array of top 3-5 expense categories, sorted by amount descending.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER, description: "Percentage of total expense." }
                },
                required: ["category", "amount", "percentage"]
            }
        },
        savingsSuggestions: {
            type: Type.ARRAY,
            description: "An array of personalized saving suggestions, in Thai.",
            items: {
                type: Type.STRING
            }
        },
        monthlyChartData: {
            type: Type.OBJECT,
            description: "Total income and expense for the period.",
            properties: {
                income: { type: Type.NUMBER },
                expense: { type: Type.NUMBER }
            },
            required: ["income", "expense"]
        }
    },
    required: ["summary", "topExpenseCategories", "savingsSuggestions", "monthlyChartData"]
};

export const analyzeSpending = async (transactions: Transaction[]) => {
    if (transactions.length === 0) {
        return {
            summary: "ไม่มีข้อมูลธุรกรรมที่จะวิเคราะห์",
            topExpenseCategories: [],
            savingsSuggestions: ["เพิ่มรายการธุรกรรมเพื่อรับคำแนะนำ"],
            monthlyChartData: { income: 0, expense: 0 }
        };
    }

    const prompt = `
        วิเคราะห์ข้อมูลรายรับรายจ่ายต่อไปนี้ และให้ผลลัพธ์เป็น JSON ภาษาไทย
        ข้อมูลธุรกรรม:
        ${JSON.stringify(transactions, null, 2)}

        คำแนะนำ:
        - สรุปภาพรวมการใช้จ่าย (summary)
        - จัดลำดับหมวดหมู่รายจ่ายที่สูงสุด 3-5 อันดับ (topExpenseCategories) พร้อมคำนวณสัดส่วนเป็นเปอร์เซ็นต์ของรายจ่ายทั้งหมด
        - ให้คำแนะนำเพื่อการออม (savingsSuggestions) ที่เหมาะสมกับพฤติกรรมการใช้จ่ายนี้
        - คำนวณยอดรวมรายรับและรายจ่าย (monthlyChartData)
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

const slipSchema = {
    type: Type.OBJECT,
    properties: {
        type: {
            type: Type.STRING,
            enum: [TransactionType.INCOME, TransactionType.EXPENSE],
            description: `ประเภทของธุรกรรม ถ้าเป็นการโอนเงินให้ผู้อื่นหรือจ่ายเงิน ให้เป็น '${TransactionType.EXPENSE}' ถ้าเป็นการรับเงินให้เป็น '${TransactionType.INCOME}'`
        },
        category: {
            type: Type.STRING,
            description: `หมวดหมู่ของธุรกรรมจากรายการต่อไปนี้: ${[...CATEGORIES.expense, ...CATEGORIES.income].join(', ')}. ถ้าไม่แน่ใจให้ใช้ 'อื่นๆ'.`
        },
        amount: {
            type: Type.NUMBER,
            description: "จำนวนเงินของธุรกรรม"
        },
        note: {
            type: Type.STRING,
            description: "สรุปสั้นๆ เกี่ยวกับธุรกรรม เช่น ชื่อผู้รับ/ผู้โอน หรือบันทึกช่วยจำ ถ้ามี"
        }
    },
    required: ["type", "category", "amount", "note"]
};

export const analyzeSlip = async (base64Image: string, mimeType: string): Promise<Omit<Transaction, 'id' | 'createdAt'>> => {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType
        }
    };

    const textPart = {
        text: `
            วิเคราะห์รูปภาพสลิปการโอนเงินนี้ และดึงข้อมูลออกมาเป็น JSON ภาษาไทย
            - type: ถ้าเป็นการโอนเงินให้ผู้อื่นหรือจ่ายเงิน ให้เป็น 'expense' ถ้าเป็นการรับเงินให้เป็น 'income'
            - category: เลือกหมวดหมู่ที่เหมาะสมที่สุดจากรายการนี้: ${[...CATEGORIES.expense, ...CATEGORIES.income].join(', ')}. หากไม่สามารถระบุได้ ให้ใช้ "อื่นๆ".
            - amount: จำนวนเงิน
            - note: บันทึกสั้นๆ เช่น ชื่อผู้รับ, ชื่อผู้โอน, หรือรายละเอียดอื่นๆ ที่มีประโยชน์
        `
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: slipSchema
        }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    const validCategories = CATEGORIES[result.type as TransactionType] ?? [];
    if (!validCategories.includes(result.category)) {
        result.category = 'อื่นๆ';
    }

    return result;
};