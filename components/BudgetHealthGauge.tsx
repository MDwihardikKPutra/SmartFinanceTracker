'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BudgetHealthGaugeProps {
    spent: number;
    total: number;
}

const BudgetHealthGauge: React.FC<BudgetHealthGaugeProps> = ({ spent, total }) => {
    const percentage = Math.min(Math.round((spent / total) * 100), 100);
    const data = [
        { name: 'Spent', value: percentage },
        { name: 'Remaining', value: 100 - percentage },
    ];

    // Dynamic colors based on stress level
    const color = percentage > 85 ? '#ef4444' : percentage > 60 ? '#f59e0b' : '#818cf8';

    return (
        <div className="w-full h-[140px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="80%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell key="cell-0" fill={color} />
                        <Cell key="cell-1" fill="#f3f4f6" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center">
                <p className="text-xl font-semibold text-black leading-none">{percentage}%</p>
                <p className="text-[10px] font-semibold text-black mt-1">Sisa Budget</p>
            </div>
        </div>
    );
};

export default BudgetHealthGauge;
