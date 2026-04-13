'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShoppingBag, 
  Utensils, 
  Car, 
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CashflowChart from '@/components/CashflowChart';
import SalaryBurnChart from '@/components/SalaryBurnChart';
import MiniSparkline from '@/components/MiniSparkline';
import BudgetHealthGauge from '@/components/BudgetHealthGauge';
import WeeklyActivityBar from '@/components/WeeklyActivityBar';
import AIChatSidebar from '@/components/AIChatSidebar';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, isSameMonth, subMonths, subDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { seedDummyData } from '@/lib/seedData';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const transactions = useLiveQuery(() => db.transactions.orderBy('createdAt').reverse().toArray()) || [];

  useEffect(() => {
    seedDummyData();
  }, []);
  
  // Date markers
  const now = new Date();
  const lastMonth = subMonths(now, 1);

  // Stats Calculation - All Time
  const balance = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) - 
                  transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  // Stats Calculation - Current Month vs Last Month
  const getMonthlyTotal = (type: 'income' | 'expense', date: Date) => 
    transactions.filter(t => t.type === type && isSameMonth(new Date(t.createdAt), date))
                .reduce((acc, t) => acc + t.amount, 0);

  const thisMonthIncome = getMonthlyTotal('income', now);
  const thisMonthExpense = getMonthlyTotal('expense', now);
  const lastMonthIncome = getMonthlyTotal('income', lastMonth);
  const lastMonthExpense = getMonthlyTotal('expense', lastMonth);

  const incomeChange = lastMonthIncome === 0 ? 0 : Math.round(((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100);
  const expenseChange = lastMonthExpense === 0 ? 0 : Math.round(((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100);

  // Generate 7-Day Micro-Trends for Sparklines
  const sparklineData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
    
    return {
      balance: days.map(d => ({
        value: transactions.filter(t => new Date(t.createdAt) <= d)
                          .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
      })),
      income: days.map(d => ({
        value: transactions.filter(t => t.type === 'income' && isSameDay(new Date(t.createdAt), d))
                          .reduce((acc, t) => acc + t.amount, 0)
      })),
      expense: days.map(d => ({
        value: transactions.filter(t => t.type === 'expense' && isSameDay(new Date(t.createdAt), d))
                          .reduce((acc, t) => acc + t.amount, 0)
      }))
    };
  }, [transactions]);

  // Weekly Bar Chart Data
  const weeklyActivity = useMemo(() => {
    const last7Days = transactions.filter(t => new Date(t.createdAt) >= subDays(now, 7) && t.type === 'expense');
    
    const categoryMap: Record<string, number> = {};
    last7Days.forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryMap)
        .map(([name, value]) => ({ 
            category: name, 
            amount: value 
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Ambil 5 teratas biar tetap padat (high-density)
  }, [transactions]);

  const getCategoryIcon = (category: string) => {
    switch(category) {
        case 'Makanan & Minuman': return Utensils;
        case 'Transportasi': return Car;
        case 'Tagihan': return Zap;
        case 'Belanja': return ShoppingBag;
        default: return Wallet;
    }
  };


  // Dynamic AI Insight State
  const [aiInsight, setAiInsight] = useState<{title: string, desc: string, type: 'info' | 'success' | 'danger' | 'warning', icon: any} | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Fetch true AI Insights (No Hardcoding)
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
          // Dynamic sentiment detection based on transaction balance
          const isOverspending = thisMonthExpense > thisMonthIncome;
          setAiInsight({
            title: isOverspending ? 'Saran Mentor' : 'Kabar Baik',
            desc: data.insight,
            type: isOverspending ? 'danger' : 'success',
            icon: isOverspending ? AlertTriangle : Sparkles
          });
        } else if (data.error && data.error.includes("Quota")) {
           setAiInsight({
             title: 'AI Sedang Istirahat',
             desc: 'Batas kuota harian tercapai. AI akan kembali dalam beberapa menit untuk memberikan wawasan tajam.',
             type: 'warning',
             icon: Zap
           });
        }
      } catch (e) {
        console.error("AI Insight failed", e);
      } finally {
        setIsLoadingInsight(false);
      }
    }

    fetchAIInsight();
  }, [transactions.length]); // Re-analyze when new data arrives

  return (
    <div className="flex w-full h-full overflow-hidden bg-white">
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 transition-all duration-500">
        
        <div className="w-full px-6 md:px-8 pt-4 flex flex-col pb-2 h-full">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center gap-1 mb-1 shrink-0"
            >
                <h1 className="text-2xl font-medium text-neutral-900 tracking-tight">Financial Overview</h1>
                <p className="text-neutral-400 text-xs font-medium">Bulan {format(now, 'MMMM', { locale: id })} • <span className="text-red-500 font-bold uppercase tracking-tighter">Demo Mode</span></p>
            </motion.div>

            {/* Stats Cards - Micro Sparklines Integration */}
            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 shrink-0"
            >
                {[
                { icon: Wallet, label: 'Balance', value: balance, color: 'blue', sparkData: sparklineData.balance, hex: '#818cf8' },
                { icon: TrendingUp, label: `Income ${format(new Date(), 'MMM', { locale: id })}`, value: thisMonthIncome, color: 'green', change: incomeChange, sparkData: sparklineData.income, hex: '#10b981' },
                { icon: TrendingDown, label: `Expense ${format(new Date(), 'MMM', { locale: id })}`, value: thisMonthExpense, color: 'red', change: expenseChange, sparkData: sparklineData.expense, hex: '#ef4444' },
                ].map((stat, i) => (
                <motion.div 
                    key={i}
                    variants={item}
                    className="group relative bg-white p-5 rounded-[2rem] border border-neutral-100 flex flex-col justify-between h-32 transition-all duration-300 overflow-hidden hover:border-neutral-200 active:scale-[0.98]"
                >
                    <div className="flex justify-between items-start relative z-10">
                        <div className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-50",
                            stat.color === 'blue' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : stat.color === 'green' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                        )}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        {stat.change !== undefined && (
                            <div className={cn(
                                "px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-tight shrink-0 flex items-center gap-1",
                                stat.change >= 0 
                                ? (stat.color === 'red' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")
                                : (stat.color === 'red' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")
                            )}>
                                {stat.change > 0 ? '↑' : '↓'}{Math.abs(stat.change)}%
                            </div>
                        )}
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-neutral-900 tracking-tighter truncate">
                            Rp {stat.value.toLocaleString('id-ID')}
                        </h3>
                    </div>
                </motion.div>
                ))}
            </motion.div>

            {/* Main Content Grid - High Density Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 pb-2">
                {/* Left Side: Professional Analytics (7 Columns) */}
                <motion.div 
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-7 bg-white p-6 rounded-[2rem] border border-neutral-100 flex flex-col flex-1 min-h-[620px] overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-none mb-2">Performance Analytics</h3>
                            <p className="text-2xl font-bold text-neutral-900 tracking-tighter">Finance Flow</p>
                        </div>
                        <div className="flex items-center gap-4 bg-neutral-50 p-2 rounded-2xl">
                            <div className="flex items-center gap-1.5 px-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="text-[9px] font-medium text-neutral-500 uppercase tracking-tighter">History</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <CashflowChart />
                        <SalaryBurnChart />
                    </div>
                </motion.div>
                
                {/* Right Side: Coach & Activity (5 Columns) */}
                <div className="lg:col-span-5 flex flex-col gap-4 h-full min-h-0">
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white p-5 rounded-[2rem] border border-neutral-100 h-[160px] flex flex-col group hover:border-neutral-200 active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Money Coach</h3>
                                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                            </div>
                            
                            <div className="flex-1 flex items-center">
                              {isLoadingInsight ? (
                                  <div className="w-full h-full flex items-center gap-4 animate-pulse">
                                      <div className="w-12 h-12 rounded-2xl bg-neutral-50 shrink-0" />
                                      <div className="flex-1 space-y-2">
                                          <div className="h-2.5 bg-neutral-50 rounded-full w-20" />
                                          <div className="h-2 bg-neutral-50 rounded-full w-full" />
                                      </div>
                                  </div>
                              ) : aiInsight ? (
                                  <div className="w-full flex flex-col">
                                      <div className={cn(
                                          "mb-3 p-2 rounded-xl w-fit",
                                          aiInsight.type === 'danger' ? "bg-red-50 text-red-600" : 
                                          aiInsight.type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                      )}>
                                          <aiInsight.icon className="w-5 h-5" />
                                      </div>
                                      <h4 className="text-[11px] font-bold text-neutral-900 leading-tight mb-2 uppercase tracking-wide">{aiInsight.title}</h4>
                                      <p className="text-[11px] text-neutral-500 leading-relaxed font-medium italic">"{aiInsight.desc}"</p>
                                  </div>
                              ) : (
                                  <p className="text-[10px] text-neutral-300 font-medium italic">Analyzing...</p>
                              )}
                            </div>
                        </motion.div>

                        <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="bg-white p-5 rounded-[2rem] border border-neutral-100 h-[160px] flex flex-col items-center justify-between hover:border-neutral-200 active:scale-[0.98] transition-all"
                        >
                            <h3 className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Usage Limit</h3>
                            <BudgetHealthGauge spent={thisMonthExpense} total={thisMonthIncome} />
                        </motion.div>
                    </div>

                    <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-6 rounded-[2rem] border border-neutral-100 flex-1 min-h-0 overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Weekly Trends</h3>
                            <button className="text-[10px] font-medium text-indigo-500 uppercase tracking-widest hover:underline">View All</button>
                        </div>

                        <WeeklyActivityBar data={weeklyActivity} />

                        <div className="space-y-4 overflow-y-auto mt-6 pr-1 custom-scrollbar flex-1">
                            {transactions.slice(0, 4).map((t) => {
                                const Icon = getCategoryIcon(t.category);
                                return (
                                    <div key={t.id} className="flex items-center justify-between p-3.5 bg-neutral-50/50 rounded-[1.25rem] hover:bg-neutral-50 active:scale-[0.99] transition-all group cursor-pointer border border-transparent hover:border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-neutral-100 group-hover:scale-105 transition-transform">
                                                <Icon className="w-4 h-4 text-neutral-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-neutral-900 text-xs truncate w-24 md:w-auto">{t.description || t.category}</p>
                                                <p className="text-[9px] text-neutral-400 font-medium uppercase tracking-tighter">{format(new Date(t.createdAt), 'dd MMM yyyy', { locale: id })}</p>
                                            </div>
                                        </div>
                                        <p className={cn(
                                            "font-semibold tracking-tight text-xs",
                                            t.type === 'income' ? 'text-emerald-600' : 'text-neutral-900'
                                        )}>
                                            {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>

        {/* Floating AI Toggle Button */}
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isChatOpen ? 0 : 1, 
            opacity: isChatOpen ? 0 : 1,
            pointerEvents: isChatOpen ? 'none' : 'auto' 
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-neutral-900 border border-neutral-800 text-white rounded-[2rem] flex items-center justify-center shadow-2xl z-50 group transition-all"
        >
          <Sparkles className="w-6 h-6 text-indigo-400 group-hover:rotate-12 transition-transform" />
        </motion.button>
      </div>

      <AIChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
