'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import AIChatSidebar from "@/components/AIChatSidebar";
import { ChatProvider, useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";

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
      
      {/* ADAPTIVE VIEWPORT: Uses CSS Grid on desktop, Overlay on mobile */}
      <div className="flex-1 relative w-full h-full overflow-hidden pt-20">
        
        <motion.div 
            initial={false}
            animate={{ 
                gridTemplateColumns: isChatOpen 
                    ? (typeof window !== 'undefined' && window.innerWidth >= 1024 ? "1fr 400px" : "1fr 0px")
                    : "1fr 0px" 
            }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'grid-template-columns' }}
            className="grid lg:grid h-full w-full overflow-hidden"
        >
            {/* MAIN CONTENT AREA: Resizes automatically on desktop, full-width on mobile */}
            <main className="h-full w-full px-4 md:px-10 lg:px-12 pb-8 overflow-hidden min-w-0">
                {children}
            </main>

            {/* GLOBAL AI SIDEBAR AREA: Fixed Overlay on Mobile, Integrated Column on Desktop */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                            "h-full z-[60] lg:z-auto overflow-hidden",
                            "fixed inset-y-20 right-0 w-full md:w-[450px] lg:static lg:w-[400px] lg:pr-12 lg:pb-8 lg:pt-3 bg-white/80 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none border-l border-neutral-100 lg:border-none"
                        )}
                    >
                        <div className="h-full w-full p-6 lg:p-0">
                            <AIChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
