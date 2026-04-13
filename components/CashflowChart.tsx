'use client';

import React, { useState, useMemo, memo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Info, MoreHorizontal, BarChart2, Sparkles, Star, Activity, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
    format, 
    startOfMonth, 
    endOfMonth,
    eachMonthOfInterval, 
    subMonths, 
    startOfDay, 
    subDays, 
    eachDayOfInterval,
    startOfYear,
    setMonth,
    subYears,
    eachYearOfInterval,
    isSameDay,
    isSameMonth,
    isSameYear
} from 'date-fns';
import { id } from 'date-fns/locale';

const CashflowChart = memo(function CashflowChart() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [activePeriod, setActivePeriod] = useState<string>('');

  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  const chartData = useMemo(() => {
    // Lock to Day-by-Day view of the selected month
    const intervals = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    });

    const data = intervals.map(date => {
      const label = format(date, 'd'); // Show 1, 2, 3...
      const filtered = transactions.filter(t => isSameDay(new Date(t.createdAt), date));

      const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      return { label, income, expense, date };
    });

    return data;
  }, [transactions, selectedMonth]);

  const currentLabel = activePeriod || format(selectedMonth, 'MMMM', { locale: id });
  const currentData = chartData.find(d => d.label === activePeriod) || chartData[chartData.length - 1];
  
  // High-Density Metrics
  const peakIncome = Math.max(...chartData.map(d => d.income));
  const avgExpense = chartData.reduce((s, d) => s + d.expense, 0) / (chartData.length || 1);
  const avgIncome = chartData.reduce((s, d) => s + d.income, 0) / (chartData.length || 1);
  const netMargin = (chartData.reduce((s, d) => s + d.income, 0) > 0) 
    ? ((chartData.reduce((s, d) => s + d.income, 0) - chartData.reduce((s, d) => s + d.expense, 0)) / chartData.reduce((s, d) => s + d.income, 0)) * 100 
    : 0;

  return (
    <div className="w-full flex-1 flex flex-col px-1 min-h-0">
      {/* Header Section - Locked to Month */}
      <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest">Analytics</h2>
              
              <div className="flex items-center bg-neutral-100/50 rounded-xl p-0.5 border border-neutral-100 ml-2">
                  <button 
                    onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                    className="px-3 py-1 text-[11px] font-bold text-neutral-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                  >
                        Prev
                  </button>
                  <div className="px-4 py-1.5 bg-white border border-neutral-100 rounded-lg text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                        {format(selectedMonth, 'MMMM yyyy', { locale: id })}
                  </div>
                  <button 
                    onClick={() => setSelectedMonth(subMonths(selectedMonth, -1))}
                    className="px-3 py-1 text-[11px] font-bold text-neutral-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                  >
                        Next
                  </button>
              </div>
          </div>

          <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className="text-neutral-400">In</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span className="text-neutral-400">Out</span>
                  </div>
              </div>
              <button className="p-1 hover:bg-neutral-50 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-neutral-300" />
              </button>
          </div>
      </div>

      {/* Micro-Stats Row - High Density Information */}
      <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/30">
              <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
              <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-none mb-0.5">Puncak Tertinggi</span>
                  <span className="text-xs font-bold text-neutral-700 leading-none">Rp {peakIncome.toLocaleString('id-ID')}</span>
              </div>
          </div>
          
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-red-50/30 rounded-xl border border-red-100/20">
              <Activity className="w-4 h-4 text-red-400" />
              <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-none mb-0.5">Rata-rata Keluar</span>
                  <span className="text-xs font-bold text-neutral-700 leading-none">Rp {Math.round(avgExpense).toLocaleString('id-ID')}</span>
              </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50/50 rounded-xl border border-emerald-100/30">
              <Calculator className="w-4 h-4 text-emerald-500" />
              <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-none mb-0.5">Margin Bersih</span>
                  <span className="text-xs font-bold text-emerald-600 leading-none">{netMargin.toFixed(1)}%</span>
              </div>
          </div>

          <div className="ml-auto hidden xl:flex items-center gap-2 text-[10px] text-neutral-400 font-medium italic">
             <Info className="w-3 h-3" />
             Bulan {currentLabel} stabil secara finansial
          </div>
      </div>

      {/* Chart Area - Vertical DOMINANCE */}
      <div className="w-full flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={chartData} margin={{ top: 10, right: 35, left: 15, bottom: 45 }}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={true} 
                horizontal={true}
                stroke="#fca5a5" 
                strokeOpacity={0.25} 
                strokeWidth={1.5}
            />
            <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                dy={8}
                interval={0} // Force 30 ticks to get 30 vertical lines
                tickFormatter={(val, index) => {
                    // Only show labels for specific days to keep it clean
                    const day = parseInt(val);
                    if ([1, 6, 11, 16, 21, 26].includes(day)) return val;
                    if (day === 30 || day === 31) return val;
                    return "";
                }}
            />
            <YAxis 
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 500 }}
                width={35}
                domain={[0, 'auto']}
                tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(0)}J` : `${val/1000}K`}
            />

            <Tooltip 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const details = transactions.filter(t => {
                            const d = new Date(t.createdAt);
                            return d.getDate() === data.date.getDate() && 
                                   d.getMonth() === data.date.getMonth() && 
                                   d.getFullYear() === data.date.getFullYear();
                        }).filter(t => t.type === 'expense')
                          .sort((a, b) => b.amount - a.amount)
                          .slice(0, 5);

                        return (
                            <div className="bg-white border border-neutral-100 px-6 py-5 rounded-[2.5rem] flex flex-col gap-4 min-w-[240px] -translate-y-8 z-50">
                                <div className="flex items-center justify-between border-b border-neutral-50 pb-3 mb-1">
                                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                                        {format(data.date, 'dd MMMM yyyy', { locale: id })}
                                    </span>
                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-tighter">Masuk</span>
                                        </div>
                                        <span className="text-sm font-bold text-neutral-900 tracking-tight">
                                            Rp {payload.find(p => p.dataKey === 'income')?.value.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-tighter">Keluar</span>
                                        </div>
                                        <span className="text-sm font-bold text-red-600 tracking-tight">
                                            Rp {payload.find(p => p.dataKey === 'expense')?.value.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                {details.length > 0 && (
                                    <div className="mt-2 pt-3 border-t border-neutral-50">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5 px-1">Detail Pengeluaran</p>
                                        <div className="space-y-2.5">
                                            {details.map((t, i) => (
                                                <div key={i} className="flex items-center justify-between gap-5 px-1">
                                                    <span className="text-[11px] text-neutral-600 truncate max-w-[130px] font-medium">{t.description || t.category}</span>
                                                    <span className="text-[11px] font-bold text-red-500 font-mono">-{t.amount.toLocaleString('id-ID')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                }}
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="#818cf8" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpense)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default CashflowChart;
