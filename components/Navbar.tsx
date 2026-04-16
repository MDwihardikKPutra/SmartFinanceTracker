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
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-neutral-100 z-50 flex items-center justify-between px-4 md:px-10 lg:px-12">
      {/* Branding */}
      <div className="flex items-center gap-4 w-fit md:w-[180px] shrink-0">
         <h1 className="text-[12px] sm:text-[13px] tracking-widest font-bold font-montserrat text-black whitespace-nowrap">
            SMART<span className="hidden sm:inline font-normal opacity-70 ml-1">FINANCE</span>
         </h1>
      </div>
 
       {/* Navigation Links */}
       <div className="flex items-center gap-1 sm:gap-2 bg-neutral-50 p-1 rounded-lg sm:p-1.5 sm:rounded-xl border border-neutral-100 mx-2 overflow-hidden">
         {NAV_ITEMS.map((item) => {
           const Icon = item.icon;
           const isActive = pathname === item.href;
           return (
             <Link
               key={item.href}
               href={item.href}
               className={cn(
                 "flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold transition-all duration-300 whitespace-nowrap",
                 isActive 
                   ? "bg-white text-black shadow-sm border border-neutral-100" 
                   : "text-black/40 hover:text-black hover:bg-white/50"
               )}
             >
               <Icon className={cn("w-3.5 h-3.5 sm:w-4", isActive ? "text-indigo-600" : "text-black/40")} />
               <span className="hidden xs:inline uppercase tracking-widest">{item.name}</span>
             </Link>
           );
         })}
       </div>
 
       {/* Action Section */}
       <div className="flex items-center gap-2 sm:gap-4 shrink-0">
         <button 
           onClick={toggleChat}
           className={cn(
             "p-2 sm:px-4 sm:py-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 group whitespace-nowrap",
             isChatOpen 
               ? "bg-black border-black text-white" 
               : "bg-white border-neutral-100 text-black hover:border-black hover:bg-neutral-50"
           )}
           title="AI Commander"
         >
             <Sparkles className={cn("w-4 h-4 transition-transform duration-500", isChatOpen ? "rotate-12" : "group-hover:rotate-12")} />
             <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase">AI Command</span>
         </button>

        <div className="hidden sm:block h-10 w-px bg-neutral-100 mx-1" />
        
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block text-right">
                <p className="text-[11px] font-bold text-black leading-none">Warren Buffet</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-100 rounded-full border-2 border-white overflow-hidden shrink-0">
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 h-5 text-neutral-400" />
                </div>
            </div>
        </div>

        <button 
          onClick={() => router.push('/login')}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl border border-neutral-100 text-neutral-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all duration-300"
          title="Log Out"
        >
            <LogOut className="w-3.5 h-3.5 sm:w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
