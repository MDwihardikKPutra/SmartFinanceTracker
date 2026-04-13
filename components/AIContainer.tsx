'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import AIInputBar from './AIInputBar';
import ConfirmationCard from './ConfirmationCard';

export default function AIContainer() {
  const pathname = usePathname();
  const [aiResult, setAiResult] = useState<any>(null);

  if (pathname === '/login' || pathname === '/transactions') return null;

  const handleAIResult = (data: any) => {
    setAiResult(data);
  };

  const handleSaved = () => {
    setAiResult(null);
    // Optional: Global toast or sound effect could be added here
  };

  return (
    <>
      <AIInputBar onResult={handleAIResult} />
      
      <AnimatePresence>
        {aiResult && (
          <ConfirmationCard 
            data={aiResult} 
            onClose={() => setAiResult(null)} 
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </>
  );
}
