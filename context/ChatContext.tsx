'use client';

import React, { createContext, useContext, useState } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  toggleChat: () => void;
  aiResult: any;
  setAiResult: (result: any) => void;
}
 
const ChatContext = createContext<ChatContextType | undefined>(undefined);
 
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
 
  const toggleChat = () => setIsChatOpen(!isChatOpen);
 
  return (
    <ChatContext.Provider value={{ 
      isChatOpen, 
      setIsChatOpen, 
      toggleChat,
      aiResult,
      setAiResult
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
