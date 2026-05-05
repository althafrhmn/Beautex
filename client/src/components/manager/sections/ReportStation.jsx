import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FileText, Download, Printer, Activity, TrendingUp } from 'lucide-react';
import api from '../../../utils/api';
import html2pdf from 'html2pdf.js';

const ReportStation = () => {
    const { user } = useSelector((state) => state.auth);
    const [periodType, setPeriodType] = useState('monthly'); // 'monthly' or 'yearly'
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    
    const reportRef = useRef(null);

    useEffect(() => {
        fetchReport();
    }, [periodType, selectedPeriod]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/staff/me/report?period=${periodType}&date=${selectedPeriod}`);
            setReportData(res.data.report || {
                totalRevenue: 0, netRevenue: 0, platformFee: 0, 
                prevRevenue: 0, growthPercent: 0, retentionRate: 0, bookingsCount: 0
            });
        } catch (err) {
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!reportRef.current) return;
        setGenerating(true);
        
        const opt = {
            margin: 1,
            filename: `BeauteX_Report_${selectedPeriod}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(reportRef.current).save().then(() => {
            setGenerating(false);
        });
    };



    return (
        <div className="h-[calc(100vh-220px)] flex gap-10 animate-in fade-in duration-500">
            {/* Left Control Panel */}
            <div className="w-[350px] space-y-6">
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-[2.5rem] p-8">
                   <h3 className="text-xl font-black text-white tracking-widest uppercase italic mb-6">Archive <span className="text-[#00D1FF]">Vault</span></h3>
                   <div className="space-y-4">
                       <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Report Type</label>
                       <select 
                          className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00D1FF]/50 appearance-none italic font-black uppercase mb-2"
                          value={periodType}
                          onChange={(e) => {
                              setPeriodType(e.target.value);
                              setSelectedPeriod(e.target.value === 'monthly' ? new Date().toISOString().slice(0, 7) : new Date().getFullYear().toString());
                          }}
                       >
                           <option value="monthly">Monthly</option>
                           <option value="yearly">Yearly</option>
                       </select>

                       <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Select Period</label>
                       {periodType === 'monthly' ? (
                           <input 
                               type="month"
                               className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00D1FF]/50 appearance-none italic font-black uppercase"
                               value={selectedPeriod}
                               max={new Date().toISOString().slice(0, 7)}
                               onChange={(e) => setSelectedPeriod(e.target.value)}
                           />
                       ) : (
                           <select
                               className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00D1FF]/50 appearance-none italic font-black uppercase"
                               value={selectedPeriod}
                               onChange={(e) => setSelectedPeriod(e.target.value)}
                           >
                               {Array.from({ length: new Date().getFullYear() - 2025 + 1 }, (_, i) => new Date().getFullYear() - i)
                                   .map(y => <option key={y} value={y}>{y}</option>)}
                           </select>
                       )}
                   </div>
                </div>

                <div className="space-y-2">
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Current Period</p>
                        <p className="text-2xl font-black text-[#00D1FF]">{selectedPeriod}</p>
                    </div>
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-3">Legend</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-[#00E6A0] inline-block"></span>Confirmed = Payment Received
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-[#00D1FF] inline-block"></span>Completed = Service Done
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Report Preview */}
            <div className="flex-1 bg-white rounded-[3rem] p-16 shadow-2xl relative overflow-y-auto custom-scrollbar flex flex-col text-[#141414]">
                <div className="absolute top-0 right-0 p-10 flex gap-4 no-print z-10">
                   <button onClick={() => window.print()} className="p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all shadow-md">
                       <Printer size={20} className="text-gray-600" />
                   </button>
                   <button onClick={handleDownload} disabled={generating || loading} className="p-4 bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-black rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#00D1FF]/20">
                       <Download size={20} />
                       {generating ? 'Exporting...' : 'Download PDF'}
                   </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div ref={reportRef} className="flex-1 flex flex-col h-full bg-white p-4">
                        {/* Report Header */}
                        <div className="border-b-4 border-black pb-8 mb-10">
                           <div className="flex justify-between items-end">
                               <div>
                                   <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-2">
                                       {periodType === 'monthly' ? 'Monthly' : 'Yearly'} <span className="text-[#00D1FF]">Audit</span>
                                   </h1>
                                   <p className="text-xs font-black uppercase tracking-[0.4rem] text-gray-500">Shop Performance Summary</p>
                               </div>
                               <div className="text-right">
                                   <p className="text-xs font-black uppercase tracking-widest text-gray-400">Date Issued</p>
                                   <p className="text-lg font-black italic">{new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                               </div>
                           </div>
                        </div>

                        <div className="flex-1 space-y-10">
                            <div className="grid grid-cols-2 gap-10">
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3rem] text-gray-400 border-b border-gray-100 pb-2 flex items-center gap-2">
                                        <Activity size={12} className="text-[#00D1FF]" /> Shop Metadata
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between font-black uppercase text-[10px]">
                                            <span className="text-gray-400">Account Holder</span>
                                            <span>{user?.full_name}</span>
                                        </div>
                                        <div className="flex justify-between font-black uppercase text-[10px]">
                                            <span className="text-gray-400">Access Tier</span>
                                            <span className="text-[#00E6A0]">Official Manager</span>
                                        </div>
                                        <div className="flex justify-between font-black uppercase text-[10px]">
                                            <span className="text-gray-400">Reporting Period</span>
                                            <span>{selectedPeriod}</span>
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3rem] text-gray-400 border-b border-gray-100 pb-2 flex items-center gap-2">
                                        <TrendingUp size={12} className="text-[#00E6A0]" /> Performance DNA
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center bg-gray-50 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Growth</p>
                                            <p className={`text-lg font-black tracking-tighter ${reportData?.growthPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {reportData?.growthPercent > 0 ? '+' : ''}{Math.round(reportData?.growthPercent || 0)}%
                                            </p>
                                        </div>
                                        <div className="text-center bg-gray-50 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Retention</p>
                                            <p className="text-lg font-black text-[#00D1FF] tracking-tighter">
                                                {Math.round(reportData?.retentionRate || 0)}%
                                            </p>
                                        </div>
                                        <div className="text-center bg-gray-50 rounded-2xl p-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Bookings</p>
                                            <p className="text-lg font-black text-amber-500 tracking-tighter">
                                                {reportData?.bookingsCount || 0}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <FileText size={100} />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8">Executive Financial Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b-2 border-gray-200 pb-4">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Received (Gross)</p>
                                            <p className="text-4xl font-black tracking-tighter italic">₹{(reportData?.totalRevenue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">vs Last {periodType === 'monthly' ? 'Month' : 'Year'}</p>
                                            {reportData && (reportData.totalRevenue - reportData.prevRevenue) >= 0 ? (
                                                <p className="text-lg font-black text-green-500 tracking-tighter">
                                                    +₹{Math.abs(reportData.totalRevenue - reportData.prevRevenue).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                                </p>
                                            ) : (
                                                <p className="text-lg font-black text-red-500 tracking-tighter">
                                                    -₹{Math.abs((reportData?.totalRevenue || 0) - (reportData?.prevRevenue || 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-4 text-[11px] font-black uppercase tracking-tighter text-gray-500 italic">
                                        <div className="flex justify-between border-r pr-6 border-gray-200">
                                            <span>Platform Fee (10%)</span>
                                            <span className="text-red-500">-₹{(reportData?.platformFee || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Net Payout to Shop</span>
                                            <span className="text-green-600">₹{(reportData?.netRevenue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-100 rounded-2xl px-6 py-4 mt-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Bookings This Period</span>
                                        <span className="text-xl font-black text-black">{reportData?.bookingsCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto border-t-2 border-gray-100 pt-8 flex justify-between items-center opacity-30 italic font-black uppercase tracking-[0.4rem] text-[9px]">
                            <span>Official Verified Document</span>
                            <span>BeauteX Platform - Partner Vault 2.0</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportStation;
