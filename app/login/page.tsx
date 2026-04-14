'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Apple, Sparkles } from 'lucide-react';
import { seedDemoData } from '@/lib/demoData';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
    
    const demoEmail = 'warren@buffet.com';
    const demoPassword = 'demo1234';
    
    setEmail('');
    setPassword('');

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
    <div className="min-h-screen bg-[#F4F4F6] flex items-center justify-center p-4 md:p-8 selection:bg-indigo-100">
      
      {/* MAIN COMPACT CARD - 75% Ratio & Dense Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[1.5rem] p-3 flex flex-col lg:flex-row h-full lg:h-[680px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-neutral-100 overflow-hidden"
      >
        
        {/* LEFT COLUMN: AUTH FORM */}
        <div className="flex-1 flex flex-col p-8 md:p-12 lg:p-14 justify-center bg-white relative">
            
            {/* Branding - matching Navbar */}
            <div className="mb-6 lg:mb-8">
                 <h1 className="text-[12px] tracking-tight font-montserrat text-black">
                    <span className="font-bold">SMART</span>
                    <span className="font-normal opacity-60">FINANCE</span>
                 </h1>
            </div>

            <div className="mb-6">
                <h2 className="text-[26px] font-semibold text-black tracking-tighter leading-tight">Welcome Back</h2>
                <p className="text-neutral-400 mt-1.5 font-medium text-[13px]">Securely manage your financial future with precision intelligence.</p>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
                <button className="flex items-center justify-center gap-2 py-3 px-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-all font-medium text-[12px] text-black whitespace-nowrap">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-all font-medium text-[12px] text-black whitespace-nowrap">
                    <svg viewBox="0 0 384 512" className="w-3.5 h-3.5 fill-black">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c31.1-34.5 28.1-70.2 28.1-70.2s-28.7-1.1-61.1 33c-23.7 24.9-20.9 59.5-20.9 59.5s23.4 12.3 53.9-22.3z"/>
                    </svg>
                    Continue with Apple
                </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-50" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold text-neutral-300">
                    <span className="bg-white px-5">Or</span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-neutral-400 ml-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 group-focus-within:text-black transition-colors" />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="rownok@gmail.com"
                            className="w-full bg-neutral-50/50 border border-transparent rounded-xl py-3 pl-11 pr-4 outline-none focus:bg-neutral-50 focus:border-neutral-100 transition-all text-black font-medium text-[12px]"
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-neutral-400 ml-1 uppercase tracking-wider">Security Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 group-focus-within:text-black transition-colors" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-neutral-50/50 border border-transparent rounded-xl py-3 pl-11 pr-11 outline-none focus:bg-neutral-50 focus:border-neutral-100 transition-all text-black font-medium text-[12px]"
                            required
                            autoComplete="current-password"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-black transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-neutral-200 text-indigo-600 focus:ring-indigo-500" />
                        <label className="text-[11px] font-medium text-black">Keep me signed in</label>
                    </div>
                    <button type="button" className="text-[11px] font-semibold text-black hover:underline underline-offset-4">Forgot access?</button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button 
                        type="submit"
                        disabled={isDemoLoading || isLoading}
                        className="bg-[#3D2335] hover:bg-[#2F1B29] text-white font-semibold py-3 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-[12px]"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                    </button>

                    <button 
                        type="button"
                        onClick={handleDemo}
                        disabled={isDemoLoading || isLoading}
                        className="bg-white border border-neutral-100 hover:bg-neutral-50 text-black font-semibold py-3 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-[12px]"
                    >
                        {isDemoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                        <span>{isDemoLoading ? "Processing..." : "Try Demo"}</span>
                    </button>
                </div>
            </form>

            {/* Signup footer */}
            <div className="mt-8 text-center border-t border-neutral-50 pt-6">
                 <p className="text-[12px] font-medium text-neutral-400">
                    New to SmartFinance? 
                    <button onClick={handleDemo} disabled={isDemoLoading} className="ml-1 text-indigo-600 font-semibold hover:underline underline-offset-4 disabled:opacity-50">
                        Create Account
                    </button>
                 </p>
            </div>

        </div>

        {/* RIGHT COLUMN: VISUAL PILLAR - Sharpened & Fitted */}
        <div className="hidden lg:block flex-1 relative p-1.5">
             <div className="w-full h-full rounded-[1.25rem] overflow-hidden relative group">
                <Image 
                    src="/loginpic.jpg" 
                    alt="Financial District" 
                    fill 
                    className="object-cover transition-transform duration-[10s] group-hover:scale-105"
                />
             </div>
        </div>

      </motion.div>
    </div>
  );
}
