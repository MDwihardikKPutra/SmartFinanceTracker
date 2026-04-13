'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { isSameMonth } from 'date-fns';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function SpendingComposition() {
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  
  const data = React.useMemo(() => {
    const now = new Date();
    const thisMonthTxns = transactions.filter(t => 
      t.type === 'expense' && isSameMonth(new Date(t.createdAt), now)
    );

    const categoryMap: Record<string, number> = {};
    thisMonthTxns.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  }, [transactions]);

  if (data.length === 0) {
    return (
        <div className="h-full flex items-center justify-center text-neutral-400 text-xs font-medium italic">
            No data this month
        </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center gap-4">
      <div className="w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={35}
              outerRadius={50}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        return (
                            <div className="bg-white border border-neutral-100 px-3 py-2 rounded-xl shadow-lg text-[10px] font-bold">
                                {payload[0].name}: Rp {payload[0].value?.toLocaleString('id-ID')}
                            </div>
                        );
                    }
                    return null;
                }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="w-1/2 flex flex-col justify-center gap-1.5">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-[10px] font-bold text-neutral-500 truncate w-20 uppercase tracking-tighter">
                {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
