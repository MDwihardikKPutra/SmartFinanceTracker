'use client';

import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface MiniSparklineProps {
    data: Record<string, number | string>[];
    color: string;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({ data, color }) => {
    return (
        <div className="w-full h-16 absolute bottom-0 left-0 opacity-40 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`colorGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill={`url(#colorGradient-${color})`}
                        isAnimationActive={true}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MiniSparkline;
