'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import AIChatSidebar from "@/components/AIChatSidebar";
import { ChatProvider, useChat } from "@/context/ChatContext";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { isChatOpen, setIsChatOpen } = useChat();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <body className="h-full bg-neutral-50 overflow-hidden">
        {children}
      </body>
    );
  }

  return (
    <body className="h-full overflow-hidden flex flex-col bg-neutral-50 relative">
      <Navbar />
      
      {/* ADAPTIVE VIEWPORT: Uses CSS Grid to squish content elegantly */}
      <div className="flex-1 relative w-full h-full overflow-hidden pt-20">
        
        <motion.div 
            initial={false}
            animate={{ 
                gridTemplateColumns: isChatOpen 
                    ? "1fr 400px" 
                    : "1fr 0px" 
            }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'grid-template-columns' }}
            className="grid h-full w-full overflow-hidden"
        >
            {/* MAIN CONTENT AREA: Resizes automatically (Squishes) */}
            <main className="h-full w-full px-6 md:px-10 lg:px-12 pb-8 overflow-hidden min-w-0">
                {children}
            </main>

            {/* GLOBAL AI SIDEBAR AREA: Accommodates space without shifting content off-screen */}
            <div className={isChatOpen ? "h-full pr-6 md:pr-10 lg:pr-12 pb-8 pt-3 overflow-hidden" : "overflow-hidden"}>
                <div className="h-full w-[400px]">
                    <AIChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                </div>
            </div>
        </motion.div>
      </div>
    </body>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <ShellContent>{children}</ShellContent>
    </ChatProvider>
  );
}
