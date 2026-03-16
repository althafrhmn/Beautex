import React from 'react';
import {
    Wallet, CreditCard, Tag, Gift,
    Star, ArrowUpRight, ArrowDownLeft, Plus
} from 'lucide-react';

const FinanceModule = () => {
    const transactions = [
        { id: 1, type: 'payment', desc: 'Precision Haircut', amount: '-₹3,750', date: 'Oct 24, 2:30 PM', status: 'Completed' },
        { id: 2, type: 'credit', desc: 'Wallet Top-up', amount: '+₹8,000', date: 'Oct 20, 11:15 AM', status: 'Completed' },
        { id: 3, type: 'offer', desc: 'First Visit Discount', amount: '-₹800', date: 'Oct 15, 9:00 AM', status: 'Applied' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Wallet & Membership Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Wallet Card */}
                <div className="bg-gradient-to-br from-[#00E6A0] to-[#00A372] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border border-[#00E6A0]/20">
                    <div className="absolute top-0 right-0 p-10 opacity-20 group-hover:scale-110 transition-transform text-[#050505]">
                        <Wallet size={160} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <p className="text-[#050505]/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Signature Balance</p>
                            <h2 className="text-6xl font-black text-[#050505] tracking-tighter">₹14,500</h2>
                        </div>
                        <div className="flex gap-4 pt-12">
                            <button className="flex-1 py-4 bg-[#050505] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-[#050505] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20">
                                <Plus size={16} /> Crediting
                            </button>
                            <button className="flex-1 py-4 bg-white/20 backdrop-blur-md text-[#050505] border border-[#050505]/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all">
                                Settlement
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loyalty/Membership Card */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E6A0]/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <p className="text-[10px] text-[#00E6A0] font-black uppercase tracking-[0.3em] mb-2">Member Tier</p>
                            <h3 className="text-3xl font-black text-white tracking-tight">Elysian Gold</h3>
                        </div>
                        <div className="w-16 h-16 bg-[#00E6A0]/10 border border-[#00E6A0]/20 rounded-2xl flex items-center justify-center text-[#00E6A0] shadow-lg shadow-[#00E6A0]/5">
                            <Star size={32} fill="currentColor" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Progress to <span className="text-white font-black">Platinum Sovereign</span></span>
                                <span className="text-[#00E6A0]">750 / 1000 Pts</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-[#00E6A0] rounded-full shadow-[0_0_15px_rgba(0,230,160,0.5)]" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-600 italic font-medium">Earn 250 more points to unlock complimentary signature massages.</p>
                    </div>
                </div>
            </div>

            {/* Coupons & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Available Coupons */}
                <div className="lg:col-span-1 space-y-8">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-white"><Tag size={22} className="text-[#00E6A0]" /> Ritual Offerings</h3>
                    <div className="space-y-6">
                        {[
                            { code: 'BEYOND30', disc: '30% REBATE', category: 'Alchemy Services' },
                            { code: 'LUXE1000', disc: '₹1,000 CREDIT', category: 'Royal Rituals' },
                        ].map((coupon, idx) => (
                            <div key={idx} className="bg-[#0A0A0A] border border-white/5 border-dashed rounded-[2.5rem] p-8 relative group hover:border-[#00E6A0]/40 transition-all shadow-xl">
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-10 bg-[#050505] rounded-full border border-white/5"></div>
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-10 bg-[#050505] rounded-full border border-white/5"></div>
                                <div className="text-center">
                                    <p className="text-[#00E6A0] font-black text-3xl mb-1 tracking-tighter">{coupon.disc}</p>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-6">{coupon.category}</p>
                                    <div className="py-4 px-6 bg-white/[0.03] border border-white/5 rounded-2xl text-xs font-black text-white tracking-[0.3em] uppercase">
                                        {coupon.code}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-white"><CreditCard size={22} className="text-[#00E6A0]" /> Transaction Ledger</h3>
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                        <div className="divide-y divide-white/5">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-transparent transition-all ${tx.type === 'payment' ? 'bg-white/5 text-gray-400 group-hover:text-white' : tx.type === 'credit' ? 'bg-[#00E6A0]/10 text-[#00E6A0] border-[#00E6A0]/20' : 'bg-[#00E6A0]/10 text-[#00E6A0] border-[#00E6A0]/20'}`}>
                                            {tx.type === 'payment' ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white tracking-tight">{tx.desc}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black tracking-tight ${tx.amount.startsWith('-') ? 'text-white' : 'text-[#00E6A0]'}`}>{tx.amount}</p>
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceModule;
