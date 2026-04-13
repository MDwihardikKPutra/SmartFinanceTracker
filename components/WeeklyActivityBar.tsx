'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WeeklyActivityBarProps {
    data: { category: string; amount: number }[];
}

const WeeklyActivityBar: React.FC<WeeklyActivityBarProps> = ({ data }) => {
    // Cari nilai tertinggi untuk perbandingan persentase
    const maxAmount = Math.max(...data.map(d => d.amount), 1);

    return (
        <div className="w-full space-y-5 mt-4">
            {data.map((item, index) => {
                const percentage = (item.amount / maxAmount) * 100;
                
                return (
                    <div key={index} className="space-y-1.5 group">
                        <div className="flex justify-between items-end px-0.5">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                                {item.category}
                            </span>
                            <span className="text-[11px] font-black text-neutral-900 tracking-tight">
                                Rp {item.amount.toLocaleString('id-ID')}
                            </span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-neutral-50 rounded-full overflow-hidden border border-neutral-100/50">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                            />
                        </div>
                    </div>
                );
            })}
            
            {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 opacity-30">
                    <div className="w-12 h-1 bg-neutral-100 rounded-full mb-2" />
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Belum ada pengeluaran minggu ini</p>
                </div>
            )}
        </div>
    );
};

export default WeeklyActivityBar;
