import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles, Compass, Heart, TrendingUp, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ServicesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            // Assuming categories are derived from the services data
            const services = response.data.services || [];
            
            // Group services by category
            const grouped = services.reduce((acc, service) => {
                const cat = service.category || 'Other';
                if (!acc[cat]) acc[cat] = { name: cat, items: [], icon: Scissors };
                acc[cat].items.push(service);
                return acc;
            }, {});

            // Define some standard icons/images for categories
            const categoryMeta = {
                'Hair': { icon: Scissors, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200' },
                'Nails': { icon: Sparkles, image: 'https://images.unsplash.com/photo-1604654894610-df49ff66a7cb?auto=format&fit=crop&q=80&w=1200' },
                'Skin': { icon: Compass, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200' },
                'Massage': { icon: TrendingUp, image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=1200' },
                'Other': { icon: Heart, image: 'https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=1200' }
            };

            const finalized = Object.keys(grouped).map(key => ({
                id: key.toLowerCase().replace(/\s+/g, '-'),
                name: key,
                icon: categoryMeta[key]?.icon || Scissors,
                image: categoryMeta[key]?.image || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200',
                items: grouped[key].items
            }));

            setCategories(finalized);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 text-[#00E6A0] font-black uppercase tracking-[0.3em] text-[10px] mb-6"
                    >
                        <Sparkles size={16} /> Signature Rituals
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-8"
                    >
                        Our World-Class <br /> <span className="text-[#00E6A0]">Services</span>
                    </motion.h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#00E6A0] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {categories.map((category, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => navigate(`/explore/${category.id}`)}
                                className="group relative h-[450px] rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5"
                            >
                                <img
                                    src={category.image}
                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                                    alt={category.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                    <div className="w-12 h-12 bg-[#00E6A0] text-black rounded-xl flex items-center justify-center mb-6 shadow-xl shadow-[#00E6A0]/20 transform group-hover:-translate-y-2 transition-transform duration-500">
                                        <category.icon size={24} />
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">{category.name}</h2>
                                    <p className="text-gray-400 text-sm font-medium mb-8">
                                        {category.items.length} specialized services available.
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <span className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-[#00E6A0] group-hover:bg-[#00E6A0] group-hover:text-black transition-all">
                                            Book Now
                                        </span>
                                        <ArrowRight size={20} className="text-white transform group-hover:translate-x-3 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 py-20 border-t border-white/5">
                    {[
                        { icon: ShieldCheck, title: "Premium Products", desc: "We use only hand-vetted, high-end international brands." },
                        { icon: Zap, title: "Expert Artistry", desc: "Our specialists hold global certifications and mastery." },
                        { icon: Heart, title: "Unmatched Care", desc: "A bespoke experience tailored to your unique identity." }
                    ].map((badge, i) => (
                        <div key={i} className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-[#00E6A0] mb-6">
                                <badge.icon size={32} />
                            </div>
                            <h4 className="text-xl font-black text-white mb-3">{badge.title}</h4>
                            <p className="text-gray-500 font-medium">{badge.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
