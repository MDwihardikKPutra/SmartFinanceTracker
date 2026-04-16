import { useState, useMemo, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TransactionService } from '@/lib/services/transactionService';
import { format } from 'date-fns';
import type { Transaction } from '@/types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PendingTransaction {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  confidence: number;
}

const CONFIRM_WORDS = ['oke', 'ok', 'ya', 'yes', 'simpan', 'catat', 'yap', 'yep', 'iya', 'sip', 'lanjut', 'betul', 'benar', 'setuju', 'acc', 'gas', 'ayo', 'boleh', 'done', 'save'];
const CANCEL_WORDS = ['batal', 'cancel', 'tidak', 'nggak', 'ga', 'gak', 'no', 'jangan', 'skip', 'lewat'];

export function useChatLogic(isOpen: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ 
      role: 'assistant', 
      content: "Halo Dyko! Saya siap bantu kelola keuanganmu hari ini. Kirim foto nota atau ketik transaksimu, dan saya akan bantu mencatatnya.", 
      timestamp: new Date() 
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{base64: string, name: string, mimeType: string} | null>(null);
  const [pendingTxn, setPendingTxn] = useState<PendingTransaction | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transactions = useLiveQuery(() => TransactionService.getAll()) || [];

  const financialContext = useMemo(() => {
    const income = transactions.filter((t: Transaction) => t.type === 'income').reduce((s: number, t: Transaction) => s + t.amount, 0);
    const expense = transactions.filter((t: Transaction) => t.type === 'expense').reduce((s: number, t: Transaction) => s + t.amount, 0);
    const recent = transactions.slice(-15).map((t: Transaction) => 
        `- ${format(new Date(t.createdAt), 'dd/MM')}: ${t.type} Rp ${t.amount.toLocaleString()} (${t.category})`
    ).join('\n');

    return `Saldo: Rp ${(income - expense).toLocaleString()}. Transaksi Terakhir:\n${recent}`;
  }, [transactions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedImage({
        base64,
        name: file.name,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

  const savePendingTransaction = async (txn: PendingTransaction) => {
    await TransactionService.create({
      amount: txn.amount,
      type: txn.type,
      category: txn.category,
      description: txn.description,
      status: 'paid',
      rawInput: 'receipt-scan',
      aiConfidence: txn.confidence,
      createdAt: new Date()
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim().toLowerCase();
    const hasInput = input.trim().length > 0;
    const hasImage = !!selectedImage;

    if ((!hasInput && !hasImage) || isLoading) return;

    // STEP 1: Confirming/Cancelling a pending transaction
    if (pendingTxn && hasInput && !hasImage) {
      const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      setInput('');

      const isConfirm = CONFIRM_WORDS.some(w => trimmedInput.includes(w));
      const isCancel = CANCEL_WORDS.some(w => trimmedInput.includes(w));

      if (isConfirm) {
        setIsLoading(true);
        try {
          await savePendingTransaction(pendingTxn);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `✅ Tercatat! ${pendingTxn.description} sebesar ${formatCurrency(pendingTxn.amount)} sudah disimpan sebagai ${pendingTxn.type === 'expense' ? 'pengeluaran' : 'pemasukan'} di kategori ${pendingTxn.category}.`, 
            timestamp: new Date() 
          }]);
        } catch (err) {
          setMessages(prev => [...prev, { role: 'assistant', content: "❌ Gagal menyimpan transaksi. Coba lagi ya.", timestamp: new Date() }]);
        }
        setPendingTxn(null);
        setIsLoading(false);
        return;
      }

      if (isCancel) {
        setPendingTxn(null);
        setMessages(prev => [...prev, { role: 'assistant', content: "Oke, transaksi dibatalkan. Ada yang lain?", timestamp: new Date() }]);
        return;
      }
    }

    // STEP 2: Image upload flow
    if (hasImage) {
      const userMsg: ChatMessage = { role: 'user', content: hasInput ? input : "📷 Foto nota diunggah", timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/parse-txn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            input: hasInput ? input : "Analyze receipt",
            image: selectedImage.base64,
            mimeType: selectedImage.mimeType
          }),
        });
        const data = await response.json();
        
        if (response.ok && data.amount) {
          const txn: PendingTransaction = {
            amount: data.amount,
            type: data.type || 'expense',
            category: data.category || 'Lainnya',
            description: data.description || 'Transaksi',
            confidence: data.confidence || 0.8
          };
          setPendingTxn(txn);

          const typeLabel = txn.type === 'expense' ? 'Pengeluaran' : 'Pemasukan';
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `📋 Saya menemukan transaksi dari nota ini:\n\n💰 ${formatCurrency(txn.amount)}\n📂 Kategori: ${txn.category}\n📝 ${txn.description}\n🏷️ Jenis: ${typeLabel}\n\nApakah data ini sudah benar? Ketik "oke" untuk menyimpan atau "batal" untuk membatalkan.`, 
            timestamp: new Date() 
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, saya tidak bisa membaca nota ini dengan jelas. Coba foto ulang dengan pencahayaan yang lebih baik ya.", timestamp: new Date() }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Gagal memproses gambar. Periksa koneksi internet.", timestamp: new Date() }]);
      } finally {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsLoading(false);
      }
      return;
    }

    // STEP 3: Normal text chat flow
    const userMessage: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
            financialContext 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        let rawContent = data.content;
        
        const actionRegex = /\[\[ACTION:([\s\S]*?)\]\]/;
        const match = rawContent.match(actionRegex);
        if (match) {
            try {
                const cleanJson = match[1].replace(/```json|```/g, '').trim();
                const actionData = JSON.parse(cleanJson);
                if (actionData.type === 'ADD_TRANSACTION') {
                    const p = actionData.payload;
                    const txn: PendingTransaction = {
                      amount: Number(String(p.amount).replace(/[.,]/g, '').replace(/[^0-9]/g, '')),
                      type: ['income', 'expense'].includes(p.type) ? p.type : 'expense',
                      category: p.category || 'Lainnya',
                      description: p.description || 'Transaksi',
                      confidence: 0.9
                    };
                    if (txn.amount > 0) {
                      setPendingTxn(txn);
                    }
                }
            } catch (err) { console.error(err); }
            rawContent = rawContent.replace(actionRegex, '').trim();
        }
        setMessages(prev => [...prev, { role: 'assistant', content: rawContent, timestamp: new Date() }]);
      }
    } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, koneksi AI sedang sibuk.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
