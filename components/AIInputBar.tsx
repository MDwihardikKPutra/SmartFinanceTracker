'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const placeholders = [
  "Bayar kos bulan April 1.5jt",
  "Terima gaji 12 juta",
  "Makan siang di warteg 25rb",
  "Beli bensin pertamax 60k",
  "Nonton bioskop 55rb"
];

interface AIInputBarProps {
    onResult: (data: any) => void;
}

export default function AIInputBar({ onResult }: AIInputBarProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || input.length < 3 || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse-txn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      if (response.ok) {
        onResult({ ...data, rawInput: input });
        setInput('');
      } else {
        // Show the specific detail if provided by the server
        setError(data.details || data.error || "Gagal menganalisis input");
      }
    } catch (err: any) {
      setError(err?.message || "Koneksi internet bermasalah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <AnimatePresence>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="mb-4 px-6 py-4 bg-red-50/90 backdrop-blur-xl border border-red-100 rounded-3xl flex items-center gap-3 text-red-600 shadow-2xl shadow-red-500/10"
                >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium tracking-tight">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto p-1.5 hover:bg-red-100 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.form 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleSubmit}
          className={cn(
            "relative bg-white/90 backdrop-blur-3xl rounded-[2.5rem] border p-2 flex items-center gap-1 transition-all duration-500",
            isLoading ? "border-indigo-500 pr-2" : "border-neutral-200"
          )}
        >
          <div className="pl-5 pr-2">
            {isLoading ? <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /> : <Sparkles className="w-6 h-6 text-indigo-500" />}
          </div>
          
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "AI sedang berfikir..." : `Tulis: "${placeholders[placeholderIndex]}"`}
            className="flex-1 bg-transparent border-none outline-none py-4 text-neutral-900 placeholder:text-neutral-400 font-medium text-lg tracking-tight"
          />

          <button 
            type="submit"
            disabled={!input.trim() || input.length < 3 || isLoading}
            className={cn(
                "w-14 h-14 rounded-[1.75rem] flex items-center justify-center transition-all duration-300",
                input.trim().length >= 3 && !isLoading
                    ? "bg-neutral-900 text-white shadow-xl shadow-black/10 hover:scale-105"
                    : "bg-neutral-100/50 text-neutral-300"
            )}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
