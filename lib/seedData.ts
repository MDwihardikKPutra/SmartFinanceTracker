import { db } from './db';
import { setMonth, startOfMonth, addDays, format } from 'date-fns';

const REALISTIC_DESCRIPTIONS = {
    'Makanan & Minuman': [
        'Starbucks Reserve SCBD', 'Lunch at Oma Elly', 'Fine Dining Grand Indonesia', 
        'Dinner at Union Brasserie', 'Breakfast at Hyatt', 'Catering Karyawan Kantor',
        'Kopi Kenangan Heritage', 'Bazaar Kuliner Elit'
    ],
    'Transportasi': [
        'Bensin Pertamax Turbo', 'Maintenance Mercedes S-Class', 'GrabCar Premium Executive',
        'Tiket Garuda First Class', 'Parkir VIP Mall', 'Service Tesla Model S',
        'Toll Road Access', 'Asuransi Kendaraan Mewah'
    ],
    'Tagihan': [
        'Listrik Kantor Pusat', 'Wifi Dedicated Fiber', 'Membership Golf Club',
        'Iuran Apartemen Penthouse', 'Subscription Bloomberg Terminal', 'Asuransi Kesehatan Internasional'
    ],
    'Belanja': [
        'Beli Laptop Workstation', 'Furniture Kantor Baru', 'Aset Jam Tangan Koleksi',
        'Gadget Flagship Terbaru', 'Donasi Yayasan Buffet', 'Koleksi Buku Langka'
    ],
    'Gaji': [
        'Management Salary', 'Bonus Performa Tahunan', 'Dividen Berkshire Hathaway',
        'Dividen Apple Inc.', 'Gaji Pokok Direksi'
    ],
    'Freelance': [
        'Profit Penjualan Saham', 'Consultancy Fee Projects', 'Trading Gain Assets',
        'Karya Seni Investasi', 'Passive Income Property'
    ],
    'Lainnya': [
        'Biaya Administrasi Bank VIP', 'Pajak Aset Tahunan', 'Hobi Filateli',
        'Kursus Investasi Lanjutan'
    ]
};

function getRandom(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedDummyData() {
  await db.transactions.clear();

  const dummyTransactions: any[] = [];
  
  // Generate data for the full year (Jan to Dec)
  for (let month = 0; month < 12; month++) {
    const monthDate = startOfMonth(setMonth(new Date(), month));
    
    // 1. HIGH INCOME (Buffet Style: 150jt - 450jt dynamic)
    const monthlySalary = 250000000 + Math.floor(Math.random() * 200000000);
    const dividend = 50000000 + Math.floor(Math.random() * 100000000);

    dummyTransactions.push({
        description: getRandom(REALISTIC_DESCRIPTIONS['Gaji']),
        amount: monthlySalary,
        category: 'Gaji',
        type: 'income',
        createdAt: addDays(monthDate, 0),
    });

    dummyTransactions.push({
        description: getRandom(REALISTIC_DESCRIPTIONS['Freelance']),
        amount: dividend,
        category: 'Freelance',
        type: 'income',
        createdAt: addDays(monthDate, 14),
    });

    // 2. DAILY EXPENSES (Buffet Tier: 100rb - 5jt per transaction)
    for (let i = 28; i >= 1; i--) {
        const date = addDays(monthDate, i);
        
        // Random number of transactions per day
        const dailyCount = Math.floor(Math.random() * 3); 
        for (let j = 0; j < dailyCount; j++) {
            const isBigAsset = Math.random() > 0.95; // Big luxury item
            const category = isBigAsset ? 'Belanja' : (Math.random() > 0.4 ? 'Makanan & Minuman' : 'Transportasi');
            
            const amount = isBigAsset 
                ? Math.floor(Math.random() * 50000000) + 10000000 // 10jt - 60jt
                : Math.floor(Math.random() * 800000) + 150000;    // 150rb - 1jt

            dummyTransactions.push({
                description: getRandom(REALISTIC_DESCRIPTIONS[category as keyof typeof REALISTIC_DESCRIPTIONS] || REALISTIC_DESCRIPTIONS['Lainnya']),
                amount: amount,
                category: category,
                type: 'expense',
                createdAt: date,
            });
        }

        // Add recurring bills once a month
        if (i === 5) {
            dummyTransactions.push({
                description: getRandom(REALISTIC_DESCRIPTIONS['Tagihan']),
                amount: 5000000 + Math.floor(Math.random() * 10000000),
                category: 'Tagihan',
                type: 'expense',
                createdAt: date,
            });
        }
    }
  }

  await db.transactions.bulkAdd(dummyTransactions);
  console.log('Buffet Tier Data Seeding Success');
}
