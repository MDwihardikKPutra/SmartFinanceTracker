'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, Mail, Lock, Eye, EyeOff, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { seedDemoData } from '@/lib/demoData';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemo = async () => {
    if (isDemoLoading) return;
    setIsDemoLoading(true);
    
    setEmail('');
    setPassword('');
    
    const demoEmail = 'demo@smartfinance.app';
    const demoPassword = 'demo1234';
    
    for (let i = 0; i <= demoEmail.length; i++) {
      setEmail(demoEmail.slice(0, i));
      await new Promise(r => setTimeout(r, 20));
    }
    
    await new Promise(r => setTimeout(r, 200));
    
    for (let i = 0; i <= demoPassword.length; i++) {
        setPassword(demoPassword.slice(0, i));
        await new Promise(r => setTimeout(r, 25));
    }

    await new Promise(r => setTimeout(r, 500));
    await seedDemoData();
    localStorage.setItem('demo_mode', 'true');
    router.push('/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfe] flex items-center justify-center p-6 relative overflow-hidden">

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full max-w-[440px] bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white p-10 md:p-12 shadow-[0_32px_80px_rgba(0,0,0,0.06)] relative z-10"
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tighter text-neutral-900 leading-none">SmartFinance</h1>
          <p className="text-neutral-400 mt-2 font-medium">Catat keuangan dengan bantuan AI</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:border-primary focus:bg-white transition-all text-neutral-900 font-medium"
                disabled={isDemoLoading || isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 group-focus-within:text-primary transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl py-4.5 pl-14 pr-14 outline-none focus:border-primary focus:bg-white transition-all text-neutral-900 font-medium"
                disabled={isDemoLoading || isLoading}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isDemoLoading || isLoading || email.length < 3}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-4.5 rounded-2xl transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk Sekarang"}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-100" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold text-neutral-300">
            <span className="bg-white px-4">Instant Access</span>
          </div>
        </div>

        {/* Demo Button */}
        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleDemo}
            disabled={isDemoLoading || isLoading}
            className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transform active:scale-[0.98] disabled:opacity-50"
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Demo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white/20" />
                <span>Mulai Coba Demo</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
