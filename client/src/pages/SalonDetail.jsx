import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Calendar, Clock, User, Star,
    MapPin, Check, Info, ShieldCheck, Heart,
    Share2, Scissors, ArrowLeft, Shield, Phone
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SalonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const mockServices = [
        { id: '101', name: "Men's Precision Cut", price: '450', duration_minutes: 45, category: 'Hair' },
        { id: '105', name: 'Beard Sculpting', price: '300', duration_minutes: 30, category: 'Hair' },
        { id: '111', name: 'Deep Tissue Massage', price: '1200', duration_minutes: 60, category: 'Massage' },
        { id: '102', name: 'Global Luxe Color', price: '3500', duration_minutes: 150, category: 'Hair' },
        { id: '107', name: 'Gold Alchemy Facial', price: '4500', duration_minutes: 90, category: 'Skin' },
        
        { id: '201', name: 'Bridal Alchemy Pack', price: '15000', duration_minutes: 300, category: 'Bridal' },
        { id: '204', name: 'Classic Bridal Makeover', price: '10000', duration_minutes: 240, category: 'Bridal' },
        { id: '205', name: 'Premium HD Bridal Glow', price: '25000', duration_minutes: 360, category: 'Bridal' },
        { id: '206', name: 'Pre-Wedding Radiance Set', price: '8500', duration_minutes: 180, category: 'Bridal' },

        { id: '202', name: 'Keratin Infusion', price: '4000', duration_minutes: 180, category: 'Hair' },
        { id: '203', name: 'Detox Body Wrap', price: '2800', duration_minutes: 60, category: 'Wellness' },
    ];

    // Helper to generate unique services and pricing per shop
    const getShopServices = (salon, allServices) => {
        if (!salon) return allServices;
        const salonId = salon.id;
        const idNum = typeof salonId === 'string' ? salonId.charCodeAt(0) + (parseInt(salonId) || 0) : salonId;
        
        const isGrooming = /grooming/i.test(salon.name);
        const isBridalShop = /bridal|wedding|ladies|boutique|makeover|essensuals|ziana/i.test(salon.name);

        const filtered = allServices.filter((s, i) => {
            // Give men's grooming shops only men's / general haircuts
            if (isGrooming && (s.category === 'Bridal' || s.category === 'Wellness' || s.name.toLowerCase().includes('facial'))) return false;
            // Limit Bridals to bridal shops
            if (s.category === 'Bridal' && !isBridalShop) return false;
            
            // Randomly drop some services so no shop has everything
            if ((i + idNum) % 4 === 0 && s.category !== 'Hair') return false; 
            
            return true;
        });

        const finalServices = filtered.length > 0 ? filtered : allServices;

        return finalServices.map((s, i) => {
            const factor = 1 + ((idNum + i) % 4) * 0.15;
            const newPrice = Math.round(parseFloat(s.price) * factor / 50) * 50;
            
            let prefix = "";
            if ((idNum + i) % 3 === 1) prefix = "Luxe ";
            else if ((idNum + i) % 3 === 2) prefix = "Signature ";
            
            return {
                ...s,
                id: `${s.id}-${salonId}`, // ensure unique keys
                original_id: s.id,
                price: newPrice.toString(),
                name: (prefix && !s.name.includes("Luxe") && !s.name.includes("Signature")) ? `${prefix}${s.name}` : s.name
            };
        });
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axios.get(`${API_URL}/services`);
                const loadedServices = res.data?.services?.length > 0 ? res.data.services : mockServices;
                const shopSpecific = getShopServices(currentSalon, loadedServices);
                setServices(shopSpecific);

                // If a service was pre-selected from Explore, find it in the loaded list
                if (location.state?.preselectedService) {
                    const found = shopSpecific.find(s => s.original_id === location.state.preselectedService.id || s.id === location.state.preselectedService.id);
                    if (found) setSelectedService(found);
                }
            } catch (err) {
                const shopSpecific = getShopServices(currentSalon, mockServices);
                setServices(shopSpecific);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [id, location.state]);

    const allSalons = [
        {
            id: 1,
            name: "Glam Makeovers Kottakkal",
            address: "Pallippuram Arcade",
            city: "Kottakkal",
            rating: 4.8,
            reviews: "2.3K",
            phone: "+91 98470 12345",
            timing: "9:00 AM - 8:00 PM",
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 2,
            name: "Toni&Guy Essensuals",
            address: "Up Hill",
            city: "Malappuram",
            rating: 4.9,
            reviews: "2.5K",
            phone: "+91 98470 99999",
            timing: "9:30 AM - 9:00 PM",
            image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 6,
            name: "Nafi Store & Beauty Studio",
            address: "Manjeri Road",
            city: "Malappuram",
            rating: 4.9,
            reviews: "1.5K",
            image: "/assets/salons/nafi_bridal.png"
        },
        {
            id: 7,
            name: "Ethereal Bridal Boutique",
            address: "Kottakkal Road",
            city: "Malappuram",
            rating: 4.8,
            reviews: "890",
            image: "/assets/salons/ethereal_bridal.png"
        },
        {
            id: 8,
            name: "Malappuram Grooming Hub",
            address: "Down Hill",
            city: "Malappuram",
            rating: 4.7,
            reviews: "600",
            image: "/assets/salons/grooming_hub.png"
        },
        {
            id: 14,
            name: "Luxe Nail & Artistry",
            address: "Palm Avenue",
            city: "Kottakkal",
            rating: 4.9,
            reviews: "450",
            image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 3,
            name: "Enchanted Spa & Wellness",
            address: "Marine Drive",
            city: "Kochi",
            rating: 4.7,
            reviews: "3.1K",
            phone: "+91 98470 77777",
            timing: "8:00 AM - 10:00 PM",
            image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 4,
            name: "The Royal Grooming Studio",
            address: "Central Plaza",
            city: "Tirur",
            rating: 4.6,
            reviews: "950",
            phone: "+91 98470 66666",
            timing: "10:00 AM - 8:00 PM",
            image: "https://images.unsplash.com/photo-1541533375320-fd81af7a1768?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 5,
            name: "Aesthetic Elite",
            address: "City Centre",
            city: "Perintalmanna",
            rating: 4.9,
            reviews: "1.8K",
            phone: "+91 98470 55555",
            timing: "9:00 AM - 9:00 PM",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 9,
            name: "Red Rose Ladies Beauty Salon",
            address: "Main Road",
            city: "Tirur",
            rating: 4.0,
            reviews: "1.4K",
            image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 11,
            name: "Royal Malabar Boutique",
            address: "Main Road",
            city: "Malappuram",
            rating: 4.9,
            reviews: "2.1K",
            image: "https://images.unsplash.com/photo-1510005716170-6da485292497?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 12,
            name: "The Wedding Belle Studio",
            address: "MG Road",
            city: "Kochi",
            rating: 4.8,
            reviews: "1.4K",
            image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 13,
            name: "Ziana Beauty Artistry",
            address: "Ooty Road",
            city: "Perintalmanna",
            rating: 4.7,
            reviews: "670",
            image: "https://images.unsplash.com/photo-1519213793-1628fc0e64f0?auto=format&fit=crop&q=80&w=1920"
        },
        {
            id: 10,
            name: "Beautx Unisex Salon",
            address: "Main Junction",
            city: "Valavanur",
            rating: 4.5,
            reviews: "432",
            image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1920"
        }
    ];

    const currentSalon = allSalons.find(s => s.id === parseInt(id)) || allSalons[0];

    const handleConfirmBooking = () => {
        navigate('/bookings', {
            state: {
                salon: {
                    ...currentSalon,
                    image_url: currentSalon.image || currentSalon.image_url // map image to image_url for BookingFlow
                },
                service: selectedService
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Salon Header Hero */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={currentSalon.image}
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
                                    <button className="p-3 bg-white/5 rounded-2xl border border-white/5 text-gray-400 hover:text-[#00E6A0] hover:border-[#00E6A0]/30 transition-all shadow-sm">
                                        <Share2 size={18} />
                                    </button>
                                    <button className="p-3 bg-white/5 rounded-2xl border border-white/5 text-gray-400 hover:text-[#00E6A0] hover:border-[#00E6A0] transition-all shadow-sm">
                                        <Heart size={18} />
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
                                        onClick={() => setSelectedService(service)}
                                        className={`group relative p-8 rounded-[2.5rem] border transition-all cursor-pointer flex items-center justify-between ${selectedService?.id === service.id
                                            ? 'bg-white/5 border-[#00E6A0] shadow-xl shadow-[#00E6A0]/5'
                                            : 'bg-[#0A0A0A] border-white/5 hover:border-[#00E6A0]/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedService?.id === service.id ? 'bg-[#00E6A0] border-[#00E6A0]' : 'border-white/10'
                                                }`}>
                                                {selectedService?.id === service.id && <Check size={14} className="text-[#050505]" />}
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
                                {selectedService ? (
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 bg-[#00E6A0]/10 rounded-2xl flex items-center justify-center text-[#00E6A0] flex-none">
                                            <Scissors size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Active Treatment</p>
                                            <p className="text-lg font-bold text-white">{selectedService.name}</p>
                                        </div>
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
                                        <p className="text-4xl font-black text-white">₹{selectedService?.price || 0}</p>
                                    </div>
                                    {selectedService && (
                                        <div className="text-right">
                                            <p className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest mb-1">Includes GST</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmBooking}
                                disabled={!selectedService}
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
