
export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

export interface Transaction {
    id: string;
    type: TransactionType;
    category: string;
    amount: number;
    note: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    created_at: string;
}

export interface Budget {
    id: string;
    category: string;
    amount: number;
    created_at: string;
}
