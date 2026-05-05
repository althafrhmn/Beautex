import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag, ArrowRight, Scissors, User, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OffersPage = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = React.useState([]); // Empty state for now

    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                {/* Hero Header */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#00E6A0]/10 border border-[#00E6A0]/20 text-[#00E6A0] text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                    >
                        <Tag size={12} /> Exclusive Savings
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-10"
                    >
                        Curated <span className="text-gray-500 italic font-medium">Privileges</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed italic"
                    >
                        Discover our limited-time luxury rituals at exceptional value. 
                        Experience world-class artistry across our elite network.
                    </motion.p>
                </div>

                {/* Offers Grid / Empty State */}
                {offers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {offers.map((offer, idx) => (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden hover:border-[#00E6A0]/30 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                            >
                                {/* Offer Card details... (keeping structure but data is gone) */}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/5 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-500 mx-auto mb-8">
                            <Sparkles size={40} className="opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4">No Active Privileges</h3>
                        <p className="text-gray-500 max-w-sm mx-auto italic font-medium">
                            Our experience managers are currently crafting new elite rituals. 
                            Check back soon for exclusive seasonal offerings.
                        </p>
                    </div>
                )}

                {/* Bottom CTA */}
                <div className="mt-32 p-20 bg-gradient-to-br from-[#0A0A0A] to-transparent border border-white/5 rounded-[4rem] text-center relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#00E6A0]/5 blur-[100px] rounded-full" />
                    <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.5em] mb-8">Personal Assistance</p>
                    <h2 className="text-5xl font-black text-white tracking-tight leading-none mb-10">Need a Bespoke <br /> Offer?</h2>
                    <button className="px-12 py-5 bg-[#00E6A0] text-[#050505] rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#00E6A0]/20">
                        Contact Experience Manager
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OffersPage;
