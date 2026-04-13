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
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    format,
    isSameDay
} from 'date-fns';
import { id } from 'date-fns/locale';
import { Wallet, TrendingDown } from 'lucide-react';

const SalaryBurnChart = memo(function SalaryBurnChart() {
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const now = new Date();

  const burnData = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const intervals = eachDayOfInterval({ start, end });

    // 1. Find the total income (salary) for this month
    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && new Date(t.createdAt) >= start && new Date(t.createdAt) <= end)
        .reduce((sum, t) => sum + t.amount, 0);

    let currentBalance = monthlyIncome || 0;
    
    return intervals.map(date => {
        const dayLabel = format(date, 'd');
        const dailyExpense = transactions
            .filter(t => t.type === 'expense' && isSameDay(new Date(t.createdAt), date))
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Subtract daily expense from the remaining salary pool
        currentBalance -= dailyExpense;
        
        return {
            label: dayLabel,
            remaining: Math.max(0, currentBalance),
            date
        };
    });
  }, [transactions]);

  const latestRemaining = burnData.length > 0 ? burnData[new Date().getDate() - 1]?.remaining : 0;

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 mt-2 border-t border-neutral-50 pt-2">
      <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                  <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Salary Runway</h3>
          </div>
          <div className="text-[11px] font-bold text-neutral-900 bg-neutral-50 px-3 py-1 rounded-full">
              Sisa: Rp {latestRemaining?.toLocaleString('id-ID')}
          </div>
      </div>

      <div className="w-full flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={burnData} margin={{ top: 5, right: 35, left: 15, bottom: 25 }}>
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
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                dy={4}
                interval={4}
            />
            <YAxis 
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#cbd5e1', fontSize: 8 }}
                width={35}
                tickFormatter={(val) => `${val/1000}K`}
            />
            <Tooltip 
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        return (
                            <div className="bg-neutral-900 text-white px-3 py-2 rounded-xl text-[10px] shadow-xl">
                                <p className="font-bold opacity-60 mb-1">{format(payload[0].payload.date, 'dd MMM')}</p>
                                <p className="text-amber-400">Sisa: Rp {payload[0].value.toLocaleString('id-ID')}</p>
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
  );
});

export default SalaryBurnChart;
