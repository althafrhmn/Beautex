import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Star, Filter,
    ChevronRight, ArrowRight, Scissors,
    Sparkles, Compass, LayoutGrid,
    User, Heart, TrendingUp
} from 'lucide-react';
import api from '../utils/api';

const ExploreSalons = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState(category || 'all');
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);

    const preselectedService = location.state?.service;

    useEffect(() => {
        const fetchSalons = async () => {
            try {
                const response = await api.get('/salons');
                const data = response.data.salons || [];
                
                // Map DB salons to UI shape
                const mapped = data.map(s => ({
                    id: s.id,
                    name: s.name,
                    address: s.address || s.location || '—',
                    city: s.city || 'Global',
                    rating: s.rating_average || 0,
                    reviews: s.rating_count ? `${s.rating_count}` : '0', 
                    category: s.tags?.includes('Beautician Styles') ? 'skin' : 
                              s.tags?.includes('Nail Art') ? 'nails' :
                              s.tags?.includes('Bridal & Makeup') ? 'makeup' :
                              s.tags?.includes('Grooming') ? 'men' : 'hair',
                    image: s.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
                    services: [ "Precision Styling", "Signature Ritual" ]
                }));
                setSalons(mapped);
            } catch (error) {
                console.error('Error fetching salons:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSalons();
    }, []);

    const categories = [
        { id: 'all', label: 'All Shops', icon: LayoutGrid },
        { id: 'hair', label: 'Hair Styling', icon: Scissors },
        { id: 'skin', label: 'Skin Clinic', icon: Compass },
        { id: 'makeup', label: 'Bridal & Makeup', icon: Sparkles },
        { id: 'men', label: "Men's Grooming", icon: TrendingUp },
        { id: 'nails', label: 'Nail Artistry', icon: Heart }
    ];

    const filteredSalons = salons.filter(salon => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = salon.name.toLowerCase().includes(query) ||
            salon.city.toLowerCase().includes(query) ||
            salon.services.some(s => s.toLowerCase().includes(query));

        const matchesFilter = activeFilter === 'all' || salon.category === activeFilter;

        // If a service was pre-selected, filter by it too
        const matchesService = !preselectedService ||
            salon.services.some(s => {
                const searchName = preselectedService.name.toLowerCase();
                const salonServiceName = s.toLowerCase();
                return salonServiceName.includes(searchName) || searchName.includes(salonServiceName);
            });

        return matchesSearch && matchesFilter && matchesService;
    });

    return (
        <div className="min-h-screen bg-[#050505] pt-28 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                {/* Pre-selected Service Context */}
                {preselectedService && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-16 p-10 bg-gradient-to-br from-[#00E6A0]/20 to-transparent border border-[#00E6A0]/30 rounded-[3.5rem] relative overflow-hidden group shadow-2xl shadow-[#00E6A0]/5"
                    >
                        <div className="absolute top-0 right-0 p-12 text-[#00E6A0] opacity-5 -mr-8 -mt-8 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                            <Sparkles size={180} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-[#00E6A0] text-[#050505] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#00E6A0]/40">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.5em] mb-3">Available at these locations</p>
                                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{preselectedService.name}</h2>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => navigate('/bookings', { state: { service: preselectedService } })}
                                    className="px-8 py-4 bg-[#00E6A0] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#00E6A0]/20 flex items-center justify-center gap-3"
                                >
                                    Quick Book Service <ArrowRight size={14} />
                                </button>
                                <button
                                    onClick={() => navigate('/explore/all', { replace: true, state: {} })}
                                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                >
                                    Clear Filter
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 text-[#00E6A0] font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                            <Sparkles size={14} /> Elite Beauty Shops
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-none">
                            Discover the <br /> <span className="text-[#00E6A0]">Best of Beautex</span>
                        </h1>
                        <p className="text-gray-500 text-lg">Browse our curated selection of high-end shops and master stylists across the region.</p>
                    </div>

                    <div className="flex-none">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-[#00E6A0]" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-14 pr-8 py-5 bg-[#0A0A0A] border border-white/5 rounded-3xl w-full md:w-[400px] outline-none shadow-sm focus:border-[#00E6A0]/30 transition-all font-medium text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveFilter(cat.id)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-sm font-black whitespace-nowrap transition-all border ${activeFilter === cat.id
                                ? 'bg-white/5 border-[#00E6A0] text-[#00E6A0] shadow-md shadow-[#00E6A0]/10'
                                : 'bg-[#0A0A0A] border-white/5 text-gray-500 hover:border-[#00E6A0]/30 hover:text-white'
                                }`}
                        >
                            <cat.icon size={18} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Salon Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSalons.map((salon) => (
                        <motion.div
                            key={salon.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            onClick={() => navigate(`/salon/${salon.id}`, { state: { preselectedService } })}
                            className="group bg-[#0A0A0A] rounded-[2.8rem] p-6 border border-white/5 hover:border-[#00E6A0]/20 transition-all cursor-pointer shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-8">
                                <img src={salon.image} className="w-full h-full object-cover group-hover:scale-110 opacity-70 group-hover:opacity-100 transition-all duration-1000" alt={salon.name} />
                                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-black text-white">{salon.rating > 0 ? salon.rating : 'New'}</span>
                                </div>
                            </div>

                            <div className="px-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-1 group-hover:text-[#00E6A0] transition-colors">{salon.name}</h3>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <MapPin size={14} className="text-[#00E6A0]" />
                                            {salon.city}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Rituals Info */}
                                <div className="space-y-3 mb-8">
                                    <div className="flex flex-wrap gap-2">
                                        {salon.services.map((svc, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl transition-all hover:border-[#00E6A0]/30 group/tag cursor-pointer">
                                                <div className="w-1 h-1 rounded-full bg-[#00E6A0]" />
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider group-hover/tag:text-[#00E6A0]">{svc}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {preselectedService && (
                                        <div className="p-4 bg-[#00E6A0]/10 border border-[#00E6A0]/20 rounded-2xl">
                                            <div className="flex justify-between items-center text-[#00E6A0] font-black text-[10px] uppercase tracking-widest">
                                                <span>Estimated Ritual Price</span>
                                                <span>₹{preselectedService.price}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                                        {salon.reviews} Reviews
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/bookings', { state: { salon, service: preselectedService } });
                                        }}
                                        className="w-12 h-12 bg-white/5 text-gray-500 rounded-2xl flex items-center justify-center group-hover:bg-[#00E6A0] group-hover:text-[#050505] transition-all shadow-sm"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredSalons.length === 0 && (
                    <div className="py-40 text-center">
                        <div className="w-24 h-24 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <Search size={40} className="text-gray-800" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No Shops Found</h3>
                        <p className="text-gray-500">Try adjusting your search filters to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExploreSalons;
