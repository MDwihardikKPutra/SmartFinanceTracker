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
        content: "Halo Dyko! Saya siap bantu kelola keuanganmu hari ini. Mau catat transaksi baru atau ada yang mau ditanyakan soal budgetmu?", 
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
        let rawContent = data.content;
        
        // --- ACTION PARSER (RESILIENT) ---
        const actionRegex = /\[\[ACTION:(.*?)\]\]/s;
        const match = rawContent.match(actionRegex);
        
        if (match) {
            try {
                const cleanJson = match[1].replace(/```json|```/g, '').trim();
                const actionData = JSON.parse(cleanJson);
                
                if (actionData.type === 'ADD_TRANSACTION') {
                    const { amount, type, category, description, createdAt } = actionData.payload;
                    
                    // Sanitize amount: remove dots, commas, or currencies that might cause parsing failure
                    const cleanAmount = String(amount).replace(/[.,]/g, '').replace(/[^0-9]/g, '');
                    const parsedAmount = Number(cleanAmount);
                    
                    const validTypes = ['income', 'expense'];
                    const finalType = validTypes.includes(type) ? type : 'expense';

                    if (!isNaN(parsedAmount) && parsedAmount > 0) {
                        await db.transactions.add({
                            amount: parsedAmount,
                            type: finalType,
                            category: category || "Lainnya",
                            description: description || "AI Transaction",
                            createdAt: createdAt || new Date().toISOString()
                        });
                        console.log("✅ SmartFinance: Transaction added with precision.", { parsedAmount, finalType, createdAt });
                    }
                }
            } catch (err) {
                console.error("❌ SmartFinance: Action Parse Error:", err);
            }
            rawContent = rawContent.replace(actionRegex, '').trim();
        }
        // --- END ACTION PARSER ---

        setMessages(prev => [...prev, { role: 'assistant', content: rawContent, timestamp: new Date() }]);
      }
    } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, koneksi AI sedang sibuk.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden shrink-0 rounded-[1.5rem] border border-neutral-100 shadow-sm">
        {/* Header - Aligned with Dashboard Padding (80px) */}
        <div className="h-20 px-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                    <Sparkles className="w-4 h-4" />
                </div>
                <div>
                    <h2 className="text-[13px] font-semibold text-black leading-none">Your Command</h2>
                    <p className="text-[8px] font-semibold text-black mt-1">Operational Assistant</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-neutral-50 rounded-xl transition-all active:scale-90">
                <X className="w-5 h-5 text-black" />
            </button>
        </div>

        {/* Chat Display */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
            {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border",
                        msg.role === 'assistant' ? "bg-indigo-50 border-indigo-100 text-indigo-500" : "bg-neutral-900 border-neutral-800 text-white"
                    )}>
                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={cn("flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
                        <div className={cn(
                            "px-4 py-2.5 rounded-xl text-[12px] leading-relaxed",
                            msg.role === 'assistant' ? "bg-neutral-50 border border-neutral-100 text-black font-medium" : "bg-neutral-900 text-white font-medium"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center">
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
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl pl-5 pr-12 py-3.5 text-[12px] focus:outline-none focus:border-indigo-500 transition-all font-medium"
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={cn(
                        "absolute right-1.5 top-1.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        input.trim() ? "bg-indigo-500 text-white" : "bg-neutral-100 text-neutral-300"
                    )}
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    </div>
  );
}
