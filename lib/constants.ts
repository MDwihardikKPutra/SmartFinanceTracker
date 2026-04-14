import { 
    Utensils, 
    Bus, 
    Receipt, 
    ShoppingBag, 
    Wallet, 
    ArrowUpRight, 
    Activity 
} from 'lucide-react';

export const CATEGORIES = [
    'Makanan & Minuman', 
    'Transportasi', 
    'Tagihan', 
    'Belanja', 
    'Gaji', 
    'Freelance', 
    'Lainnya'
];

export const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    'Makanan & Minuman': { icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-50' },
    'Transportasi': { icon: Bus, color: 'text-blue-500', bg: 'bg-blue-50' },
    'Tagihan': { icon: Receipt, color: 'text-purple-500', bg: 'bg-purple-50' },
    'Belanja': { icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-50' },
    'Gaji': { icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    'Freelance': { icon: ArrowUpRight, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    'Lainnya': { icon: Activity, color: 'text-neutral-500', bg: 'bg-neutral-50' },
    'default': { icon: Activity, color: 'text-neutral-500', bg: 'bg-neutral-50' }
};

export const UI_TOKENS = {
    radius: 'rounded-[1.5rem]',
    border: 'border-neutral-100',
    bgCard: 'bg-white',
    textMuted: 'text-black/50',
    fontHubot: 'font-sans'
};
