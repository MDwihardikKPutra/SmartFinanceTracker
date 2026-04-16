'use client';

import React, { useState } from 'react';
import { 
    Search, 
    MoreHorizontal,
    TrendingUp,
    TrendingDown,
    Plus,
    X,
    Trash2,
    Save
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_CONFIG, CATEGORIES } from '@/lib/constants';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = [
    'Semua', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function TransactionsPage() {
  const now = new Date();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [filterMonth, setFilterMonth] = useState<string>((now.getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState<string>(now.getFullYear().toString());
  
  // CRUD States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Makanan & Minuman',
    createdAt: new Date().toISOString().split('T')[0]
  });

  const transactions = useLiveQuery(() => 
    db.transactions.orderBy('createdAt').reverse().toArray()
  ) || [];

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.createdAt);
    const matchesSearch = (t.description || '').toLowerCase().includes(search.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesMonth = filterMonth === 'all' || (d.getMonth() + 1).toString() === filterMonth;
    const matchesYear = filterYear === 'all' || d.getFullYear().toString() === filterYear;
    
    return matchesSearch && matchesType && matchesMonth && matchesYear;
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Makanan & Minuman',
        createdAt: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setFormData({
        description: t.description,
        amount: t.amount.toString(),
        type: t.type,
        category: t.category,
        createdAt: new Date(t.createdAt).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
        ...formData,
        amount: Number(formData.amount),
        createdAt: new Date(formData.createdAt),
        status: 'paid' as const,
        rawInput: 'manual',
        aiConfidence: 1
    };

    if (editingId) {
        // @ts-ignore - update types in dexie can be tricky with partials
        await db.transactions.update(editingId, data);
    } else {
        await db.transactions.add(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (editingId && window.confirm("Hapus transaksi ini?")) {
        await db.transactions.delete(editingId);
        setIsModalOpen(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-700 pt-3 pb-6 overflow-hidden relative">
      <div className="flex-1 min-h-0 bg-white p-6 rounded-[1.5rem] border border-neutral-100 flex flex-col overflow-hidden relative">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-4 mb-8 ml-1">
            <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-semibold text-black tracking-tight leading-none mb-2">Riwayat Transaksi</h1>
                <p className="text-black/50 text-[10px] sm:text-[11px] font-medium tracking-tight">Monitoring dan manajemen seluruh aliran dana operasional.</p>
            </div>
            <button onClick={openAddModal} className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-black text-white rounded-xl text-[11px] font-bold tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-neutral-100">
                <Plus className="w-4 h-4" />
                Tambah Transaksi
            </button>
        </div>
        {/* Executive Command Bar - Compact & Non-Wrapping */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-6 shrink-0 ml-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-neutral-50 border border-neutral-100 rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
                {/* Type Toggles - Scrollable */}
                <div className="flex items-center h-10 px-1 shrink-0 overflow-x-auto hide-scrollbar">
                    {(['all', 'income', 'expense'] as const).map((mode) => (
                        <button 
                            key={mode} 
                            onClick={() => setTypeFilter(mode)} 
                            className={cn(
                                "h-8 px-4 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-widest", 
                                typeFilter === mode 
                                    ? "bg-white text-black border border-neutral-100 shadow-sm" 
                                    : "text-black/40 hover:text-black/60"
                            )}
                        >
                            {mode === 'all' ? 'Semua' : mode === 'income' ? 'Masuk' : 'Keluar'}
                        </button>
                    ))}
                </div>

                {/* Date Selection */}
                <div className="flex items-center h-10 px-2 min-w-0">
                    <select 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="bg-transparent text-[10px] font-bold text-black px-3 h-full outline-none cursor-pointer hover:text-indigo-600 transition-colors uppercase tracking-widest min-w-[80px]"
                    >
                        {MONTHS.map((m, i) => <option key={m} value={i === 0 ? 'all' : i.toString()}>{m}</option>)}
                    </select>
                    
                    <div className="w-px h-3 bg-neutral-200 mx-1" />
                    
                    <select 
                        value={filterYear} 
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="bg-transparent text-[10px] font-bold text-black px-3 h-full outline-none cursor-pointer hover:text-indigo-600 transition-colors uppercase tracking-widest min-w-[70px]"
                    >
                        <option value="all">TAHUN</option>
                        {[2024, 2025, 2026].map(y => <option key={y} value={y.toString()}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Symmetrical Search Group */}
            <div className="relative group w-full xl:w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 group-focus-within:text-black transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search query..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="pl-11 pr-4 h-10 bg-neutral-50 border border-neutral-100 rounded-xl text-[11px] font-bold w-full focus:outline-none focus:border-black focus:bg-white transition-all outline-none" 
                />
            </div>
        </div>

        {/* Unified Ledger - RESPONSIVE SCROLL */}
        <div className="flex-1 overflow-x-auto overflow-y-auto pr-1 custom-scrollbar min-h-0 border-t border-neutral-50 select-none">
          <div className="w-full min-w-[700px]">
             <div className="flex items-center px-4 py-4 border-b border-neutral-50 sticky top-0 bg-white z-10 space-x-4">
              <div className="w-32 text-[10px] font-semibold text-black/40 tracking-tight text-center">Tanggal</div>
              <div className="flex-1 text-[10px] font-semibold text-black/40 tracking-tight">Deskripsi</div>
              <div className="w-32 text-[10px] font-semibold text-black/40 tracking-tight">Kategori</div>
              <div className="w-24 text-[10px] font-semibold text-black/40 tracking-tight">Tipe</div>
              <div className="w-40 text-[10px] font-semibold text-black/40 tracking-tight text-right">Jumlah</div>
              <div className="w-10"></div>
            </div>

            <div className="divide-y divide-neutral-50">
              {filteredTransactions.length === 0 ? (
                <div className="py-24 flex flex-col items-center">
                    <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center mb-4"><Search className="w-5 h-5 text-black/20" /></div>
                    <p className="text-black/30 text-[12px] font-semibold">Tidak ada transaksi ditemukan</p>
                </div>
              ) : (
                filteredTransactions.map((t, idx) => {
                  const cat = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.default;
                  const Icon = cat.icon;
                  return (
                    <div key={t.id || idx} onClick={() => openEditModal(t)} className="flex items-center px-4 py-4 hover:bg-neutral-50/50 transition-colors group cursor-pointer space-x-4">
                      <div className="w-32 text-[11px] font-semibold text-black/40 text-center">{formatDate(t.createdAt)}</div>
                      <div className="flex-1 flex items-center gap-3">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border border-neutral-100 shrink-0", cat.bg)}>
                              <Icon className={cn("w-4 h-4", cat.color)} />
                          </div>
                          <p className="text-[12px] font-semibold text-black truncate max-w-xs">{t.description || t.category}</p>
                      </div>
                      <div className="w-32 flex">
                          <span className="px-2.5 py-1 bg-neutral-50 border border-neutral-100 text-black/60 rounded-lg text-[9px] font-semibold tracking-tight">{t.category}</span>
                      </div>
                      <div className="w-24">
                          <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-semibold", t.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-neutral-50 text-black/60 border border-neutral-100')}>
                              {t.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {t.type === 'income' ? 'Masuk' : 'Keluar'}
                          </div>
                      </div>
                      <div className={cn("w-40 text-right text-[13px] font-semibold tracking-tight", t.type === 'income' ? 'text-emerald-600' : 'text-black')}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount).replace('Rp ', '')}
                      </div>
                      <div className="w-10 text-right">
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-black/20 group-hover:text-black hover:bg-white transition-all">
                              <MoreHorizontal className="w-4 h-4" />
                          </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-[480px] bg-white rounded-[1.5rem] border border-neutral-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-semibold text-black tracking-tight">{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
                            <p className="text-[10px] text-black/50 font-medium mt-1 uppercase tracking-widest leading-none">Your Command Operational</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-50"><X className="w-5 h-5 text-black/30" /></button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-50 border border-neutral-100 rounded-xl">
                            {(['income', 'expense'] as const).map((type) => (
                                <button key={type} type="button" onClick={() => setFormData({...formData, type})} className={cn("py-2.5 rounded-xl text-[11px] font-bold tracking-tight transition-all", formData.type === type ? "bg-white text-black border border-neutral-100 shadow-none" : "text-black/40 hover:text-black/60")}>
                                    {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-black/40 ml-1">Jumlah (Rp)</label>
                                <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-5 py-3 text-[12px] font-semibold focus:outline-none focus:border-black transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-black/40 ml-1">Tanggal</label>
                                <input type="date" required value={formData.createdAt} onChange={(e) => setFormData({...formData, createdAt: e.target.value})} className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-5 py-3 text-[12px] font-semibold focus:outline-none focus:border-black transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-black/40 ml-1">Deskripsi</label>
                            <input type="text" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-5 py-3 text-[12px] font-semibold focus:outline-none focus:border-black transition-all" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-black/40 ml-1">Kategori</label>
                            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-5 py-3 text-[12px] font-semibold focus:outline-none focus:border-black transition-all appearance-none">
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                            {editingId && (
                                <button type="button" onClick={handleDelete} className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>
                            )}
                            <button type="submit" className="flex-1 h-12 bg-black text-white rounded-xl text-[12px] font-bold tracking-tight hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" />
                                {editingId ? 'Simpan Perubahan' : 'Tambah Transaksi'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
