import { TransactionService } from './services/transactionService';
import type { Transaction } from '@/types';
import { subDays } from 'date-fns';

const categories = {
  income: ['Gaji', 'Freelance', 'Transfer Masuk'],
  expense: ['Makanan & Minuman', 'Transportasi', 'Tempat Tinggal', 'Belanja', 'Kesehatan', 'Hiburan', 'Tagihan']
};

export const curatedDemoTransactions: Omit<Transaction, 'id'>[] = [
  {
    amount: 12000000,
    type: 'income',
    category: 'Gaji',
    description: 'Gaji Bulanan Maret',
    status: 'paid',
    rawInput: 'terima gaji 12jt',
    aiConfidence: 0.99,
    createdAt: subDays(new Date(), 32),
  },
  {
    amount: 1500000,
    type: 'expense',
    category: 'Tempat Tinggal',
    description: 'Bayar Kos Maret',
    status: 'paid',
    rawInput: 'bayar kos 1.5jt',
    aiConfidence: 0.98,
    createdAt: subDays(new Date(), 30),
  },
  {
    amount: 12000000,
    type: 'income',
    category: 'Gaji',
    description: 'Gaji Bulanan April',
    status: 'paid',
    rawInput: 'terima gaji 12jt',
    aiConfidence: 0.99,
    createdAt: subDays(new Date(), 2),
  },
  {
    amount: 1500000,
    type: 'expense',
    category: 'Tempat Tinggal',
    description: 'Bayar Kos April',
    status: 'paid',
    rawInput: 'bayar kos 1.5jt',
    aiConfidence: 0.98,
    createdAt: subDays(new Date(), 1),
  },
  {
    amount: 450000,
    type: 'expense',
    category: 'Tagihan',
    description: 'Internet & Netflix',
    status: 'paid',
    rawInput: 'internet netflix 450rb',
    aiConfidence: 0.95,
    createdAt: subDays(new Date(), 5),
  },
  {
    amount: 85000,
    type: 'expense',
    category: 'Transportasi',
    description: 'Grab ke Kantor',
    status: 'paid',
    rawInput: 'grab 85k',
    aiConfidence: 0.92,
    createdAt: subDays(new Date(), 3),
  },
  {
    amount: 120000,
    type: 'expense',
    category: 'Makanan & Minuman',
    description: 'Makan Malam Hangout',
    status: 'paid',
    rawInput: 'makan malam 120rb',
    aiConfidence: 0.96,
    createdAt: subDays(new Date(), 4),
  },
];

export async function seedDemoData() {
  const allTxns = await TransactionService.getAll();
  const count = allTxns.length;

  if (count === 0) {
    const now = new Date();
    const additionalData: Omit<Transaction, 'id'>[] = [];
    
    // Add curated data
    await TransactionService.bulkCreate(curatedDemoTransactions);
    
    // Generate remaining to reach 30
    for (let i = curatedDemoTransactions.length; i < 30; i++) {
      const isIncome = Math.random() < 0.1;
      const categoryList = isIncome ? categories.income : categories.expense;
      const category = categoryList[Math.floor(Math.random() * categoryList.length)];
      const amount = isIncome 
        ? (Math.floor(Math.random() * 3) + 1) * 1000000 
        : (Math.floor(Math.random() * 15) + 1) * 25000;
        
      additionalData.push({
        amount,
        type: isIncome ? 'income' : 'expense',
        category,
        description: `Transaksi ${category} ${i + 1}`,
        status: 'paid',
        rawInput: 'Input otomatis demo',
        aiConfidence: 0.88,
        createdAt: subDays(now, Math.floor(Math.random() * 60)),
      });
    }
    
    await TransactionService.bulkCreate(additionalData);
    
    // Note: Profile seeding should ideally be handled by its own Service
    // For now keeping it simple or moving to Service if exists.
  }
}
