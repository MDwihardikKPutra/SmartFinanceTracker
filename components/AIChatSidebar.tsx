'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Loader2, Bot, User, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
        role: 'assistant', 
        content: "Halo! Saya SmartFinance GPT. Saya sudah merangkum data riwayat Anda. Silakan tanya apa saja tentang kondisi keuangan Anda!", 
        timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  
  const financialContext = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const recent = transactions.slice(-15).map(t => 
        `- ${format(new Date(t.createdAt), 'dd/MM')}: ${t.type} Rp ${t.amount.toLocaleString()} (${t.category})`
    ).join('\n');

    return `Saldo: Rp ${(income - expense).toLocaleString()}. Transaksi Terakhir:\n${recent}`;
  }, [transactions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
            financialContext 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content, timestamp: new Date() }]);
      }
    } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, koneksi AI sedang sibuk.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
        initial={false}
        animate={{ 
            width: isOpen ? 400 : 0,
            opacity: isOpen ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full border-l border-neutral-100 bg-white flex flex-col overflow-hidden shrink-0"
    >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-neutral-900 leading-none">SmartFinance GPT</h2>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">AI Assistant</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-neutral-50 rounded-xl transition-all active:scale-90">
                <X className="w-5 h-5 text-neutral-400" />
            </button>
        </div>

        {/* Chat Display */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
            {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                        msg.role === 'assistant' ? "bg-indigo-50 border-indigo-100 text-indigo-500" : "bg-neutral-900 border-neutral-800 text-white"
                    )}>
                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={cn("flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
                        <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed",
                            msg.role === 'assistant' ? "bg-neutral-50 border border-neutral-100 text-neutral-800" : "bg-neutral-900 text-white"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-neutral-50 px-4 py-2 rounded-2xl flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-neutral-50 bg-white">
            <form onSubmit={handleSend} className="relative group">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    placeholder="Tanyakan keuangan..."
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl pl-5 pr-12 py-3.5 text-[12px] focus:outline-none focus:border-indigo-500 transition-all font-medium"
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={cn(
                        "absolute right-1.5 top-1.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        input.trim() ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200" : "bg-neutral-100 text-neutral-300"
                    )}
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    </motion.div>
  );
}
