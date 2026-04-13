import { db } from './db';
import { setMonth, startOfMonth, addDays, format, subDays } from 'date-fns';

export async function seedDummyData() {
  const count = await db.transactions.count();
  // Force re-seed for the new 'Dramatic Monthly' scenario
  console.log('Force resetting and re-seeding data...');

  await db.transactions.clear();

  const now = new Date();
  const dummyTransactions: any[] = [];
  
  // Loop through January (0) to December (11)
  for (let month = 0; month < 12; month++) {
    const monthDate = startOfMonth(setMonth(new Date(), month));
    monthDate.setHours(12, 0, 0, 0);
    
    // Generate 30 days of data for EACH month (HEMAT EDITION - 4JT SALARY)
    for (let i = 27; i >= 0; i--) {
        const date = addDays(monthDate, i);
        
        // 1. INCOME (Total 4jt: 3.5jt Salary + 500k Side Hustle)
        if (i === 0 || i === 14) {
          dummyTransactions.push({
            description: i === 0 ? `Gaji Utama - ${formatMonthFull(month)}` : `Freelance Bonus #${month}`,
            amount: i === 0 ? (3400000 + Math.floor(Math.random() * 200000)) : 500000,
            category: 'Gaji',
            type: 'income',
            createdAt: date,
          });
        }

        // 2. DAILY EXPENSES (Scaled down to fit 4jt budget)
        const dailyExpenseCount = Math.floor(Math.random() * 2) + 1; 
        for (let j = 0; j < dailyExpenseCount; j++) {
            const isBigSpike = Math.random() > 0.92; // Rarely (8% chance)
            const amount = isBigSpike 
                ? Math.floor(Math.random() * 500000) + 300000 // Spike: 300rb - 800rb
                : Math.floor(Math.random() * 40000) + 20000;    // Reguler: 20rb - 60rb

            dummyTransactions.push({
                description: isBigSpike ? `Belanja Besar ${format(date, 'dd/MM')}` : `Harian ${format(date, 'dd/MM')}-${j}`,
                amount: amount,
                category: isBigSpike ? 'Belanja' : 'Makanan & Minuman',
                type: 'expense',
                createdAt: date,
            });
        }
    }
  }

  // ADD THE SPECIFIC ITEMS REQUESTED FOR RECENT ACTIVITY (Today: Apr 13)
  const today = new Date();
  const specificItems = [
    { category: 'Gaji', amount: 3400000 + Math.floor(Math.random() * 200000), type: 'income', description: 'Gaji Masuk', createdAt: today },
    { category: 'Makanan & Minuman', amount: 35000, type: 'expense', description: 'Makan Siang', createdAt: today },
    { category: 'Transportasi', amount: 20000, type: 'expense', description: 'Gojek Kerja', createdAt: today },
  ];

  // Ensure some random variation so charts look "alive" on refresh
  const data = [
    { type: 'income', category: 'Salary', amount: 4000000 + (Math.random() * 200000), description: 'Gaji Bulanan', createdAt: now.getTime() },
    { type: 'expense', category: 'Food', amount: 50000 + (Math.random() * 50000), description: 'Makan Siang', createdAt: now.getTime() - 1000 * 60 * 60 * 24 },
    { type: 'expense', category: 'Transport', amount: 20000 + (Math.random() * 20000), description: 'Ojek Online', createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 2 },
    { type: 'expense', category: 'Utilities', amount: 150000, description: 'Listrik', createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 3 },
    { type: 'expense', category: 'Food', amount: 80000 + (Math.random() * 30000), description: 'Makan Malam', createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 4 },
    { type: 'income', category: 'Freelance', amount: 500000 + (Math.random() * 100000), description: 'Proyek Sampingan', createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 5 },
    { type: 'expense', category: 'Entertainment', amount: 120000, description: 'Tiket Bioskop', createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 6 },
  ];

  await db.transactions.bulkAdd([...dummyTransactions, ...specificItems]);
  console.log('Final Dramatic Balanced Data Seeding Success');
}

function formatMonthFull(m: number) {
    const names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return names[m];
}
