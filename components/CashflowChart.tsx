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
import { TrendingUp, TrendingDown, Info, MoreHorizontal, BarChart2, Sparkles, Star, Activity, Calculator, Wallet } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
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

import { useChat } from '@/context/ChatContext';

const CashflowChart = memo(function CashflowChart() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [activePeriod, setActivePeriod] = useState<string>('');
  const { isChatOpen, toggleChat } = useChat();

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

      const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

      return { label, income, expense, date };
    });

    return data;
  }, [transactions, selectedMonth]);

  const currentLabel = activePeriod || format(selectedMonth, 'MMMM', { locale: id });
  const currentData = chartData.find(d => d.label === activePeriod) || chartData[chartData.length - 1];
  
  // High-Density Metrics (Simplified to Monthly focus)
  const totalMonthExpense = chartData.reduce((s, d) => s + d.expense, 0);
  const totalMonthIncome = chartData.reduce((s, d) => s + d.income, 0);
  const remainingMonthBalance = totalMonthIncome - totalMonthExpense;

  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      {/* Header Section - Locked to Month */}
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-[12px] font-semibold text-black">Analytics</h2>
              
              <div className="flex items-center bg-neutral-100/50 rounded-xl p-0.5 border border-neutral-100 ml-2">
                  <button 
                    onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                    className="px-3 py-1 text-[11px] font-medium text-black hover:text-blue-600 transition-colors"
                  >
                        Prev
                  </button>
                  <div className="px-4 py-1.5 bg-white border border-neutral-100 rounded-lg text-[11px] font-semibold text-blue-600">
                        {format(selectedMonth, 'MMMM yyyy', { locale: id })}
                  </div>
                  <button 
                    onClick={() => setSelectedMonth(subMonths(selectedMonth, -1))}
                    className="px-3 py-1 text-[11px] font-medium text-black hover:text-blue-600 transition-colors"
                  >
                        Next
                  </button>
              </div>
          </div>

          {/* Contextual Your Command Button - Large Flat Blue Style */}
          <button 
                onClick={toggleChat}
                className={cn(
                    "flex items-center gap-2.5 py-2.5 px-6 rounded-xl text-[12px] font-bold transition-all duration-300 group border",
                    isChatOpen 
                    ? "bg-indigo-700 border-indigo-500 text-white scale-[0.98]" 
                    : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500"
                )}
            >
                <div className={cn(
                    "w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-500 bg-white/20",
                    isChatOpen ? "rotate-12" : "group-hover:rotate-12"
                )}>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="tracking-wide">Your Command</span>
            </button>
      </div>

      {/* Professional Banking Stats Header */}
      <div className="flex items-center gap-12 mb-8 py-2 px-1">
          <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 text-[10px] font-semibold text-black">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>Pemasukan</span>
              </div>
              <span className="text-xl font-semibold text-black tracking-tighter">
                  {formatCurrency(totalMonthIncome)}
              </span>
          </div>

          <div className="h-10 w-px bg-neutral-100" />

          <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 text-[10px] font-semibold text-black">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span>Pengeluaran</span>
              </div>
              <span className="text-xl font-semibold text-black tracking-tighter">
                  {formatCurrency(totalMonthExpense)}
              </span>
          </div>

          <div className="h-10 w-px bg-neutral-100" />

          <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 text-[10px] font-semibold text-black">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span>Sisa Uang</span>
              </div>
              <span className={cn(
                  "text-xl font-semibold tracking-tighter",
                  remainingMonthBalance >= 0 ? "text-emerald-600" : "text-red-500"
              )}>
                  {formatCurrency(remainingMonthBalance)}
              </span>
          </div>
      </div>

      {/* Chart Area - Vertical DOMINANCE Stretch */}
      <div className="w-full flex-1 min-h-0 relative min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 35, left: 15, bottom: 30 }}>
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
                tick={{ fill: '#000000', fontSize: 10, fontWeight: 500 }}
                dy={8}
                interval={0} 
                tickFormatter={(val, index) => {
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
                tick={{ fill: '#000000', fontSize: 9, fontWeight: 500 }}
                width={35}
                domain={[0, 'auto']}
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

                        const details = transactions.filter(t => {
                            const d = new Date(t.createdAt);
                            return d.getDate() === data.date.getDate() && 
                                   d.getMonth() === data.date.getMonth() && 
                                   d.getFullYear() === data.date.getFullYear();
                        }).filter(t => t.type === 'expense')
                          .sort((a, b) => b.amount - a.amount)
                          .slice(0, 3);

                        const incomeVal = payload.find(p => p.dataKey === 'income')?.value || 0;
                        const expenseVal = payload.find(p => p.dataKey === 'expense')?.value || 0;

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
                                        {format(data.date, 'dd MMMM yyyy', { locale: id })}
                                    </span>
                                    <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                        <Sparkles className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                
                                <div className="h-px bg-neutral-50 -mx-4" />

                                {/* Masuk & Keluar Rows */}
                                <div className="space-y-2.5 px-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full ring-4 ring-blue-50" />
                                            <span className="text-[10px] font-semibold text-black">Pemasukan</span>
                                        </div>
                                        <span className="text-[13px] font-semibold text-black tracking-tight">
                                            {formatCurrency(Number(incomeVal))}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full ring-4 ring-red-50" />
                                            <span className="text-[10px] font-semibold text-black">Pengeluaran</span>
                                        </div>
                                        <span className="text-[13px] font-semibold text-red-600 tracking-tight">
                                            {formatCurrency(Number(expenseVal))}
                                        </span>
                                    </div>
                                </div>

                                {/* Detail Section */}
                                {details.length > 0 && (
                                    <>
                                        <div className="h-px bg-neutral-50 -mx-4" />
                                        <div className="flex flex-col gap-3 px-1 pb-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[8px] font-semibold text-black/40 uppercase tracking-wider">Top 3 Expenses</p>
                                            </div>
                                            <div className="space-y-2">
                                                {details.map((t, i) => (
                                                    <div key={i} className="flex items-center justify-between gap-6 text-[11px]">
                                                        <span className="font-medium text-black truncate flex-1">{t.description || t.category}</span>
                                                        <span className="font-semibold text-red-500/80">-{formatCurrency(t.amount).replace('Rp ', '')}</span>
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
