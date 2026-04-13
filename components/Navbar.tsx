'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, LayoutDashboard, History, Settings, Bell, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transaksi', href: '/transactions', icon: History },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/login') return null;

  return (
    <nav 
      className={cn(
        "fixed top-4 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "px-4 md:px-12" : "px-4 md:px-8"
      )}
    >
      <div className={cn(
        "w-full mx-auto px-4 md:px-12 lg:px-16 flex items-center justify-between transition-all duration-500",
        "bg-transparent",
        isScrolled ? "p-2" : "p-4"
      )}>
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group ml-2">
          <span className="text-2xl font-bold tracking-tighter text-neutral-900 leading-none">SmartFinance</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-100/40 border border-neutral-100/50">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[15px] font-bold tracking-tight transition-all",
                  isActive 
                    ? "bg-white text-primary shadow-sm shadow-black/5" 
                    : "text-neutral-400 hover:text-neutral-900 hover:bg-white/50"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5", isActive ? "text-primary" : "text-neutral-300")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 mr-2">
          <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-neutral-100/50 text-neutral-400 hover:bg-neutral-100 transition-colors">
            <Bell className="w-5.5 h-5.5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          
          <div className="w-px h-6 bg-neutral-200 mx-1 hidden sm:block" />
          
          <Link 
            href="/login"
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-neutral-100/50 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5.5 h-5.5" />
          </Link>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-neutral-900 text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-xl border border-white rounded-[2rem] p-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex flex-col gap-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold tracking-tight transition-all",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-neutral-500 hover:bg-neutral-50"
                    )}
                  >
                    <Icon className={cn("w-6 h-6", isActive ? "text-white" : "text-neutral-300")} />
                    {item.name}
                  </Link>
                );
              })}
           </div>
        </div>
      )}
    </nav>
  );
}
