import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Star, Filter,
    ChevronRight, ArrowRight, Scissors,
    Sparkles, Compass, LayoutGrid, Clock, Phone
} from 'lucide-react';

const Locations = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('All');

    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchSalons = async () => {
            try {
                // Fetch using our standard api route (or from an imported api if available – since we need to import it, let's just use fetch or import api)
                const api = (await import('../utils/api')).default;
                const response = await api.get('/salons');
                const data = response.data.salons || [];
                const mapped = data.map(s => ({
                    id: s.id,
                    name: s.name,
                    address: s.address || s.location || '—',
                    city: s.city || 'Global',
                    rating: s.rating_average || 0,
                    reviews: s.rating_count ? `${s.rating_count}` : '0',
                    image: s.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
                    phone: s.phone || "---",
                    timing: s.hours || "09:00 AM - 09:00 PM"
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

    const cities = ['All', 'Kottakkal', 'Tirur', 'Malappuram', 'Kochi', 'Perintalmanna', 'Valavanur'];

    const filteredSalons = salons.filter(salon => {
        const matchesSearch = salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            salon.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = selectedCity === 'All' || salon.city === selectedCity;
        return matchesSearch && matchesCity;
    });

    return (
        <div className="min-h-screen bg-[#050505] pt-28 pb-32">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 text-[#00E6A0] font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                            <MapPin size={14} /> Global Network
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-none">
                            Our <span className="text-[#00E6A0]">Shops</span>
                        </h1>
                        <p className="text-gray-500 text-lg">Find the nearest Beautex shop and experience our signature rituals in person.</p>
                    </div>

                    <div className="flex-none">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-[#00E6A0]" size={20} />
                            <input
                                type="text"
                                placeholder="Locate a shop..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-14 pr-8 py-5 bg-[#0A0A0A] border border-white/5 rounded-3xl w-full md:w-[400px] outline-none shadow-sm focus:border-[#00E6A0]/30 transition-all font-medium text-white placeholder:text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* City Tabs */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12">
                    {cities.map(city => (
                        <button
                            key={city}
                            onClick={() => setSelectedCity(city)}
                            className={`px-8 py-4 rounded-[1.8rem] text-sm font-black whitespace-nowrap transition-all border ${selectedCity === city
                                ? 'bg-[#00E6A0] border-[#00E6A0] text-[#050505] shadow-lg shadow-[#00E6A0]/20'
                                : 'bg-[#0A0A0A] border-white/5 text-gray-500 hover:border-[#00E6A0]/30 hover:text-white'
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {filteredSalons.map((salon) => (
                        <motion.div
                            key={salon.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-[#0A0A0A] rounded-[3rem] overflow-hidden border border-white/5 hover:border-[#00E6A0]/20 transition-all group flex flex-col md:flex-row shadow-sm hover:shadow-2xl hover:shadow-[#00E6A0]/5"
                        >
                            <div className="md:w-2/5 relative">
                                <img src={salon.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt={salon.name} />
                                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/5">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-black text-white">{salon.rating > 0 ? salon.rating : 'New'}</span>
                                </div>
                            </div>

                            <div className="p-10 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-black text-white leading-tight group-hover:text-[#00E6A0] transition-colors">{salon.name}</h3>
                                        <div className="p-3 bg-white/5 rounded-2xl text-[#00E6A0]">
                                            <Compass size={20} />
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                                            <MapPin size={16} className="text-[#00E6A0]" />
                                            {salon.address}, {salon.city}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                                            <Clock size={16} className="text-[#00E6A0]" />
                                            {salon.timing}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                                            <Phone size={16} className="text-[#00E6A0]" />
                                            {salon.phone}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/salon/${salon.id}`)}
                                    className="w-full py-4 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#00E6A0]/10"
                                >
                                    Explore Shop
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Locations;
