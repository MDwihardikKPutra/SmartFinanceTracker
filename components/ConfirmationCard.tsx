'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle, Info, Tag, ChevronDown, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

const categories = [
  'Gaji', 'Freelance', 'Transfer Masuk', 'Makanan & Minuman', 
  'Transportasi', 'Tempat Tinggal', 'Belanja', 'Kesehatan', 
  'Hiburan', 'Tagihan', 'Pendidikan', 'Lainnya'
];

interface ConfirmationCardProps {
  data: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function ConfirmationCard({ data, onClose, onSaved }: ConfirmationCardProps) {
  const [formData, setFormData] = useState({
    amount: data.amount || 0,
    type: data.type || 'expense',
    category: data.category || 'Lainnya',
    description: data.description || '',
    rawInput: data.rawInput || '',
    aiConfidence: data.confidence || 0
  });

  const handleSave = async () => {
    try {
      await db.transactions.add({
        ...formData,
        status: 'paid',
        createdAt: new Date(),
      });
      onSaved();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const isLowConfidence = formData.aiConfidence < 0.75;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-neutral-900/40">
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="w-full max-w-xl bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden relative max-h-[90vh] flex flex-col"
      >
        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-neutral-900" />
                </div>
                <h3 className="text-2xl font-medium text-neutral-900 tracking-tight">Konfirmasi Transaksi</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-neutral-50 rounded-full transition-colors border border-transparent hover:border-neutral-100">
              <X className="w-6 h-6 text-neutral-400" />
            </button>
          </div>
 
          {isLowConfidence && (
            <div className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4 text-amber-700">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold uppercase tracking-widest text-[10px] mb-1">Perhatian</p>
                <p className="font-medium leading-relaxed">AI kurang yakin dengan data ini. Mohon periksa kembali.</p>
              </div>
            </div>
          )}
 
          <div className="space-y-8">
            {/* Amount & Type */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest ml-1">Nominal</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-medium text-neutral-400 text-lg">Rp</span>
                  <input 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-5 pl-14 pr-4 text-3xl font-medium text-neutral-900 outline-none focus:bg-white focus:border-neutral-900 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest ml-1">Jenis</label>
                <div className="flex bg-neutral-50 border border-neutral-100 p-1.5 rounded-2xl">
                  <button 
                    onClick={() => setFormData({...formData, type: 'income'})}
                    className={cn(
                        "px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all",
                        formData.type === 'income' ? "bg-white border border-neutral-200 text-neutral-900" : "text-neutral-400"
                    )}
                  >Masuk</button>
                  <button 
                    onClick={() => setFormData({...formData, type: 'expense'})}
                    className={cn(
                        "px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all",
                        formData.type === 'expense' ? "bg-white border border-neutral-200 text-neutral-900" : "text-neutral-400"
                    )}
                  >Keluar</button>
                </div>
              </div>
            </div>
 
            {/* Category */}
            <div className="space-y-3">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest ml-1">Kategori</label>
              <div className="relative group">
                <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-5 pl-14 pr-12 appearance-none outline-none focus:bg-white focus:border-neutral-900 font-medium text-neutral-900 transition-all"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
 
            {/* Description */}
            <div className="space-y-3">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest ml-1">Keterangan</label>
              <div className="relative">
                <Info className="absolute left-5 top-5 w-5 h-5 text-neutral-400" />
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-5 pl-14 pr-4 outline-none focus:bg-white focus:border-neutral-900 font-medium text-neutral-900 resize-none transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>
 
          <div className="grid grid-cols-2 gap-4 mt-12 pb-2">
            <button 
                onClick={onClose}
                className="py-5 rounded-2xl border border-neutral-100 text-neutral-400 font-semibold uppercase tracking-widest hover:bg-neutral-50 transition-all text-[10px]"
            >
                Batalkan
            </button>
            <button 
                onClick={handleSave}
                className="py-5 bg-neutral-900 text-white rounded-2xl font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 text-[10px]"
            >
                <Check className="w-5 h-5" />
                Simpan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
