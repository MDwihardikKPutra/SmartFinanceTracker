'use client';

import React from 'react';
import { Settings, Bell, Shield, Wallet, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="w-full mx-auto px-4 md:px-12 lg:px-16 transition-all duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-medium text-neutral-900 tracking-tight">Pengaturan</h1>
          <p className="text-neutral-500 mt-1">Kelola akun dan preferensi aplikasi Anda.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900">Target Tabungan</h3>
              <p className="text-sm text-neutral-500">Sesuaikan target tabungan harian atau bulanan Anda.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-600">Mata Uang</label>
              <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-primary">
                <option>IDR - Rupiah Indonesia</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-600">Target Saldo Akhir</label>
              <input type="number" defaultValue={10000000} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
            <h3 className="text-lg font-medium text-neutral-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Bahaya
            </h3>
            <button className="flex items-center gap-2 text-red-600 font-semibold hover:bg-red-50 px-6 py-3 rounded-xl transition-colors border border-red-100">
                <Trash2 className="w-5 h-5" />
                Hapus Semua Data (IndexedDB)
            </button>
        </div>
      </div>
    </div>
  );
}
