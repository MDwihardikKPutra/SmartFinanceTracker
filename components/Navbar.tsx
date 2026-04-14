'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, History, Settings, User, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/ChatContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transaksi', href: '/transactions', icon: History },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isChatOpen, toggleChat } = useChat();

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-neutral-100 z-50 flex items-center justify-between px-6 md:px-10 lg:px-12">
      {/* Text-only Brand Branding */}
      <div className="flex items-center gap-4 w-[180px]">
         <h1 className="text-[13px] tracking-tight font-montserrat text-black">
            <span className="font-bold">SMART</span>
            <span className="font-normal opacity-70">FINANCE</span>
         </h1>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-2 bg-neutral-50 p-1.5 rounded-xl border border-neutral-100">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-300",
                isActive 
                  ? "bg-white text-black shadow-sm border border-neutral-100" 
                  : "text-neutral-400 hover:text-black hover:bg-white/50"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-neutral-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Action Section */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-px bg-neutral-100 mx-2" />
        
        <div className="flex items-center gap-3 pl-2">
            <div className="text-right">
                <p className="text-[11px] font-bold text-black leading-none">Warren Buffet</p>
            </div>
            <div className="w-10 h-10 bg-neutral-100 rounded-full border-2 border-white overflow-hidden">
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-neutral-400" />
                </div>
            </div>
        </div>

        <button 
          onClick={() => router.push('/login')}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-100 text-neutral-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all duration-300"
          title="Log Out"
        >
            <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
