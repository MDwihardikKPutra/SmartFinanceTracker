'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Loader2, Bot, User, Camera, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatLogic } from '@/hooks/useChatLogic';

interface AIChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    selectedImage,
    setSelectedImage,
    pendingTxn,
    scrollRef,
    fileInputRef,
    handleFileSelect,
    handleSend,
    formatCurrency
  } = useChatLogic(isOpen);

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden shrink-0 rounded-[1.5rem] border border-neutral-100 shadow-sm relative">
        {/* Header */}
        <div className="h-20 px-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                    <Sparkles className="w-4 h-4" />
                </div>
                <div>
                    <h2 className="text-[13px] font-bold text-black leading-none uppercase tracking-widest">AI COMMANDER</h2>
                    <p className="text-[8px] font-bold text-black/40 mt-1 uppercase tracking-tighter">Operational Intelligence</p>
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
                        "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                        msg.role === 'assistant' ? "bg-white border-neutral-100 text-indigo-500" : "bg-black border-black text-white"
                    )}>
                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={cn("flex flex-col gap-1 max-w-[85%]", msg.role === 'user' ? "items-end" : "items-start")}>
                        <div className={cn(
                            "px-4 py-2.5 rounded-[1.25rem] text-[12px] leading-relaxed shadow-sm whitespace-pre-line",
                            msg.role === 'assistant' ? "bg-neutral-50 border border-neutral-100 text-black font-medium" : "bg-black text-white font-bold"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-xl bg-white border border-neutral-100 text-indigo-500 flex items-center justify-center shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-neutral-50 px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                </div>
            )}
        </div>

        {/* Pending Transaction Indicator */}
        <AnimatePresence>
            {pendingTxn && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-amber-100"
                >
                    <div className="px-6 py-2.5 bg-amber-50/80 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Menunggu Konfirmasi</span>
                        <span className="text-[10px] text-amber-600 ml-auto font-mono">{formatCurrency(pendingTxn.amount)}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-5 border-t border-neutral-50 bg-white">
            {selectedImage && (
                <div className="mb-3 p-2 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 truncate">Nota Siap Diproses</span>
                    </div>
                    <button onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1 hover:bg-neutral-200 rounded-full">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <div className="relative flex-1 group">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder={pendingTxn ? 'Ketik "oke" untuk simpan...' : selectedImage ? "Kirim nota..." : "Tanyakan keuangan..."}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl pl-5 pr-12 py-3.5 text-[12px] focus:outline-none focus:border-black transition-all font-bold placeholder:text-neutral-400"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className={cn("p-1.5 rounded-lg transition-all", selectedImage ? "text-emerald-600 bg-emerald-50" : "text-black/30 hover:text-black")}
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <button 
                    type="submit"
                    disabled={(!input.trim() && !selectedImage) || isLoading}
                    className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-neutral-100",
                        (input.trim() || selectedImage) ? "bg-black text-white" : "bg-neutral-100 text-neutral-300"
                    )}
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    </div>
  );
}
