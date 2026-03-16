import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ label, value, trend, icon: Icon, color = "emerald" }) => {
    const isPositive = trend > 0;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group transition-all hover:border-emerald-500/20 shadow-2xl"
        >
            {/* Background Accent */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase">{value}</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
