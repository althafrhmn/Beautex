import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Calendar, Clock, User, Star,
    MapPin, Check, Info, ShieldCheck, Heart,
    Share2, Scissors, ArrowLeft, Shield, Phone, Globe
} from 'lucide-react';
import axios from 'axios';
import PromoBanner from '../components/customer/PromoBanner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SalonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [selectedServices, setSelectedServices] = useState([]);
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isFavorited, setIsFavorited] = useState(() => {
        try {
            const favs = JSON.parse(localStorage.getItem('btx_favorites') || '[]');
            return favs.includes(id);
        } catch { return false; }
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    const handleShare = async () => {
        const url = window.location.href;
        const name = currentSalon?.name || 'this salon';
        if (navigator.share) {
            try {
                await navigator.share({ title: name, text: `Check out ${name} on Beautex!`, url });
            } catch (e) { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            showToast('Link copied to clipboard!');
        }
    };

    const handleFavorite = () => {
        try {
            const favs = JSON.parse(localStorage.getItem('btx_favorites') || '[]');
            let updated;
            if (isFavorited) {
                updated = favs.filter(f => f !== id);
                showToast('Removed from saved salons', 'info');
            } else {
                updated = [...favs, id];
                showToast('Saved to your collection ♥');
            }
            localStorage.setItem('btx_favorites', JSON.stringify(updated));
            setIsFavorited(!isFavorited);
        } catch (e) {}
    };

    const [currentSalon, setCurrentSalon] = useState(null);

    useEffect(() => {
        const fetchSalonData = async () => {
            try {
                // Fetch the shop details
                const shopRes = await axios.get(`${API_URL}/shops`);
                const allShops = shopRes.data?.salons || shopRes.data?.shops || [];
                const foundShop = allShops.find(s => String(s.id) === String(id));
                setCurrentSalon(foundShop || null);

                // Fetch services for THIS salon only via salon_services junction table
                const res = await axios.get(`${API_URL}/services?salon_id=${id}`);
                const loadedServices = res.data?.services || [];
                setServices(loadedServices);

                if (location.state?.preselectedService) {
                    const found = loadedServices.find(s => s.id === location.state.preselectedService.id || s.original_id === location.state.preselectedService.id);
                    if (found) setSelectedServices([found]);
                }

                // Fetch products for this salon
                try {
                    const prodRes = await axios.get(`${API_URL}/products?salon_id=${id}`);
                    setProducts(prodRes.data?.products || []);
                } catch (e) {
                    console.error("Failed to load products:", e);
                }

                // Fetch announcements for this salon
                try {
                    const annRes = await axios.get(`${API_URL}/announcements?salon_id=${id}`);
                    setAnnouncements(annRes.data?.announcements || []);
                } catch (e) {
                    console.error("Failed to load announcements:", e);
                }
            } catch (err) {
                console.error("Failed to load salon details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSalonData();
    }, [id, location.state]);

    const toggleService = (service) => {
        setSelectedServices(prev => {
            const exists = prev.find(s => s.id === service.id);
            if (exists) return prev.filter(s => s.id !== service.id);
            return [...prev, service];
        });
    };

    const handleConfirmBooking = () => {
        const bookingData = {
            salon: {
                ...currentSalon,
                image_url: currentSalon.image || currentSalon.image_url
            },
            service: selectedServices[0],   // BookingFlow uses first as primary
            services: selectedServices,
            products: selectedProducts
        };

        if (!isAuthenticated) {
            sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
            navigate('/login', { state: { from: '/bookings' } });
            return;
        }
        navigate('/bookings', { state: bookingData });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#00E6A0] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentSalon) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6">
                <h2 className="text-3xl font-black text-white mb-4">Shop Not Found</h2>
                <p className="text-gray-500 mb-8 italic text-sm">We couldn't locate this sanctuary in our records.</p>
                <button onClick={() => navigate(-1)} className="px-8 py-3 bg-white/5 border border-white/5 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                    <ArrowLeft size={18} /> Back to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Toast Notification */}
            <AnimatePresence>
            {toast && (
                <motion.div
                    key="toast"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-24 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl ${
                        toast.type === 'info' ? 'bg-[#1A1A1A] border border-white/10 text-white' : 'bg-[#00E6A0] text-[#050505]'
                    }`}
                >
                    {toast.msg}
                </motion.div>
            )}
            </AnimatePresence>
            {/* Salon Header Hero */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={currentSalon.image || currentSalon.image_url}
                    className="w-full h-full object-cover opacity-60"
                    alt={currentSalon.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-28 left-8 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="absolute bottom-10 left-0 w-full px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 bg-[#00E6A0] w-fit px-4 py-1.5 rounded-full mb-6 shadow-lg shadow-[#00E6A0]/20">
                                <MapPin size={14} className="text-[#050505]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#050505]">{currentSalon.address}, {currentSalon.city}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-white">{currentSalon.name}</h1>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 shadow-sm">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-sm text-white">{currentSalon.rating}</span>
                                    <span className="text-gray-500 text-xs">({currentSalon.reviews} Reviews)</span>
                                </div>
                                <div className="flex gap-4">
                                    {currentSalon.google_maps_url && (
                                        <a 
                                            href={currentSalon.google_maps_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 bg-[#00E6A0] text-[#050505] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#00E6A0]/20"
                                        >
                                            <Globe size={14} />
                                            Get Directions
                                        </a>
                                    )}
                                    <button
                                        onClick={handleShare}
                                        title="Share this salon"
                                        className="p-3 bg-white/5 rounded-2xl border border-white/5 text-gray-400 hover:text-[#00E6A0] hover:border-[#00E6A0]/30 transition-all shadow-sm"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                    <button
                                        onClick={handleFavorite}
                                        title={isFavorited ? 'Remove from saved' : 'Save this salon'}
                                        className={`p-3 rounded-2xl border transition-all shadow-sm ${
                                            isFavorited
                                                ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:text-pink-400 hover:border-pink-400/30'
                                        }`}
                                    >
                                        <Heart size={18} className={isFavorited ? 'fill-pink-400' : ''} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Services Column */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Salon Specific Banner */}
                        {announcements.length > 0 && (
                            <section className="mb-8">
                                <PromoBanner announcement={announcements[0]} />
                            </section>
                        )}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-[#00E6A0]/10 rounded-2xl flex items-center justify-center text-[#00E6A0]">
                                    <Scissors size={24} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-white">Premium Rituals</h2>
                            </div>

                            <div className="grid gap-4">
                                {services.map(service => (
                                    <div
                                        key={service.id}
                                        onClick={() => toggleService(service)}
                                        className={`group relative p-8 rounded-[2.5rem] border transition-all cursor-pointer flex items-center justify-between ${
                                            selectedServices.find(s => s.id === service.id)
                                            ? 'bg-white/5 border-[#00E6A0] shadow-xl shadow-[#00E6A0]/5'
                                            : 'bg-[#0A0A0A] border-white/5 hover:border-[#00E6A0]/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                selectedServices.find(s => s.id === service.id) ? 'bg-[#00E6A0] border-[#00E6A0]' : 'border-white/10'
                                            }`}>
                                                {selectedServices.find(s => s.id === service.id) && <Check size={14} className="text-[#050505]" />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00E6A0] transition-colors">{service.name}</h3>
                                                <p className="text-sm text-gray-500">{service.duration_minutes || service.duration} mins • {service.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-white">₹{service.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {products.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-[#00E6A0]/10 rounded-2xl flex items-center justify-center text-[#00E6A0]">
                                        <Heart size={24} />
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight text-white">Premium Products</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map(product => {
                                        const isSelected = selectedProducts.find(p => p.product.id === product.id);
                                        return (
                                            <div
                                                key={product.id}
                                                className={`group relative p-6 rounded-3xl border transition-all ${isSelected
                                                    ? 'bg-white/5 border-[#00E6A0] shadow-xl shadow-[#00E6A0]/5'
                                                    : 'bg-[#0A0A0A] border-white/5 hover:border-[#00E6A0]/30'
                                                    }`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-20 bg-[#141414] rounded-2xl overflow-hidden flex-shrink-0">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600">No Img</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                                                        <p className="text-[10px] font-bold text-[#00E6A0] uppercase tracking-wider mb-2">{product.category}</p>
                                                        <div className="text-xl font-black text-white mb-3">₹{product.price}</div>
                                                        
                                                        {isSelected ? (
                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={() => {
                                                                        if (isSelected.quantity > 1) {
                                                                            setSelectedProducts(prev => prev.map(p => p.product.id === product.id ? { ...p, quantity: p.quantity - 1 } : p));
                                                                        } else {
                                                                            setSelectedProducts(prev => prev.filter(p => p.product.id !== product.id));
                                                                        }
                                                                    }}
                                                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                                                >-</button>
                                                                <span className="font-bold">{isSelected.quantity}</span>
                                                                <button 
                                                                    onClick={() => setSelectedProducts(prev => prev.map(p => p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p))}
                                                                    className="w-8 h-8 rounded-full bg-[#00E6A0]/20 text-[#00E6A0] flex items-center justify-center hover:bg-[#00E6A0]/30 transition-colors"
                                                                >+</button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setSelectedProducts(prev => [...prev, { product, quantity: 1 }])}
                                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                                                            >
                                                                Add to Cart
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <section className="bg-[#0A0A0A] rounded-[3rem] p-10 border border-white/5">
                            <h3 className="text-2xl font-black mb-6 text-white">About the Shop</h3>
                            <p className="text-gray-500 leading-relaxed mb-8">
                                Welcome to our flagship location. Our master specialists combine traditional artistry with modern innovation to deliver a bespoke beauty experience tailored to your unique identity.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { icon: ShieldCheck, label: 'Safety Verified', color: 'text-emerald-500' },
                                    { icon: Star, label: 'Elite Artists', color: 'text-amber-500' },
                                    { icon: Clock, label: 'Precision Tech', color: 'text-blue-500' },
                                    { icon: Shield, label: 'Premium Products', color: 'text-[#00E6A0]' }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center text-center gap-2">
                                        <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ${item.color}`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/50">
                            <h3 className="text-2xl font-black tracking-tight mb-8 text-white">Reservation</h3>

                            <div className="space-y-8 mb-10">
                                {selectedServices.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedServices.map(s => (
                                            <div key={s.id} className="flex gap-5">
                                                <div className="w-12 h-12 bg-[#00E6A0]/10 rounded-2xl flex items-center justify-center text-[#00E6A0] flex-none">
                                                    <Scissors size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Selected</p>
                                                    <p className="text-lg font-bold text-white">{s.name}</p>
                                                </div>
                                                <button onClick={() => toggleService(s)} className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex gap-5 items-center text-gray-500 p-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <Info size={24} className="opacity-30" />
                                        <p className="text-sm font-medium italic">Select a service to begin your transformation</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-white/5 pt-8 mb-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Estimated Total</p>
                                        <p className="text-4xl font-black text-white">
                                            ₹{selectedServices.reduce((sum, s) => sum + parseFloat(s.price || 0), 0) + selectedProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
                                        </p>
                                    </div>
                                    {selectedServices.length > 0 && (
                                        <div className="text-right">
                                            <p className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest mb-1">Includes GST</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmBooking}
                                disabled={selectedServices.length === 0}
                                className="w-full py-5 bg-[#00E6A0] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-[#050505] rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#00E6A0]/20 transition-all flex items-center justify-center gap-3 group"
                            >
                                Reserve Now
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                <ShieldCheck className="w-4 h-4 text-[#00E6A0]" /> Instant Secure Confirmation
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalonDetail;
