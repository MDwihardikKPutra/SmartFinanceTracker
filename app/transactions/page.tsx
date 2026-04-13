'use client';

import React, { useState } from 'react';
import { 
    History, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ArrowDownRight, 
    ChevronLeft,
    Utensils,
    Bus,
    Receipt,
    ShoppingBag,
    Wallet,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const categoryIcons: Record<string, any> = {
  'Makanan & Minuman': { icon: Utensils, bg: 'bg-orange-50', text: 'text-orange-500' },
  'Transportasi': { icon: Bus, bg: 'bg-blue-50', text: 'text-blue-500' },
  'Tagihan': { icon: Receipt, bg: 'bg-purple-50', text: 'text-purple-500' },
  'Belanja': { icon: ShoppingBag, bg: 'bg-pink-50', text: 'text-pink-500' },
  'Gaji': { icon: Wallet, bg: 'bg-green-50', text: 'text-green-500' },
  'Freelance': { icon: ArrowUpRight, bg: 'bg-emerald-50', text: 'text-emerald-500' },
  'default': { icon: Wallet, bg: 'bg-neutral-50', text: 'text-neutral-500' }
};

export default function TransactionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const transactions = useLiveQuery(() => 
    db.transactions.orderBy('createdAt').reverse().toArray()
  ) || [];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full flex flex-col animate-in fade-in duration-700">
      {/* Header Area - Ultra Clean */}
      <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Riwayat Transaksi</h1>
            <p className="text-neutral-500 text-sm">Rekapitulasi seluruh aliran kas masuk dan keluar.</p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
        {/* Integrated Filter & Search Bar */}
        <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-50/30">
            <div className="flex items-center gap-1 p-1 bg-neutral-100/50 rounded-xl w-fit">
                {(['all', 'income', 'expense'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setTypeFilter(mode)}
                        className={cn(
                            "px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            typeFilter === mode 
                                ? "bg-white text-blue-600 shadow-sm" 
                                : "text-neutral-400 hover:text-neutral-500"
                        )}
                    >
                        {mode === 'all' ? 'Semua' : mode === 'income' ? 'Masuk' : 'Keluar'}
                    </button>
                ))}
            </div>

            <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text"
                    placeholder="Cari transaksi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-11 pr-6 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium w-full focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
            </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-22rem)] custom-scrollbar border-t border-neutral-100">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
              <tr>
                <th className="px-8 py-5.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-40">Tanggal</th>
                <th className="px-8 py-5.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Deskripsi</th>
                <th className="px-8 py-5.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-32">Kategori</th>
                <th className="px-8 py-5.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-24">Tipe</th>
                <th className="px-8 py-5.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right w-44">Jumlah</th>
                <th className="px-8 py-5.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                        <Search className="w-10 h-10 text-neutral-200 mb-4" />
                        <p className="text-neutral-400 font-medium">Tidak ada transaksi ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-blue-50/30 even:bg-neutral-50/30 transition-colors group">
                    <td className="px-8 py-5.5 text-xs font-medium text-neutral-500">
                        {format(new Date(t.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-8 py-5.5">
                        <p className="text-sm font-medium text-neutral-900 truncate max-w-md">
                            {t.description || '-'}
                        </p>
                    </td>
                    <td className="px-8 py-5.5">
                        <span className="px-3 py-1 bg-neutral-100 text-neutral-500 rounded-full text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">
                            {t.category}
                        </span>
                    </td>
                    <td className="px-8 py-5.5">
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                            t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", t.type === 'income' ? 'bg-green-500' : 'bg-red-500')} />
                            {t.type === 'income' ? 'Masuk' : 'Keluar'}
                        </div>
                    </td>
                    <td className={cn(
                        "px-8 py-5.5 text-right text-sm font-bold font-mono tracking-tight",
                        t.type === 'income' ? 'text-green-600' : 'text-neutral-900'
                    )}>
                        {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-8 py-5.5 text-right">
                        <button className="p-2 rounded-lg text-neutral-300 hover:bg-white hover:text-neutral-500 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
