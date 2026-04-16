'use client';

import React, { useMemo, memo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { TransactionService } from '@/lib/services/transactionService';
import type { Transaction } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
    eachDayOfInterval,
    subDays,
    startOfMonth,
    endOfMonth,
    format,
    isSameDay,
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    isSameMonth,
    isSameYear
} from 'date-fns';
import { id } from 'date-fns/locale';
import { Wallet, TrendingDown, Sparkles } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const SalaryBurnChart = memo(function SalaryBurnChart() {
  const transactions = useLiveQuery(() => TransactionService.getAll()) || [];
  const now = new Date();

  const burnData = useMemo(() => {
    // 1. Define the window: Current Year (Jan - Dec)
    const start = startOfYear(now);
    const end = endOfYear(now);
    const intervals = eachMonthOfInterval({ start, end });

    // 2. Calculate initial balance from everything BEFORE the start of this year
    const initialBalance = transactions
        .filter(t => new Date(t.createdAt) < start)
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);

    let currentBalance = initialBalance;
    
    // 3. Map months cumulatively
    return intervals.map(date => {
        const monthLabel = format(date, 'MMM', { locale: id });
        const monthlyTransactions = transactions.filter(t => isSameMonth(new Date(t.createdAt), date) && isSameYear(new Date(t.createdAt), date));
        
        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthlyExpense = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        currentBalance += (monthlyIncome - monthlyExpense);
        
        return {
            label: monthLabel,
            remaining: currentBalance,
            monthlyIncome,
            monthlyExpense,
            incomeNote: `Income for ${monthLabel}`,
            date
        };
    });
  }, [transactions]);

  // Find the balance for current month or latest available
  const currentMonthIdx = now.getMonth();
  const latestRemaining = burnData.length > 0 ? burnData[currentMonthIdx]?.remaining || burnData[burnData.length - 1].remaining : 0;

  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                  <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-[12px] font-semibold text-black">Balance Runway</h3>
          </div>
          <div className="text-[11px] font-semibold text-black bg-neutral-100/50 px-3 py-1 rounded-full border border-neutral-100">
              Sisa: {formatCurrency(latestRemaining)}
          </div>
      </div>

      <div className="w-full flex-1 min-h-[300px] sm:min-h-0 relative min-w-0">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={burnData} margin={{ top: 10, right: 35, left: 15, bottom: 30 }}>
            <defs>
              <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#000000', fontSize: 9, fontWeight: 500 }}
                dy={4}
                interval={0}
            />
            <YAxis 
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#000000', fontSize: 8, fontWeight: 500 }}
                width={35}
                tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(0)}J` : `${val/1000}K`}
            />
            <Tooltip 
                cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                allowEscapeViewBox={{ x: true, y: true }}
                content={({ active, payload, coordinate }) => {
                    if (active && payload && payload.length && coordinate) {
                        const data = payload[0].payload;
                        
                        // Adaptive Flip Logic: if Y is deep (bottom), shift tooltip UP
                        const isBottom = coordinate.y > 150; 

                        // Monthly details for Tooltip - Limited to 3
                        const detailsIncome = transactions.filter(t => {
                            const d = new Date(t.createdAt);
                            return d.getMonth() === data.date.getMonth() && d.getFullYear() === data.date.getFullYear();
                        }).filter(t => t.type === 'income')
                          .sort((a, b) => b.amount - a.amount)
                          .slice(0, 3);

                        return (
                            <div 
                                className={cn(
                                    "bg-white/95 backdrop-blur-md border border-neutral-100 p-4 rounded-[1.25rem] flex flex-col gap-3 min-w-[280px] z-50 shadow-xl transition-transform duration-200",
                                    isBottom ? "-translate-y-[105%]" : "translate-y-4"
                                )}
                            >
                                {/* Header Section */}
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-semibold text-black">
                                        {format(data.date, 'MMMM yyyy', { locale: id })}
                                    </span>
                                    <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                        <Sparkles className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                
                                <div className="h-px bg-neutral-50 -mx-4" />

                                {/* Main Stats */}
                                <div className="space-y-2.5 px-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-indigo-50" />
                                            <span className="text-[10px] font-semibold text-black">Total Balance</span>
                                        </div>
                                        <span className="text-[14px] font-semibold text-indigo-600 tracking-tight">
                                            {formatCurrency(Number(payload[0].value))}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full ring-4 ring-blue-50" />
                                            <span className="text-[10px] font-semibold text-black">Pemasukan</span>
                                        </div>
                                        <span className="text-[13px] font-semibold text-blue-600 tracking-tight">
                                            {formatCurrency(data.monthlyIncome)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full ring-4 ring-red-50" />
                                            <span className="text-[10px] font-semibold text-black">Pengeluaran</span>
                                        </div>
                                        <span className="text-[13px] font-semibold text-red-600 tracking-tight">
                                            {formatCurrency(data.monthlyExpense)}
                                        </span>
                                    </div>
                                </div>

                                {/* DETAIL PEMASUKAN Section */}
                                {detailsIncome.length > 0 && (
                                    <>
                                        <div className="h-px bg-neutral-50 -mx-4" />
                                        <div className="flex flex-col gap-3 px-1 pb-1">
                                            <p className="text-[8px] font-semibold text-black/40 uppercase tracking-wider">Top 3 Income Sources</p>
                                            <div className="space-y-2">
                                                {detailsIncome.map((t, i) => (
                                                    <div key={i} className="flex items-center justify-between gap-6 text-[11px]">
                                                        <span className="font-bold text-black truncate flex-1">{t.description || t.category}</span>
                                                        <span className="font-black text-emerald-500">+{formatCurrency(t.amount).replace('Rp ', '')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    }
                    return null;
                }}
            />
            <Area 
              type="monotone" 
              dataKey="remaining" 
              stroke="#f59e0b" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBurn)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);
});

export default SalaryBurnChart;
