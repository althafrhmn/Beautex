import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    PieChart,
    Activity,
    CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const ReportStation = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        revenueByMonth: [],
        popularServices: [],
        staffPerformance: []
    });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/admin/analytics');
                setReportData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching reports:', error);
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Strategic Intelligence</h2>
                    <p className="text-gray-500 font-medium">Aggregated performance analytics and financial trajectory.</p>
                </div>
                <button className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all">
                    <Download size={16} /> Export Deep Insight
                </button>
            </div>

            {/* Revenue Trajectory */}
            <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[3rem] shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                        <TrendingUp className="text-emerald-500" /> Revenue Architecture
                    </h3>
                    <div className="flex gap-2">
                        {['7D', '1M', '1Y', 'ALL'].map(t => (
                            <button key={t} className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black text-gray-500 hover:text-emerald-500 transition-all">{t}</button>
                        ))}
                    </div>
                </div>

                <div className="flex items-end gap-4 h-64">
                    {reportData.revenueByMonth.map((item, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="w-full relative">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.value / 70000) * 100}%` }}
                                    className="w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 border-t-2 border-emerald-500 rounded-t-xl transition-all relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
                                </motion.div>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">
                                    ₹{item.value.toLocaleString()}
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Popular Services */}
                <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[3rem] shadow-2xl">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic mb-10">
                        <PieChart className="text-emerald-500" /> Market Penetration
                    </h3>
                    <div className="space-y-6">
                        {reportData.popularServices.map((service, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-emerald-500 italic">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">{service.name}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{service.count} Operations</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white italic">₹{service.revenue.toLocaleString()}</p>
                                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">High Profit</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Staff Efficiency */}
                <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[3rem] shadow-2xl">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic mb-10">
                        <Activity className="text-emerald-500" /> Artisan Efficiency
                    </h3>
                    <div className="space-y-6">
                        {reportData.staffPerformance.map((staff, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white">{staff.name}</span>
                                    <span className="text-emerald-500">{staff.rating} RATING</span>
                                </div>
                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(staff.bookings / 150) * 100}%` }}
                                        className="h-full bg-emerald-500 rounded-full"
                                    />
                                </div>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{staff.bookings} Strategic Interactions Completed</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportStation;
