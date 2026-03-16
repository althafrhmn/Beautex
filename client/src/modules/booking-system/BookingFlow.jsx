import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Calendar, Clock,
    ArrowLeft, ArrowRight, CheckCircle,
    Scissors, Info, ShieldCheck,
    Check, Plus, Phone, CreditCard, Lock, RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';

const BookingFlow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Salon, 2: Services, 3: Date&Time, 4: Personal Details, 5: Payment, 6: Success

    const [salons, setSalons] = useState([]);
    const [services, setServices] = useState([]);
    const [shopServices, setShopServices] = useState([]);

    const [slots, setSlots] = useState([]);

    const [selectedSalon, setSelectedSalon] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [bookingNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [showQRModal, setShowQRModal] = useState(false);
    const [userUpiId, setUserUpiId] = useState('');
    const [error, setError] = useState(null);

    // Personal Details step
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [aadhar, setAadhar] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());

    // Mock data
    const mockSalons = [
        { id: '1', name: 'Glam Makeovers Kottakkal', city: 'Kottakkal', rating: 4.8, reviews: '1.2K', image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', address: 'Pallippuram Arcade', phone: '+91 98470 12345', timing: '9:00 AM - 8:00 PM' },
        { id: '2', name: 'Toni&Guy Essensuals', city: 'Malappuram', rating: 4.9, reviews: '2.5K', image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800', address: 'Up Hill', phone: '+91 98470 99999', timing: '9:30 AM - 9:00 PM' },
        { id: '3', name: 'Enchanted Spa & Wellness', city: 'Kochi', rating: 4.7, reviews: '3.1K', image_url: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=800', address: 'Marine Drive', phone: '+91 98470 77777', timing: '8:00 AM - 10:00 PM' },
        { id: '4', name: 'The Royal Grooming Studio', city: 'Tirur', rating: 4.6, reviews: '950', image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800', address: 'Central Plaza', phone: '+91 98470 66666', timing: '10:00 AM - 8:00 PM' },
        { id: '5', name: 'Aesthetic Elite', city: 'Perintalmanna', rating: 4.9, reviews: '1.8K', image_url: 'https://images.unsplash.com/photo-1600607687940-497f1f6262c0?auto=format&fit=crop&q=80&w=800', address: 'City Centre', phone: '+91 98470 55555', timing: '9:00 AM - 9:00 PM' }
    ];

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



    useEffect(() => {
        fetchSalons();
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (location.state?.salon) {
            const initialStep = 2;
            handleSalonSelect(location.state.salon, initialStep);

            // If a service was passed, pre-select it
            if (location.state.service && services.length > 0) {
                // Find the dynamic version of the service for this shop
                const currentShopServices = getShopServices(location.state.salon, services);
                const found = currentShopServices.find(s => s.original_id === location.state.service.id || s.id === location.state.service.id);
                if (found) {
                    setSelectedServices([found]);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, services.length > 0]);

    const fetchSalons = async () => {
        try {
            const res = await api.get('/salons');
            setSalons(res.data?.salons || []);
        } catch (err) { 
            console.error('Fetch salons error:', err);
            setError('Could not load salons from the sanctuary.');
        }
    };

    const fetchServices = async () => {
        try {
            const res = await api.get('/services');
            setServices(res.data?.services || []);
        } catch (err) { 
            console.error('Fetch services error:', err);
            setError('Could not load rituals from the archive.');
        }
    };



    const fetchSlots = async (date) => {
        if (!selectedSalon) return;
        setLoading(true);
        try {
            const duration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
            const { data } = await api.get('/availability/slots', {
                params: {
                    salon_id: selectedSalon.id,
                    staff_id: null,
                    date,
                    duration_minutes: duration || 30
                }
            });
            if (data.slots && data.slots.length > 0) {
                setSlots(data.slots);
            } else {
                const generated = [];
                for (let i = 9; i <= 20; i++) {
                    generated.push({ time: `${i.toString().padStart(2, '0')}:00`, available: true });
                    generated.push({ time: `${i.toString().padStart(2, '0')}:30`, available: true });
                }
                setSlots(generated);
            }
        } catch (err) {
            console.error('Fetch slots error:', err);
            const generated = [];
            for (let i = 9; i <= 20; i++) {
                generated.push({ time: `${i.toString().padStart(2, '0')}:00`, available: true });
                generated.push({ time: `${i.toString().padStart(2, '0')}:30`, available: true });
            }
            setSlots(generated);
        } finally { setLoading(false); }
    };

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

    const handleSalonSelect = (salon, targetStep = 2) => {
        setSelectedSalon(salon);
        setShopServices(getShopServices(salon, services));
        fetchSlots(selectedDate);
        setStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleService = (service) => {
        if (!service) return;
        const isSelected = selectedServices.find(s => s.id === service.id);
        if (isSelected) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleConfirmBooking = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { state: { from: '/bookings' } });
                return;
            }

            // 1. Create Initial Pending Booking
            const res = await api.post('/bookings', {
                salon_id: selectedSalon.id,
                service_ids: selectedServices.map(s => s.original_id || s.id),
                staff_id: null,
                booking_date: selectedDate,
                start_time: selectedSlot,
                notes: bookingNote,
                payment_method: paymentMethod
            });

            const booking = res.data.booking;

            if (paymentMethod === 'online') {
                // Razorpay Flow
                const isLoaded = await loadRazorpay();
                if (!isLoaded) {
                    throw new Error('Razorpay SDK failed to load. Are you online?');
                }

                const orderRes = await api.post('/payments/create-order', {
                    booking_id: booking.id
                });

                const { order_id, amount, currency, key_id } = orderRes.data;

                const options = {
                    key: key_id,
                    amount: amount,
                    currency: currency,
                    name: "Beautex Luxe",
                    description: `Payment for ${selectedServices.length} services`,
                    image: "https://beautex-luxe.vercel.app/logo.png",
                    order_id: order_id,
                    handler: async function (response) {
                        try {
                            setLoading(true);
                            const verifyRes = await api.post('/payments/verify-payment', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                booking_id: booking.id
                            });

                            setConfirmation(verifyRes.data.booking);
                            setStep(6);
                        } catch {
                            setError('Payment verification failed. Please contact support.');
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).full_name : "",
                        email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : "",
                        contact: ""
                    },
                    theme: {
                        color: "#00E6A0"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    setError(response.error.description);
                });
                rzp.open();
            } else {
                // QR Code Flow
                setConfirmation(booking);
                setShowQRModal(true);
            }

        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Booking failed.');
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);


    // Calendar generation
    const getDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            days.push({
                full: d.toISOString().split('T')[0],
                dayNum: d.getDate(),
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                month: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }
        return days;
    };
    const days = getDays();

    if (step === 6 && confirmation) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-[#00E6A0] rounded-full flex items-center justify-center mb-8 shadow-lg">
                    <CheckCircle size={48} className="text-[#050505]" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Reservation Successful!</h2>
                <p className="text-gray-500 max-w-sm mb-10">Your appointment at {selectedSalon?.name || 'the shop'} has been confirmed. You can view details in your booking history.</p>
                <div className="bg-[#0A0A0A] p-8 rounded-3xl shadow-sm border border-white/5 w-full max-w-md mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Booking ID</p>
                            <p className="font-bold text-white">#{confirmation.booking_number || 'BK-8821'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Paid</p>
                            <p className="font-bold text-[#00E6A0]">₹{totalPrice}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 text-left border-t border-white/5 pt-6">
                        <div className="flex items-center gap-4">
                            <Calendar size={20} className="text-[#00E6A0]" />
                            <div>
                                <p className="font-bold text-white">{new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                <p className="text-sm text-gray-500">Reach Shop By: {selectedSlot}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4 mt-2">
                            <Scissors size={20} className="text-[#00E6A0] mt-1" />
                            <div>
                                <p className="font-bold text-white mb-1">Rituals Booked</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedServices.map(s => (
                                        <span key={s.id} className="text-xs bg-white/5 px-2 py-1 rounded-md text-gray-300 border border-white/5">
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-full max-w-md gap-4">
                    <button onClick={() => navigate('/my-bookings')} className="w-full py-4 bg-[#00E6A0] text-[#050505] rounded-2xl font-bold shadow-xl">Manage Appointments</button>
                    <button onClick={() => setStep(1)} className="w-full py-4 bg-white/5 text-white border border-white/5 rounded-2xl font-bold">New Booking</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
            {/* Header */}
            <div className="bg-[#0A0A0A] border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black tracking-tight">
                        {step === 1 ? 'Explore Shops' :
                         step === 2 ? 'Select Services' :
                         step === 3 ? 'Select Date & Time' :
                         step === 4 ? 'Your Details' : 'Payment Details'}
                    </h1>
                    <div className="w-10" />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 pt-8">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-black tracking-tight">Select a Shop</h2>
                            <div className="grid gap-6">
                                {salons.map(salon => (
                                    <div
                                        key={salon.id}
                                        onClick={() => handleSalonSelect(salon)}
                                        className="bg-[#0A0A0A] rounded-[2.5rem] p-6 border border-white/5 shadow-sm hover:border-[#00E6A0]/20 transition-all cursor-pointer group flex gap-6"
                                    >
                                        <div className="w-24 h-24 rounded-3xl overflow-hidden flex-none">
                                            <img src={salon.image_url} className="w-full h-full object-cover group-hover:scale-110 opacity-70 group-hover:opacity-100 transition-transform duration-700" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-black mb-1 truncate text-white group-hover:text-[#00E6A0] transition-colors">{salon.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <MapPin size={14} className="text-[#00E6A0]" />
                                                <span className="truncate">{salon.address}, {salon.city}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                                <span className="text-sm font-bold text-white">{salon.rating}</span>
                                                <span className="text-[10px] text-gray-500 font-medium">({salon.reviews})</span>
                                            </div>
                                        </div>
                                        <div className="self-center p-3 bg-white/5 rounded-2xl text-gray-500 group-hover:bg-[#00E6A0] group-hover:text-[#050505] transition-colors">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step >= 2 && step <= 3 && (
                        <motion.div
                            key={`step${step}`}
                            {...{initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }}}
                            className="space-y-12 pb-10"
                        >
                            {/* Selected Shop Card - Always show on Steps 2-4 */}
                            {selectedSalon && (
                                <div className="bg-[#0A0A0A] rounded-[2.5rem] p-6 border border-white/5 shadow-sm flex items-center justify-between">
                                    <div className="max-w-[180px]">
                                        <p className="text-[10px] font-black text-[#00E6A0] uppercase tracking-[0.2em] mb-2">Selected Shop</p>
                                        <h3 className="text-xl font-black mb-1">{selectedSalon.name}</h3>
                                        <p className="text-xs text-gray-500 mb-1 truncate">{selectedSalon.address}, {selectedSalon.city}</p>
                                        {selectedSalon.phone && <p className="text-[10px] text-gray-600 mb-1 flex items-center gap-1"><Phone size={10} className="text-[#00E6A0]" /> {selectedSalon.phone}</p>}
                                        {selectedSalon.timing && <p className="text-[10px] text-gray-600 mb-3 flex items-center gap-1"><Clock size={10} className="text-[#00E6A0]" /> {selectedSalon.timing}</p>}
                                        <div className="flex items-center gap-1 bg-white/5 w-fit px-2 py-1 rounded-lg">
                                            <Star size={12} className="text-amber-400 fill-amber-400" />
                                            <span className="text-[10px] font-bold text-gray-400">{selectedSalon.rating} ({selectedSalon.reviews})</span>
                                        </div>
                                    </div>
                                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden">
                                        <img src={selectedSalon.image_url} className="w-full h-full object-cover opacity-80" alt="" />
                                    </div>
                                </div>
                            )}

                            {/* Services Section */}
                            {step === 2 && (
                            <section>
                                <h4 className="text-lg font-black mb-6">Select Services</h4>
                                {/* Categories */}
                                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                                    {['All', ...new Set(shopServices.map(s => s.category))].map(cat => (
                                        <div key={cat} className="px-4 py-2 rounded-full border border-white/10 bg-[#0A0A0A] whitespace-nowrap text-sm font-bold text-gray-300 hover:text-white hover:border-white/30 cursor-pointer">
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    {shopServices.map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => toggleService(service)}
                                            className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4 ${selectedServices.find(s => s.id === service.id) ? 'bg-[#00E6A0]/10 border-[#00E6A0]' : 'bg-[#0A0A0A] border-white/5'}`}
                                        >
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedServices.find(s => s.id === service.id) ? 'bg-[#00E6A0] border-[#00E6A0]' : 'border-white/10'}`}>
                                                {selectedServices.find(s => s.id === service.id) && <Check size={14} className="text-[#050505]" />}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-bold text-white">{service.name}</h5>
                                                <p className="text-xs text-gray-500">{service.category} • {service.duration_minutes} mins</p>
                                            </div>
                                            <span className="font-black text-lg text-white">₹{service.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            )}

                            {/* Date & Time Section */}
                            {step === 3 && (
                            <>
                                <section>
                                    <div className="flex items-center justify-between mb-6 mt-4">
                                        <h4 className="text-lg font-black text-white">{days.find(d => d.full === selectedDate)?.month}</h4>
                                        <Calendar size={20} className="text-gray-500" />
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                        {days.map(d => (
                                            <div
                                                key={d.full}
                                                onClick={() => { setSelectedDate(d.full); setSelectedSlot(null); fetchSlots(d.full); }}
                                                className={`w-16 h-20 rounded-[2rem] border flex flex-col items-center justify-center gap-1 transition-all flex-none cursor-pointer ${selectedDate === d.full ? 'bg-[#00E6A0] border-[#00E6A0] text-[#050505] shadow-lg' : 'bg-[#0A0A0A] border-white/5 text-gray-500 hover:border-[#00E6A0]/30'}`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{d.dayName}</span>
                                                <span className="text-xl font-black">{d.dayNum}</span>
                                                {selectedDate === d.full && <div className="w-1 h-1 bg-[#050505] rounded-full mt-1" />}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-8 mt-8">
                                    <h4 className="text-lg font-black mb-6">Select Time</h4>
                                    <div>
                                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Morning</h5>
                                        <div className="grid grid-cols-3 gap-3">
                                            {slots.filter(s => parseInt(s.time) < 13).map((s, i) => (
                                                <button
                                                    key={i}
                                                    disabled={!s.available}
                                                    onClick={() => setSelectedSlot(s.time)}
                                                    className={`py-4 rounded-2xl border text-sm font-black transition-all ${!s.available ? 'opacity-10 cursor-not-allowed grayscale' : selectedSlot === s.time ? 'bg-[#00E6A0] border-[#00E6A0] text-[#050505]' : 'bg-[#0A0A0A] border-white/5 text-white hover:border-[#00E6A0]/30'}`}
                                                >
                                                    {s.time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Afternoon</h5>
                                        <div className="grid grid-cols-3 gap-3">
                                            {slots.filter(s => parseInt(s.time) >= 13).map((s, i) => (
                                                <button
                                                    key={i}
                                                    disabled={!s.available}
                                                    onClick={() => setSelectedSlot(s.time)}
                                                    className={`py-4 rounded-2xl border text-sm font-black transition-all ${!s.available ? 'opacity-10 cursor-not-allowed grayscale' : selectedSlot === s.time ? 'bg-[#00E6A0] border-[#00E6A0] text-[#050505]' : 'bg-[#0A0A0A] border-white/5 text-white hover:border-[#00E6A0]/30'}`}
                                                >
                                                    {s.time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {loading && (
                                        <div className="flex justify-center mt-8">
                                            <div className="w-8 h-8 border-4 border-[#00E6A0] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </section>
                            </>
                            )}

                            {error && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold flex gap-3">
                                    <Info size={18} /> {error}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 pb-10"
                        >
                            <h4 className="text-xl font-black tracking-tight">Your Details</h4>
                            <p className="text-gray-500 text-sm">Please fill in your details to confirm the appointment.</p>

                            {/* Full Name */}
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-1">
                                <label className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest">Full Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="w-full bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600"
                                />
                            </div>

                            {/* Phone + OTP */}
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-4">
                                <label className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest block">Phone Number * (OTP Verification)</label>
                                <div className="flex gap-3">
                                    <input
                                        type="tel"
                                        placeholder="+91 XXXXXXXXXX"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        disabled={otpVerified}
                                        className="flex-1 bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600 disabled:opacity-50"
                                    />
                                    {!otpVerified && (
                                        <button
                                            onClick={() => { if (phone.length >= 10) setOtpSent(true); }}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0] border border-[#00E6A0]/30 px-4 py-2 rounded-xl hover:bg-[#00E6A0] hover:text-black transition-all whitespace-nowrap"
                                        >
                                            {otpSent ? 'Resend' : 'Send OTP'}
                                        </button>
                                    )}
                                    {otpVerified && (
                                        <span className="text-[#00E6A0] text-xs font-black flex items-center gap-1"><CheckCircle size={14}/> Verified</span>
                                    )}
                                </div>
                                {otpSent && !otpVerified && (
                                    <div className="flex gap-3 mt-2">
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            maxLength={6}
                                            className="flex-1 bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600 tracking-widest"
                                        />
                                        <button
                                            onClick={() => { if (otp.length === 6) setOtpVerified(true); }}
                                            className="text-[10px] font-black uppercase tracking-widest text-black bg-[#00E6A0] px-4 py-2 rounded-xl hover:bg-white transition-all"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                )}
                                {otpSent && !otpVerified && <p className="text-[10px] text-gray-500">📩 OTP sent to {phone}. (Demo: any 6 digits)</p>}
                            </div>

                            {/* Date of Birth */}
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-1">
                                <label className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest">Date of Birth *</label>
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={e => setDob(e.target.value)}
                                    className="w-full bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors"
                                />
                            </div>

                            {/* Address */}
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-1">
                                <label className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest">Address *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Street, City, State, PIN"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="w-full bg-transparent text-white text-sm py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600 resize-none"
                                />
                            </div>

                            {/* Aadhar (optional) */}
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-1">
                                <label className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest">Aadhaar Card Number <span className="text-gray-600 normal-case tracking-normal font-normal">(Optional)</span></label>
                                <input
                                    type="text"
                                    placeholder="XXXX XXXX XXXX"
                                    value={aadhar}
                                    onChange={e => setAadhar(e.target.value)}
                                    maxLength={14}
                                    className="w-full bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600 tracking-widest"
                                />
                            </div>

                            {/* Captcha */}
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-4">
                                <label className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest block">Security Captcha *</label>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 font-black text-xl tracking-[0.4em] text-white select-none" style={{fontFamily:'monospace', letterSpacing:'0.5em'}}>
                                        {captchaCode}
                                    </div>
                                    <Lock size={20} className="text-gray-500" />
                                    <RefreshCw size={16} className="text-gray-600" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Type the code above"
                                    value={captchaInput}
                                    onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
                                    className="w-full bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600 tracking-widest"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex gap-3">
                                    <Info size={18} /> {error}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div
                            key="step6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10 pb-10"
                        >
                            <div className="bg-[#0A0A0A] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                    <ShieldCheck size={120} className="text-[#00E6A0]" />
                                </div>
                                <h3 className="text-2xl font-black mb-8">Booking Summary</h3>
                                <div className="space-y-6">
                                    {selectedServices.map(s => (
                                        <div key={s.id} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                                            <div>
                                                <p className="font-bold text-white">{s.name}</p>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.duration_minutes} mins</p>
                                            </div>
                                            <p className="font-black text-white">₹{s.price}</p>
                                        </div>
                                    ))}
                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <div className="flex justify-between items-center text-sm text-gray-400">
                                            <span>Subtotal</span>
                                            <span>₹{totalPrice}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-400">
                                            <span>Service Tax (0%)</span>
                                            <span>₹0</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4">
                                            <span className="text-lg font-black text-white">Grand Total</span>
                                            <span className="text-3xl font-black text-[#00E6A0]">₹{totalPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section>
                                <h4 className="text-lg font-black mb-6">Payment Method</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'online', name: 'Instant Pay', desc: 'Secure Razorpay', icon: ShieldCheck },
                                        { id: 'qr', name: 'UPI QR Scan', desc: 'Scan any app', icon: CreditCard }
                                    ].map(method => (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer flex items-center gap-6 ${paymentMethod === method.id ? 'bg-[#00E6A0]/10 border-[#00E6A0]' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === method.id ? 'bg-[#00E6A0] text-black shadow-lg shadow-[#00E6A0]/20' : 'bg-white/5 text-gray-500'}`}>
                                                <method.icon size={24} />
                                            </div>
                                            <div>
                                                <h5 className={`font-black tracking-tight ${paymentMethod === method.id ? 'text-[#00E6A0]' : 'text-white'}`}>{method.name}</h5>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{method.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl flex gap-4 items-start">
                                <Info size={20} className="text-emerald-500 mt-1" />
                                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                    Your payment is processed securely. By proceeding, you agree to our <span className="text-white underline">Terms of Service</span> and <span className="text-white underline">Cancellation Policy</span>.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sticky Footer */}
            {(step >= 2 && step <= 5) && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/5 p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <div className="max-w-2xl mx-auto">
                        {step === 2 && (
                            <button
                                disabled={selectedServices.length === 0}
                                onClick={() => { fetchSlots(selectedDate); setStep(3); }}
                                className={`w-full py-5 rounded-[1.5rem] text-lg font-black text-[#050505] flex items-center justify-center gap-3 shadow-lg transition-all ${selectedServices.length > 0 ? 'bg-[#00E6A0] hover:bg-white shadow-[#00E6A0]/20' : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-500 shadow-none'}`}
                            >
                                Select Date & Time <ArrowRight size={18} />
                            </button>
                        )}
                        {step === 3 && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="text-xs font-bold text-gray-500">
                                        {selectedServices.length} Rituals Selected
                                    </div>
                                    <div className="text-xs font-bold text-[#00E6A0]">
                                        Total: ₹{totalPrice}
                                    </div>
                                </div>
                                <button
                                    disabled={!selectedSlot || loading}
                                    onClick={() => setStep(4)}
                                    className={`w-full py-5 rounded-[1.5rem] text-lg font-black text-[#050505] flex items-center justify-center gap-3 shadow-lg transition-all ${selectedSlot ? 'bg-[#00E6A0] hover:bg-white shadow-[#00E6A0]/20' : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-500 shadow-none'}`}
                                >
                                    Your Details <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                        {step === 4 && (() => {
                            const isValid = fullName.trim() && otpVerified && dob && address.trim() && captchaInput === captchaCode;
                            return (
                                <button
                                    disabled={!isValid}
                                    onClick={() => { if (isValid) { setError(null); setStep(5); } else { setError('Please complete all required fields and verify your phone number & captcha.'); } }}
                                    className={`w-full py-5 rounded-[1.5rem] text-lg font-black text-[#050505] flex items-center justify-center gap-3 shadow-lg transition-all ${isValid ? 'bg-[#00E6A0] hover:bg-white shadow-[#00E6A0]/20' : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-500 shadow-none'}`}
                                >
                                    Proceed to Payment <ArrowRight size={18} />
                                </button>
                            );
                        })()}
                        {step === 5 && (
                            <button
                                disabled={loading}
                                onClick={handleConfirmBooking}
                                className={`w-full py-5 rounded-[1.5rem] text-lg font-black text-[#050505] flex items-center justify-center gap-3 shadow-lg shadow-[#00E6A0]/20 bg-[#00E6A0] hover:bg-white active:scale-95 transition-all`}
                            >
                                {loading ? 'Processing...' : `Pay & Confirm Ritual • ₹${totalPrice}`}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* QR Payment Modal */}
            <AnimatePresence>
                {showQRModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0A0A0A] border border-white/5 rounded-[4rem] p-12 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 p-12 text-[#00E6A0] opacity-5 -mr-12 -mt-12"><CreditCard size={200} /></div>

                            <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.4em] mb-8">Scan to Pay</p>
                            <h3 className="text-3xl font-black text-white mb-2 leading-none">Instant <br /> UPI Transfer</h3>
                            <p className="text-gray-400 text-xs mb-8">Pay to: <strong>Muhammed Nafih</strong></p>

                            <div className="bg-white p-4 rounded-[2.5rem] mb-4 shadow-2xl shadow-[#00E6A0]/10 inline-block overflow-hidden">
                                <img src="/assets/muhammed_nafih_qr.jpg" alt="Payment QR Code" className="w-[140px] h-[140px] object-cover rounded-[1.5rem]" />
                            </div>
                            <p className="text-gray-500 text-xs mb-6 font-medium bg-white/5 inline-block px-4 py-2 rounded-xl text-white">UPI ID: nafihnafp@oksbi</p>

                            <div className="text-left bg-white/5 p-5 rounded-3xl border border-white/5 mb-6">
                                <label className="text-[10px] text-[#00E6A0] font-black uppercase tracking-[0.1em] mb-2 block">2. Enter your UPI ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g., yourname@oksbi"
                                    value={userUpiId}
                                    onChange={(e) => setUserUpiId(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/20 text-white text-sm pb-2 placeholder:text-gray-600 focus:outline-none focus:border-[#00E6A0] transition-colors"
                                />
                                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">Provide the UPI ID you paid from so the shop can verify your payment.</p>
                            </div>

                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        await api.post('/payments/verify-qr', {
                                            booking_id: confirmation.id,
                                            user_upi_id: userUpiId
                                        });
                                        setShowQRModal(false);
                                        setStep(7);
                                    } catch {
                                        setError('Could not verify QR payment.');
                                        setShowQRModal(false);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="w-full py-5 bg-[#00E6A0] hover:bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#00E6A0]/20"
                            >
                                {loading ? 'Verifying...' : 'I have completed payment'}
                            </button>

                            <button
                                onClick={() => setShowQRModal(false)}
                                className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Cancel Transaction
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookingFlow;
