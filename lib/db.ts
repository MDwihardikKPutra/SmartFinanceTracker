import Dexie, { type EntityTable } from 'dexie';
import type { Transaction, Profile } from '@/types';

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
