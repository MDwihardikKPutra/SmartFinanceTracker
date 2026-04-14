'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/constants';
import CashflowChart from '@/components/CashflowChart';
import SalaryBurnChart from '@/components/SalaryBurnChart';
import BudgetHealthGauge from '@/components/BudgetHealthGauge';
import WeeklyActivityBar from '@/components/WeeklyActivityBar';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { isSameMonth, subDays } from 'date-fns';
import { seedDummyData } from '@/lib/seedData';

export default function DashboardPage() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('createdAt').reverse().toArray()) || [];

  useEffect(() => {
    seedDummyData();
  }, []);
  
  const now = new Date();

  // Stats Calculation
  const balance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);

  const getMonthlyTotal = (type: 'income' | 'expense', date: Date) => 
    transactions.filter(t => t.type === type && isSameMonth(new Date(t.createdAt), date))
                .reduce((acc, t) => acc + Number(t.amount), 0);

  const thisMonthIncome = getMonthlyTotal('income', now);
  const thisMonthExpense = getMonthlyTotal('expense', now);

  // Weekly Bar Chart Data
  const weeklyActivity = useMemo(() => {
    const last7Days = transactions.filter(t => new Date(t.createdAt) >= subDays(now, 7) && t.type === 'expense');
    const categoryMap: Record<string, number> = {};
    last7Days.forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
    });

    return Object.entries(categoryMap)
        .map(([name, value]) => ({ category: name, amount: value }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
  }, [transactions]);

  // AI Insight State
  const [aiInsight, setAiInsight] = useState<{title: string, desc: string, type: 'info' | 'success' | 'danger' | 'warning', icon: any} | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    async function fetchAIInsight() {
      if (transactions.length === 0) return;
      setIsLoadingInsight(true);
      try {
        const res = await fetch('/api/get-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: transactions })
        });
        const data = await res.json();
        
        if (data.insight) {
          const isOverspending = thisMonthExpense > thisMonthIncome;
          setAiInsight({
            title: isOverspending ? 'Saran Mentor' : 'Kabar Baik',
            desc: data.insight,
            type: isOverspending ? 'danger' : 'success',
            icon: isOverspending ? AlertTriangle : Sparkles
          });
        }
      } catch (e) {
        console.error("AI Insight failed", e);
      } finally {
        setIsLoadingInsight(false);
      }
    }
    fetchAIInsight();
  }, [transactions.length, thisMonthExpense, thisMonthIncome]);

  return (
    <div className="w-full pt-3 h-full flex flex-col">
        {/* HYBRID LAYOUT CONTAINER - Flipped columns */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch flex-1 min-h-0 pb-2 text-black">
            
            {/* PILLAR SECTION: Activity Section (NOW ON THE LEFT - Fixed width) */}
            <div className="lg:w-[480px] shrink-0 h-full min-h-0 flex flex-col relative order-first">
                <div className="flex flex-col gap-4 h-full">
                    {/* Top Row: Balance Card (ATM/Credit Card Style) */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-7 rounded-[1.5rem] border border-indigo-400/30 flex flex-col justify-between h-[180px] group hover:scale-[1.01] transition-all duration-700 cursor-pointer overflow-hidden relative shrink-0 shadow-xl shadow-indigo-100/50">
                        {/* Decorative Patterns */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full -ml-16 -mb-16 blur-2xl" />
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase mb-1">Total Balance</p>
                                <h2 className="text-[28px] font-bold text-white tracking-tight flex items-baseline gap-1">
                                    <span className="text-[16px] opacity-70">Rp</span> 
                                    {balance.toLocaleString('id-ID')}
                                </h2>
                            </div>
                            <div className="w-10 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-md shadow-inner relative overflow-hidden flex flex-col gap-1 p-1">
                                <div className="w-full h-px bg-black/10" />
                                <div className="w-full h-px bg-black/10" />
                                <div className="w-full h-px bg-black/10" />
                                <div className="absolute inset-0 border border-black/5 rounded-md" />
                            </div>
                        </div>

                        <div className="flex items-end justify-between relative z-10">
                            <div className="flex flex-col">
                                <p className="text-[8px] font-bold text-white/40 tracking-widest uppercase mb-0.5">Card Holder</p>
                                <p className="text-[13px] font-bold text-white tracking-widest font-montserrat uppercase">Warren Buffet</p>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <div className="w-6 h-6 rounded-full bg-white/20" />
                                <div className="w-6 h-6 rounded-full bg-white/30 -ml-3" />
                            </div>
                        </div>
                    </div>

                    {/* Mid Row: Insights & Limit */}
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <div className="bg-white p-6 rounded-[1.5rem] border border-neutral-100 h-[170px] flex flex-col group hover:border-neutral-200 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-semibold text-black">Money Coach</h3>
                                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                            </div>
                            <div className="flex-1 flex items-center">
                                {isLoadingInsight ? (
                                    <div className="w-full h-full flex items-center gap-4 animate-pulse">
                                        <div className="w-12 h-12 rounded-xl bg-neutral-100 shrink-0" />
                                        <div className="flex-1 space-y-2"><div className="h-2.5 bg-neutral-100 rounded-full w-20" /><div className="h-2 bg-neutral-100 rounded-full w-full" /></div>
                                    </div>
                                ) : aiInsight ? (
                                    <div className="w-full flex flex-col">
                                        <div className={cn("mb-3 p-2 rounded-xl w-fit", aiInsight.type === 'danger' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                                            <aiInsight.icon className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-[11px] font-semibold text-black leading-tight mb-2">{aiInsight.title}</h4>
                                        <p className="text-[11px] text-black leading-relaxed font-semibold italic">"{aiInsight.desc}"</p>
                                    </div>
                                ) : <p className="text-[10px] text-black font-semibold italic">Analyzing...</p>}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[1.5rem] border border-neutral-100 h-[170px] flex flex-col items-center justify-between transition-all">
                            <h3 className="text-[10px] font-semibold text-black">Usage Limit</h3>
                            <BudgetHealthGauge spent={thisMonthExpense} total={thisMonthIncome} />
                        </div>
                    </div>

                    {/* Bottom Row: Unified Activity */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-neutral-100 flex-1 min-h-0 flex flex-col overflow-hidden">
                        <div className="pb-6 border-b border-neutral-50 mb-6 shrink-0">
                            <h3 className="text-[10px] font-semibold text-black mb-4">Weekly Trends</h3>
                            <WeeklyActivityBar data={weeklyActivity} />
                        </div>

                        <div className="flex-1 min-h-0 flex flex-col">
                            <div className="flex items-center justify-between mb-4 shrink-0">
                                <h3 className="text-[10px] font-semibold text-black">Aktivitas Terbaru</h3>
                            </div>
                            <div className="space-y-3.5 overflow-y-auto pr-1 custom-scrollbar flex-1">
                                {transactions.slice(0, 5).map((t) => {
                                    const cat = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.default;
                                    const Icon = cat.icon;
                                    return (
                                        <div key={t.id} className="flex items-center justify-between p-3 bg-neutral-50/50 rounded-xl hover:bg-neutral-50 transition-all group cursor-pointer border border-transparent hover:border-neutral-100">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-neutral-100 transition-transform", cat.bg)}>
                                                    <Icon className={cn("w-4 h-4", cat.color)} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-black text-xs">{t.description || t.category}</p>
                                                    <p className="text-[9px] text-black font-semibold">{formatDate(t.createdAt)}</p>
                                                </div>
                                            </div>
                                            <p className={cn("font-semibold tracking-tight text-xs", t.type === 'income' ? 'text-emerald-600' : 'text-black')}>
                                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount).replace('Rp ', '')}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ELASTIC SECTION: Analytics Section (NOW ON THE RIGHT - Adapts width dynamically) */}
            <div className="flex-1 min-w-0 h-full flex flex-col gap-4 order-last">
                <div className="bg-white p-6 rounded-[1.5rem] border border-neutral-100 flex flex-col flex-1">
                    <CashflowChart />
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-neutral-100 flex flex-col flex-1">
                    <SalaryBurnChart />
                </div>
            </div>
            
        </div>
    </div>
  );
}
