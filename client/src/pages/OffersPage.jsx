import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag, ArrowRight, Scissors, User, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const offers = [
    {
        id: 1,
        title: "Bridal Bliss Portfolio",
        description: "A complete sanctuary experience including royal make-up, hair couture, and skin radiance rituals.",
        price: "4,999",
        originalPrice: "7,500",
        type: "Salon",
        category: "Bridal",
        image: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=800",
        icon: Sparkles
    },
    {
        id: 2,
        title: "Executive Grooming Art",
        description: "Precision haircut by master stylists paired with beard sculpting and deep charcoal facial.",
        price: "1,200",
        originalPrice: "1,800",
        type: "Beautician",
        category: "Men",
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
        icon: Scissors
    },
    {
        id: 3,
        title: "Silk Keratin Infusion",
        description: "Transform your hair with our signature liquid silk keratin treatment. Unrivaled shine and health.",
        price: "2,499",
        originalPrice: "4,000",
        type: "Salon",
        category: "Hair Care",
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
        icon: Zap
    },
    {
        id: 4,
        title: "Azure Oxygen Blast",
        description: "Medical-grade oxygen facial that instantly rejuvenates skin cells. Perfect for an immediate glow.",
        price: "1,799",
        originalPrice: "2,500",
        type: "Beautician",
        category: "Skin",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
        icon: Star
    },
    {
        id: 5,
        title: "Gold Radiance Ritual",
        description: "24K Gold infused facial treatments providing deep hydration and anti-aging benefits.",
        price: "3,200",
        originalPrice: "5,000",
        type: "Salon",
        category: "Skin Clinic",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800",
        icon: Sparkles
    },
    {
        id: 6,
        title: "Architectural Nail Art",
        description: "Bespoke 3D nail design by our international artists. Includes premium gel extension.",
        price: "1,499",
        originalPrice: "2,200",
        type: "Beautician",
        category: "Nails",
        image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800",
        icon: Star
    }
];

const OffersPage = () => {
    const navigate = useNavigate();

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

                {/* Offers Grid */}
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
                            {/* Image Container */}
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    src={offer.image}
                                    alt={offer.title}
                                    className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                                
                                {/* Labels */}
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase text-[#00E6A0] tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E6A0] animate-pulse" />
                                        Limited Offer
                                    </div>
                                    <div className="px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/5 rounded-full text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                                        {offer.type === 'Salon' ? <Tag size={10} /> : <User size={10} />}
                                        {offer.type} Offer
                                    </div>
                                </div>

                                {/* Icon Overlay */}
                                <div className="absolute bottom-6 right-6 w-14 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-[#00E6A0] group-hover:rotate-12 transition-all">
                                    <offer.icon size={28} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-10">
                                <p className="text-[#00E6A0] text-[10px] font-black uppercase tracking-[0.4em] mb-4">{offer.category}</p>
                                <h3 className="text-3xl font-black text-white mb-4 tracking-tight group-hover:text-[#00E6A0] transition-colors">{offer.title}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed italic mb-10 h-12 overflow-hidden line-clamp-2">
                                    {offer.description}
                                </p>

                                <div className="flex items-end justify-between pt-8 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-xs font-black line-through mb-1 uppercase tracking-tighter">₹{offer.originalPrice}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-black text-white tracking-tighter">₹{offer.price}</span>
                                            <span className="text-[10px] font-black text-[#00E6A0] uppercase tracking-widest ml-2 opacity-80">Final Price</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/bookings', { state: { offer } })}
                                        className="w-14 h-14 bg-white/5 border border-white/5 text-gray-500 rounded-[1.5rem] flex items-center justify-center group-hover:bg-[#00E6A0] group-hover:text-[#050505] group-hover:border-[#00E6A0] transition-all duration-500 shadow-sm"
                                    >
                                        <ArrowRight size={24} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

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
