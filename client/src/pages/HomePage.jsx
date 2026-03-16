import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Scissors, Star, MapPin, Sparkles,
    ArrowRight, Award, Zap, Heart,
    TrendingUp, ShieldCheck, ChevronRight,
    Store, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import HomeHeroSlider from '../components/customer/HomeHeroSlider';
import CardCarousel from '../components/customer/CardCarousel';
import api from '../utils/api';

// Import local assets
import hairImg from '../assets/services/hair.png';
import makeupImg from '../assets/services/makeup.png';

const HomePage = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [shops, setShops] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Beautex | Luxury salon booking";
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, shopRes, serviceRes] = await Promise.all([
                api.get('/admin/staff').catch(() => ({ data: { staff: [] } })),
                api.get('/shops').catch(() => ({ data: { salons: [] } })),
                api.get('/services').catch(() => ({ data: { services: [] } }))
            ]);

            const staffData = staffRes.data.staff || [];
            setStaff(staffData.length > 0 ? staffData : [
                { full_name: "Julian Ross", role: "Master Colorist", avatar_url: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=800" },
                { full_name: "Elena Volkov", role: "Creative Stylist", avatar_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=800" },
                { full_name: "Marcus Thorne", role: "Precision Barber", avatar_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800" },
                { full_name: "Sofia Chen", role: "Skin Specialist", avatar_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" }
            ]);

            const shopsData = shopRes.data.salons || shopRes.data.shops || [];
            setShops(shopsData.length > 0 ? shopsData : [
                { id: 1, name: "The Palace Sanctuary", address: "Altamount Road", city: "Mumbai", image_url: "https://images.unsplash.com/photo-1512690196152-730d4375338c?auto=format&fit=crop&q=80&w=800", rating: 4.9, reviews: "2.1K" },
                { id: 2, name: "Emerald Oasis", address: "Indiranagar", city: "Bangalore", image_url: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=800", rating: 4.8, reviews: "1.5K" },
                { id: 3, name: "Azure Retreat", address: "Marine Drive", city: "Kochi", image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800", rating: 4.9, reviews: "3.2K" }
            ]);

            const servicesData = serviceRes.data.services || [];
            setServices(servicesData);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00E6A0]/20 pt-20 lg:pt-0">
            <HomeHeroSlider />

            {/* Premium Features Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        {
                            icon: Award,
                            title: "Elite Mastery",
                            desc: "Experience services from our world-class specialists with global certifications and unmatched artistry.",
                            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
                        },
                        {
                            icon: Zap,
                            title: "Instant Booking",
                            desc: "Secure your luxury experience in seconds with our real-time availability and immediate confirmation.",
                            image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800"
                        },
                        {
                            icon: ShieldCheck,
                            title: "Curated Venues",
                            desc: "Relax in hand-vetted, high-end environments that meet our uncompromising standards for style and hygiene.",
                            image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800"
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="p-8 bg-[#0A0A0A] rounded-[3rem] border border-white/5 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all group hover:border-[#00E6A0]/20 overflow-hidden"
                        >
                            <div className="relative h-64 mb-10 overflow-hidden rounded-[2.5rem]">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 brightness-75 group-hover:brightness-100"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>
                                <div className="absolute top-6 left-6 w-12 h-12 bg-[#00E6A0]/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#00E6A0] group-hover:scale-110 transition-transform">
                                    <feature.icon size={24} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-white">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Professional Showcase Section */}
            <section className="py-32 bg-[#050505] overflow-hidden border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 mb-20 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                        <div className="max-w-2xl">
                            <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.4em] mb-6">Master Artists</p>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">
                                The Architects of <br /> <span className="text-gray-500">Personal Identity</span>
                            </h2>
                        </div>
                        <div className="flex gap-10 items-center">
                            <div className="text-center">
                                <p className="text-4xl font-black text-white">{shops.length || '50'}+</p>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Shops</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-black text-[#00E6A0]">{staff.length || '200'}+</p>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Stylists</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sliding Gallery Content Wrapper with marquee animation */}
                <div className="relative group">
                    <div className="flex gap-8 animate-infinite-scroll py-4 hover:[animation-play-state:paused]">
                        {staff.map((pro, i) => (
                            <div key={i} className="flex-none w-[320px] md:w-[420px] group/item cursor-pointer">
                                <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden mb-8 border border-white/5 shadow-xl transition-all duration-500 hover:border-[#00E6A0]/30 hover:shadow-2xl hover:shadow-[#00E6A0]/10">
                                    <img src={pro.avatar_url || pro.img} alt={pro.full_name} className="w-full h-full object-cover grayscale opacity-50 transition-all duration-1000 group-hover/item:grayscale-0 group-hover/item:opacity-100 group-hover/item:scale-110" />
                                    <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/40 to-transparent">
                                        <h3 className="text-3xl font-black text-white tracking-tight transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-500">{pro.full_name}</h3>
                                        <p className="text-[#00E6A0] text-[10px] font-black uppercase tracking-[0.4em] transform translate-y-4 opacity-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 transition-all duration-500 delay-100 mt-2">{pro.role || 'Expert Stylist'}</p>
                                    </div>
                                    <div className="absolute top-10 right-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-500 hover:bg-[#00E6A0]">
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Rituals - Services Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.4em] mb-6">Expert Rituals</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white">
                        Curated <span className="text-gray-500">Service</span> Catalog
                    </h2>
                </div>
                <CardCarousel services={services} />
            </section>

            {/* Our Salons Section - NEW */}
            <section className="py-32 px-6 bg-[#0A0A0A]/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                        <div className="max-w-2xl">
                            <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.4em] mb-6">Our Sanctuary Locations</p>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">
                                The <span className="text-[#00E6A0]">Shop</span> Directory
                            </h2>
                        </div>
                        <button 
                            onClick={() => navigate('/locations')}
                            className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 border border-white/10"
                        >
                            View All Locations <MapPin size={18} className="text-[#00E6A0]" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shops.map((shop, i) => (
                            <motion.div
                                key={shop.id || i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#00E6A0]/30 transition-all shadow-2xl"
                            >
                                <div className="h-48 bg-[#1A1A1A] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#00E6A0]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Store size={64} className="text-white/5 group-hover:text-[#00E6A0]/20 transition-colors" />
                                    </div>
                                    <div className="absolute top-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase text-[#00E6A0] tracking-widest">
                                        Open Now
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-black text-white mb-2">{shop.name}</h3>
                                    <div className="flex items-start gap-2 text-gray-500 mb-6 min-h-[40px]">
                                        <MapPin size={14} className="mt-1 flex-shrink-0" />
                                        <p className="text-xs font-medium leading-relaxed">{shop.address}, {shop.city}</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/salon/${shop.id}`)}
                                        className="w-full py-4 bg-white/5 hover:bg-[#00E6A0] text-white hover:text-[#050505] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10 hover:border-transparent"
                                    >
                                        Visit Salon
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="py-40 text-center px-6 bg-[#050505]">
                <div className="max-w-3xl mx-auto p-20 bg-[#0A0A0A] border border-white/5 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 text-[#00E6A0] opacity-10"><Sparkles size={120} /></div>
                    <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.5em] mb-8">Join the Collective</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-10">Start Your <br /> Transformation</h2>
                    <button
                        onClick={() => navigate('/explore/all')}
                        className="bg-[#00E6A0] text-[#050505] px-12 py-5 rounded-[2.5rem] font-black text-xl hover:bg-white transition-all shadow-xl shadow-[#00E6A0]/20 flex items-center gap-4 mx-auto"
                    >
                        Explore Shops <ChevronRight size={24} />
                    </button>
                </div>
            </section>

            {/* Simplified Footer */}
            <footer className="py-12 bg-[#050505] border-t border-white/5 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.5em]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; 2026 Beautex. Elevating Human Identity.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
