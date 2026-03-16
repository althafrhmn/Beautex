import React, { useState } from 'react';
import {
    MessageSquare, Star, LifeBuoy, Heart,
    Send, ThumbsUp, HelpCircle, ChevronDown, Plus
} from 'lucide-react';

const SupportSocialModule = () => {
    const [msg, setMsg] = useState('');

    const faqs = [
        { q: 'How do I cancel my booking?', a: 'You can cancel any booking at least 24 hours in advance via the Manage tab.' },
        { q: 'Do you offer home services?', a: 'Currently, we only provide high-end treatments at our physical salon locations.' },
        { q: 'Can I pay with the Beautex Wallet?', a: 'Yes! You can top-up your wallet and use it for any service or product.' },
    ];

    const reviews = [
        { id: 1, user: 'Sarah J.', rating: 5, date: '2 days ago', content: 'The Precision Haircut was amazing! Truly a premium experience at Beautex.' },
        { id: 2, user: 'Micah L.', rating: 4, date: '1 week ago', content: 'Great service, but had to wait 5 minutes for my stylist.' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Live Support Chat */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
                    <div className="p-8 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-[#00E6A0]/10 flex items-center justify-center text-[#00E6A0] border border-[#00E6A0]/20">
                                    <MessageSquare size={24} />
                                </div>
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00E6A0] rounded-full border-[3px] border-[#0A0A0A] animate-pulse"></span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Beautex Concierge</h3>
                                <p className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest">Priority Support Active</p>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            Typically 2 min
                        </div>
                    </div>

                    <div className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
                        <div className="flex gap-4 max-w-[85%]">
                            <div className="w-10 h-10 rounded-xl bg-[#00E6A0]/10 border border-[#00E6A0]/20 flex flex-shrink-0 items-center justify-center text-[#00E6A0] font-black text-sm">B</div>
                            <div className="p-6 bg-white/5 rounded-[2rem] rounded-tl-none border border-white/5">
                                <p className="text-sm text-gray-300 leading-relaxed font-medium">Greetings! I am your dedicated Beautex assistant. How may I assist with your luxury styling journey today?</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                        <div className="relative group">
                            <input
                                type="text"
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                placeholder="Whisper your inquiry..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-6 pr-16 py-5 focus:outline-none focus:border-[#00E6A0]/30 transition-all text-sm font-medium text-white placeholder:text-gray-700"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 bg-[#00E6A0] text-[#050505] rounded-xl hover:bg-white transition-all shadow-lg shadow-[#00E6A0]/10 active:scale-95">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ & Reviews */}
                <div className="space-y-12">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                        <h3 className="text-xl font-bold flex items-center gap-3 mb-8 text-white"><HelpCircle size={22} className="text-[#00E6A0]" /> Frequently Asked</h3>
                        <div className="space-y-4">
                            {faqs.map((f, i) => (
                                <div key={i} className="group p-6 bg-white/[0.02] rounded-[2rem] hover:bg-white/[0.05] border border-white/5 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{f.q}</p>
                                        <ChevronDown size={16} className="text-gray-600 group-hover:text-[#00E6A0] transition-colors" />
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed hidden group-hover:block animate-in fade-in slide-in-from-top-2 pt-2">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 shadow-2xl text-white">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3 text-white"><Star size={22} className="text-amber-400" /> Community Reviews</h3>
                            <button className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-[#00E6A0] transition-colors border border-white/5">
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="space-y-8">
                            {reviews.map((r) => (
                                <div key={r.id} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#00E6A0]/10 border border-[#00E6A0]/20 flex items-center justify-center text-xs font-black text-[#00E6A0] uppercase">{r.user[0]}</div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-widest">{r.user}</p>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{r.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-800"} />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed italic font-medium">"{r.content}"</p>
                                    <div className="flex gap-6 pt-2">
                                        <button className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-[#00E6A0] transition-colors uppercase tracking-[0.2em]">
                                            <ThumbsUp size={14} /> Helpful
                                        </button>
                                        <button className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]">
                                            <Heart size={14} /> Love
                                        </button>
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

export default SupportSocialModule;
