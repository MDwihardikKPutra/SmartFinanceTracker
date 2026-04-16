export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending' | 'canceled';

export interface Transaction {
    id?: number;
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    status: TransactionStatus;
    rawInput: string;
    aiConfidence: number;
    createdAt: Date;
}

export interface Profile {
    id: number;
    targetSavings: number;
    targetDate: Date;
    currency: string;
}

// AI Specific payload typing
export interface AIParsedTransaction {
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    confidence: number;
}
