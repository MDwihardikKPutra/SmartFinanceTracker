import Dexie, { type EntityTable } from 'dexie';

export interface Transaction {
  id?: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  status: 'paid' | 'pending' | 'canceled';
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

const db = new Dexie('SmartFinanceDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  profile: EntityTable<Profile, 'id'>;
};

// Schema definition: primary key and indexed fields
// Using ++id for auto-incrementing primary key in transactions
db.version(1).stores({
  transactions: '++id, amount, type, category, status, createdAt',
  profile: 'id, targetSavings'
});

export { db };
