import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Calendar, Clock,
    ArrowLeft, ArrowRight, CheckCircle,
    Scissors, Info, ShieldCheck,
    Check, Plus, Phone, CreditCard, Lock, RefreshCw,
    ChevronRight, User, QrCode, X, Award
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../utils/api';
// eslint-disable-next-line no-unused-vars
import { useDispatch } from 'react-redux';
import { updateUser } from '../../redux/authSlice';
import { AnimatePresence, motion } from 'framer-motion';

const BookingFlow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 1. Initial data extraction to avoid useEffect flicker
    const getInitialData = () => {
        let bookingData = location.state;
        const storedPending = sessionStorage.getItem('pendingBooking');
        
        if (!bookingData?.salon && storedPending) {
            try {
                bookingData = JSON.parse(storedPending);
                // Keep it in session until fully consumed or initialized
            } catch (e) {
                console.error("Could not parse pending booking", e);
            }
        }
        return bookingData;
    };

    const initialBookingData = getInitialData();
    const isPreselected = !!initialBookingData?.salon;

    const [step, setStep] = useState(isPreselected ? 2 : 1); 
    const [selectedSalon, setSelectedSalon] = useState(initialBookingData?.salon || null);
    const [selectedServices, setSelectedServices] = useState(initialBookingData?.service ? [initialBookingData?.service] : []);
    const [selectedProducts, setSelectedProducts] = useState(initialBookingData?.products || []);
    
    // 2. Regular state
    const [salons, setSalons] = useState([]);
    const [services, setServices] = useState([]);
    const [shopServices, setShopServices] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [slots, setSlots] = useState([]);

    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [bookingNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [paymentType, setPaymentType] = useState('full');
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrBooking, setQrBooking] = useState(null);
    const [userUpiId, setUserUpiId] = useState('');
    const [error, setError] = useState(null);
    const [usePoints, setUsePoints] = useState(false);
    
    // Get user from local storage
    const storedUserStr = localStorage.getItem('user');
    const currentUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    const userPoints = currentUser?.loyalty_points || 0;

    // Personal Details step
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [aadhar, setAadhar] = useState('');


    // Mock data
    const mockSalons = [
        { id: '1', name: 'Glam Makeovers Kottakkal', city: 'Kottakkal', rating: 0, reviews: '0', image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', address: 'Pallippuram Arcade', phone: '+91 98470 12345', timing: '9:00 AM - 8:00 PM' },
        { id: '2', name: 'Toni&Guy Essensuals', city: 'Malappuram', rating: 0, reviews: '0', image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800', address: 'Up Hill', phone: '+91 98470 99999', timing: '9:30 AM - 9:00 PM' },
        { id: '3', name: 'Enchanted Spa & Wellness', city: 'Kochi', rating: 0, reviews: '0', image_url: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=800', address: 'Marine Drive', phone: '+91 98470 77777', timing: '8:00 AM - 10:00 PM' },
        { id: '4', name: 'The Royal Grooming Studio', city: 'Tirur', rating: 0, reviews: '0', image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800', address: 'Central Plaza', phone: '+91 98470 66666', timing: '10:00 AM - 8:00 PM' },
        { id: '5', name: 'Aesthetic Elite', city: 'Perintalmanna', rating: 0, reviews: '0', image_url: 'https://images.unsplash.com/photo-1600607687940-497f1f6262c0?auto=format&fit=crop&q=80&w=800', address: 'City Centre', phone: '+91 98470 55555', timing: '9:00 AM - 9:00 PM' }
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
        const init = async () => {
            setLoading(true);
            try {
                // Fetch basic lists
                const [allSalons, allServices] = await Promise.all([
                    fetchSalons(),
                    fetchServices()
                ]);

                // If we have a pre-selected salon, initialize its specific services
                if (selectedSalon) {
                    try {
                        const res = await api.get(`/shops/${selectedSalon.id}/services`);
                        if (res.data.services?.length > 0) {
                            setShopServices(res.data.services);
                            
                            // Map pre-selected services to their shop-specific versions
                            if (initialBookingData?.service) {
                                const found = res.data.services.find(s => s.original_id === initialBookingData.service.id || s.id === initialBookingData.service.id);
                                if (found) setSelectedServices([found]);
                            }
                        } else {
                            const filtered = getShopServices(selectedSalon, allServices || []);
                            setShopServices(filtered);
                            
                            // Map pre-selected services to their shop-specific versions
                            if (initialBookingData?.service) {
                                const found = filtered.find(s => s.original_id === initialBookingData.service.id || s.id === initialBookingData.service.id);
                                if (found) setSelectedServices([found]);
                            }
                        }
                    } catch (err) {
                        const filtered = getShopServices(selectedSalon, allServices || []);
                        setShopServices(filtered);
                        if (initialBookingData?.service) {
                            const found = filtered.find(s => s.original_id === initialBookingData.service.id || s.id === initialBookingData.service.id);
                            if (found) setSelectedServices([found]);
                        }
                    }
                    fetchStaff(selectedSalon.id);
                }
            } catch (err) {
                console.error("Initialization error:", err);
            } finally {
                setLoading(false);
            }
        };

        init();
        
        // Clean up pending booking once initialized
        if (sessionStorage.getItem('pendingBooking')) {
            sessionStorage.removeItem('pendingBooking');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSalons = async () => {
        try {
            const res = await api.get('/salons');
            const data = res.data?.salons || [];
            setSalons(data);
            return data;
        } catch (err) { 
            console.error('Fetch salons error:', err);
            setError('Could not load salons from the sanctuary.');
            return [];
        }
    };

    const fetchServices = async () => {
        try {
            const res = await api.get('/services');
            const data = res.data?.services || [];
            setServices(data);
            return data;
        } catch (err) { 
            console.error('Fetch services error:', err);
            setError('Could not load rituals from the archive.');
            return [];
        }
    };



    const fetchSlots = async (date) => {
        if (!selectedSalon) return;
        setLoading(true);
        try {
            const duration = selectedServices.reduce((sum, s) => sum + (parseInt(s.duration_minutes) || 60), 0);
            const { data } = await api.get('/availability/slots', {
                params: {
                    salon_id: selectedSalon.id,
                    staff_id: selectedStaff?.id || null,
                    date,
                    duration_minutes: duration || 30
                }
            });
            const todayStr = new Date().toISOString().split('T')[0];
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            
            const filterPastSlots = (slotsArray) => {
                return slotsArray.map(slot => {
                    if (date === todayStr) {
                        const [h, m] = slot.time.split(':').map(Number);
                        const slotMinutes = h * 60 + m;
                        // Disable if less than 30 mins away
                        if (slotMinutes <= currentMinutes + 30) {
                            return { ...slot, available: false };
                        }
                    }
                    return slot;
                });
            };

            if (data.slots && data.slots.length > 0) {
                setSlots(filterPastSlots(data.slots));
            } else {
                const generated = [];
                for (let i = 9; i <= 20; i++) {
                    const time1 = `${i.toString().padStart(2, '0')}:00`;
                    const time2 = `${i.toString().padStart(2, '0')}:30`;
                    
                    // Filter lunch break (12:30-1:30)
                    if (time1 !== "13:00") generated.push({ time: time1, available: true });
                    if (time2 !== "12:30") generated.push({ time: time2, available: true });
                }
                setSlots(filterPastSlots(generated.sort((a,b) => a.time.localeCompare(b.time))));
            }
        } catch (err) {
            console.error('Fetch slots error:', err);
            const todayStr = new Date().toISOString().split('T')[0];
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            
            const filterPastSlots = (slotsArray) => {
                return slotsArray.map(slot => {
                    if (date === todayStr) {
                        const [h, m] = slot.time.split(':').map(Number);
                        const slotMinutes = h * 60 + m;
                        if (slotMinutes <= currentMinutes + 30) {
                            return { ...slot, available: false };
                        }
                    }
                    return slot;
                });
            };

            const generated = [];
            for (let i = 9; i <= 20; i++) {
                const time1 = `${i.toString().padStart(2, '0')}:00`;
                const time2 = `${i.toString().padStart(2, '0')}:30`;
                
                // Filter lunch break (12:30-1:30)
                if (time1 !== "13:00") generated.push({ time: time1, available: true });
                if (time2 !== "12:30") generated.push({ time: time2, available: true });
            }
            setSlots(filterPastSlots(generated.sort((a,b) => a.time.localeCompare(b.time))));
        } finally { setLoading(false); }
    };

    // Helper to generate unique services and pricing per shop
    const getShopServices = (salon, allServices) => {
        if (!salon) return allServices;
        const salonId = salon.id;
        const idNum = typeof salonId === 'string' ? salonId.charCodeAt(0) + (parseInt(salonId) || 0) : salonId;
        
        const tags = salon.tags || [];
        const isAllSalon = tags.includes('All Related Salon') || tags.length === 0;
        const hasHair = tags.includes('Hair Cutting Styles') || isAllSalon;
        const hasBeautician = tags.includes('Beautician Styles') || tags.includes('Bridal & Makeup') || isAllSalon;
        const hasBridal = tags.includes('Bridal & Makeup') || isAllSalon;

        const filtered = allServices.filter((s, i) => {
            const cat = (s.category || '').toLowerCase();
            // Category-based filtering from tags
            if (cat === 'hair' && !hasHair) return false;
            if (cat === 'bridal' && !hasBridal) return false;
            if ((cat === 'skin' || cat === 'nails' || cat === 'massage') && !hasBeautician) return false;
            
            // For other shops/tags, don't drop everything
            return true;
        });

        return filtered.map((s, i) => {
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

    const fetchStaff = async (salonId, serviceId = null) => {
        try {
            const res = await api.get(`/availability/staff/${salonId}`, {
                params: { service_id: serviceId }
            });
            setStaffList(res.data?.staff || []);
        } catch (err) {
            console.error('Fetch staff error:', err);
            setStaffList([]);
        }
    };

    const handleSalonSelect = async (salon, targetStep = 2) => {
        setLoading(true);
        setSelectedSalon(salon);
        try {
            const res = await api.get(`/shops/${salon.id}/services`);
            if (res.data.services && res.data.services.length > 0) {
                setShopServices(res.data.services);
            } else {
                setShopServices(getShopServices(salon, services));
            }
        } catch (err) {
            console.error('Error fetching shop services:', err);
            setShopServices(getShopServices(salon, services));
        } finally {
            setLoading(false);
        }
        
        fetchStaff(salon.id);
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

    const handleConfirmBooking = async (methodOverride = null) => {
        setLoading(true);
        setError(null);
        
        // Use override if provided, otherwise use current state
        const finalMethod = methodOverride || paymentMethod;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { state: { from: '/bookings' } });
                return;
            }

            // Determine customer ID if logged in
            let customer_id = null;
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    customer_id = JSON.parse(storedUser).id;
                }
            } catch (e) {}

            // 1. Create Initial Pending Booking
            const res = await api.post('/bookings', {
                salon_id: selectedSalon.id,
                service_ids: selectedServices.map(s => s.original_id || s.id),
                products: selectedProducts.map(p => ({ product_id: p.product.id, quantity: p.quantity, price: p.product.price })),
                staff_id: selectedStaff?.id || null,
                booking_date: selectedDate,
                start_time: selectedSlot,
                notes: bookingNote,
                payment_method: finalMethod,
                payment_type: paymentType,
                customer_id,
                use_points: usePoints, // Pass redemption flag
                // Guest details
                guest_name: fullName,
                guest_email: email,
                guest_phone: phone
            });

            const booking = res.data.booking;

            if (finalMethod === 'online') {
                // Razorpay Flow
                const isLoaded = await loadRazorpay();
                if (!isLoaded) {
                    throw new Error('Razorpay SDK failed to load. Are you online?');
                }

                const orderRes = await api.post('/payments/create-order', {
                    booking_id: booking.id,
                    amount: paymentType === 'advance' ? Math.ceil(booking.total_price / 2) : booking.total_price
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
                            // Optimistically update loyalty points in Redux
                            const ptsEarned = paymentType === 'full' ? Math.floor(amount / 100) : 0;
                            const storedUser = localStorage.getItem('user');
                            if (storedUser) {
                                try {
                                    const pUser = JSON.parse(storedUser);
                                    const currentPts = pUser.loyalty_points || 0;
                                    const newPts = Math.max(0, currentPts - discountAmount) + ptsEarned;
                                    dispatch(updateUser({ loyalty_points: newPts }));
                                } catch(e){}
                            }
                            setStep(6);
                        } catch {
                            setError('Payment verification failed. Please contact support.');
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).full_name : (fullName || ""),
                        email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : (email || ""),
                        contact: phone || ""
                    },
                    theme: {
                        color: "#00E6A0"
                    },
                    modal: {
                        ondismiss: function() {
                            setLoading(false);
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    setError(response.error.description);
                });
                rzp.open();

            } else if (finalMethod === 'qr') {
                // UPI QR Code Flow — show custom QR modal
                setQrBooking(booking);
                setShowQRModal(true);
            }

        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Booking failed.');
        } finally {
            setLoading(false);
        }
    };

    const servicesPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const productsPrice = selectedProducts.reduce((sum, p) => sum + (parseFloat(p.product.price) * p.quantity), 0);
    const totalPrice = servicesPrice + productsPrice;
    
    const maxDiscountAllowed = paymentType === 'full' ? Math.floor(servicesPrice * 0.20) : 0;
    const discountAmount = (usePoints && paymentType === 'full') ? Math.min(userPoints, maxDiscountAllowed) : 0;
    const finalAmount = totalPrice - discountAmount;
    const payableAmount = paymentType === 'advance' ? Math.ceil(finalAmount / 2) : finalAmount;


    // Calendar generation
    const getDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
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

    if ((step === 6 || step === 7) && confirmation) {
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
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mt-1 flex items-center justify-end gap-1">
                                <Award size={10} /> +{Math.floor(totalPrice / 100)} Points
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 text-left border-t border-white/5 pt-6">
                        <div className="flex items-center gap-4">
                            <Calendar size={20} className="text-[#00E6A0]" />
                            <div>
                                <p className="font-bold text-white">{new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                <p className="text-sm text-gray-500">Reach Shop By: {selectedSlot} • {selectedStaff ? `Expert: ${selectedStaff.full_name}` : 'Any Expert'}</p>
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
                    <button 
                        onClick={() => {
                            if (step === 2 && isPreselected) {
                                navigate(-1);
                            } else if (step > 1) {
                                setStep(step - 1);
                            } else {
                                navigate(-1);
                            }
                        }} 
                        className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black tracking-tight">
                        {step === 1 ? 'Explore Shops' :
                         step === 2 ? 'Select Services' :
                         step === 3 ? 'Select Expert' :
                         step === 4 ? 'Select Date & Time' :
                         step === 5 ? 'Your Details' : 'Payment Details'}
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

                    {step >= 2 && step <= 4 && (
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

                            {/* Staff Selection Step */}
                            {step === 3 && (
                                <section>
                                    <h4 className="text-lg font-black mb-6">Select Expert</h4>
                                    <div className="grid gap-4">
                                        {/* Any Available Option */}
                                        <div
                                            onClick={() => { setSelectedStaff(null); setStep(4); fetchSlots(selectedDate); }}
                                            className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between ${selectedStaff === null ? 'bg-[#00E6A0]/10 border-[#00E6A0]' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                                                    <Plus size={24} />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-white">Any Available Expert</h5>
                                                    <p className="text-xs text-gray-500 italic">Fastest booking experience</p>
                                                </div>
                                            </div>
                                            {selectedStaff === null && <CheckCircle size={20} className="text-[#00E6A0]" />}
                                        </div>

                                        {staffList.map(staff => (
                                            <div
                                                key={staff.id}
                                                onClick={() => { setSelectedStaff(staff); setStep(4); fetchSlots(selectedDate); }}
                                                className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between ${selectedStaff?.id === staff.id ? 'bg-[#00E6A0]/10 border-[#00E6A0]' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5">
                                                        {staff.avatar_url ? (
                                                            <img src={staff.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                <User size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-white">{staff.full_name}</h5>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0]">{staff.specialization || 'Professional Artist'}</p>
                                                    </div>
                                                </div>
                                                {selectedStaff?.id === staff.id && <CheckCircle size={20} className="text-[#00E6A0]" />}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Date & Time Section */}
                            {step === 4 && (
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

                    {step === 5 && (
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

                            {/* Email + OTP */}
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-4">
                                <label className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest block">Email Address * (OTP Verification)</label>
                                <div className="flex gap-3">
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        disabled={otpVerified}
                                        className="flex-1 bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600 disabled:opacity-50"
                                    />
                                    {!otpVerified && (
                                        <button
                                            onClick={async () => { 
                                                if (email.includes('@')) {
                                                    setLoading(true);
                                                    try {
                                                        await api.post('/auth/guest-otp', { email });
                                                        setOtpSent(true); 
                                                        setError(null);
                                                    } catch (err) {
                                                        setError('Failed to send OTP. Try again.');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }
                                            }}
                                            disabled={loading}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0] border border-[#00E6A0]/30 px-4 py-2 rounded-xl hover:bg-[#00E6A0] hover:text-black transition-all whitespace-nowrap disabled:opacity-50"
                                        >
                                            {loading ? 'Sending...' : otpSent ? 'Resend' : 'Send Code'}
                                        </button>
                                    )}
                                    {otpVerified && (
                                        <span className="text-[#00E6A0] text-xs font-black flex items-center gap-1"><CheckCircle size={14}/> Identity Locked</span>
                                    )}
                                </div>
                                {otpSent && !otpVerified && (
                                    <div className="flex gap-3 mt-2">
                                        <input
                                            type="text"
                                            placeholder="6-digit Ritz Code"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            maxLength={6}
                                            className="flex-1 bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600 tracking-widest"
                                        />
                                        <button
                                            onClick={async () => { 
                                                if (otp.length === 6) {
                                                    setLoading(true);
                                                    try {
                                                        await api.post('/auth/verify-guest-otp', { email, code: otp });
                                                        setOtpVerified(true);
                                                        setError(null);
                                                    } catch (err) {
                                                        setError('Invalid code. Please check your email.');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }
                                            }}
                                            disabled={loading}
                                            className="text-[10px] font-black uppercase tracking-widest text-black bg-[#00E6A0] px-4 py-2 rounded-xl hover:bg-white transition-all disabled:opacity-50"
                                        >
                                            {loading ? '...' : 'Verify'}
                                        </button>
                                    </div>
                                )}
                                {otpSent && !otpVerified && <p className="text-[10px] text-gray-500">📩 Code sent to {email}. Check your inbox.</p>}
                            </div>

                            {/* Optional Phone */}
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-1">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Phone Number (Optional)</label>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit number"
                                    value={phone}
                                    maxLength={10}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setPhone(val);
                                    }}
                                    className="w-full bg-transparent text-white text-base py-2 border-b border-white/10 focus:outline-none focus:border-[#00E6A0] transition-colors placeholder:text-gray-600"
                                />
                            </div>


                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex gap-3">
                                    <Info size={18} /> {error}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 6 && (
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
                                        
                                        {/* Loyalty Point Redemption */}
                                        <div className="pt-4 border-t border-white/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Award size={16} className="text-[#00E6A0]" />
                                                    <span className="text-sm font-black text-white">Loyalty Balance: {userPoints} PTS</span>
                                                </div>
                                            </div>
                                            
                                            {paymentType !== 'full' ? (
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
                                                    Available on Full Payment
                                                </p>
                                            ) : userPoints < 100 ? (
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
                                                    Need 100+ points to redeem
                                                </p>
                                            ) : (
                                                <div className="flex items-center justify-between bg-[#00E6A0]/5 p-3 rounded-xl border border-[#00E6A0]/20 mt-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-[#00E6A0] block">
                                                            Use {maxDiscountAllowed} Points?
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            Save ₹{maxDiscountAllowed} (Max 20%)
                                                        </span>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer"
                                                            checked={usePoints}
                                                            onChange={(e) => setUsePoints(e.target.checked)}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E6A0]"></div>
                                                    </label>
                                                </div>
                                            )}
                                        </div>

                                        {usePoints && discountAmount > 0 && (
                                            <div className="flex justify-between items-center text-sm text-[#00E6A0] font-bold">
                                                <span>Points Discount</span>
                                                <span>-₹{discountAmount}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-4">
                                            <span className="text-lg font-black text-white">Grand Total</span>
                                            <span className="text-3xl font-black text-[#00E6A0]">₹{finalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section>
                                <h4 className="text-lg font-black mb-6">Payment Option</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                    <div
                                        onClick={() => setPaymentType('advance')}
                                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex flex-col justify-center items-center text-center gap-2 ${paymentType === 'advance' ? 'bg-[#00E6A0]/10 border-[#00E6A0]' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}
                                    >
                                        <h5 className={`font-black tracking-tight text-xl ${paymentType === 'advance' ? 'text-[#00E6A0]' : 'text-white'}`}>50% Advance</h5>
                                        <p className="text-xs text-gray-500 font-bold">Pay ₹{Math.ceil(finalAmount / 2)} now to reserve</p>
                                    </div>
                                    <div
                                        onClick={() => setPaymentType('full')}
                                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex flex-col justify-center items-center text-center gap-2 relative overflow-hidden ${paymentType === 'full' ? 'bg-[#00E6A0]/10 border-[#00E6A0]' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="absolute top-0 right-0 bg-[#00E6A0] text-black text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
                                            <Award size={10} /> Earn Points
                                        </div>
                                        <h5 className={`font-black tracking-tight text-xl ${paymentType === 'full' ? 'text-[#00E6A0]' : 'text-white'}`}>Full Payment</h5>
                                        <p className="text-xs text-gray-500 font-bold">Pay ₹{finalAmount} now</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-lg font-black">Payment Method</h4>
                                    <span className="text-sm font-black text-[#00E6A0]">Payable: ₹{payableAmount}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'online', name: 'Instant Pay', desc: 'Secure Razorpay', icon: ShieldCheck },
                                        { id: 'qr', name: 'UPI QR Scan', desc: 'Scan any app', icon: QrCode }
                                    ].map(method => (
                                        <div
                                            key={method.id}
                                            onClick={() => {
                                                if (!loading) {
                                                    setPaymentMethod(method.id);
                                                    handleConfirmBooking(method.id);
                                                }
                                            }}
                                            className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer flex items-center gap-6 ${paymentMethod === method.id ? 'bg-[#00E6A0]/10 border-[#00E6A0]' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === method.id ? 'bg-[#00E6A0] text-black shadow-lg shadow-[#00E6A0]/20' : 'bg-white/5 text-gray-500'}`}>
                                                {loading && paymentMethod === method.id ? (
                                                    <RefreshCw size={24} className="animate-spin" />
                                                ) : (
                                                    <method.icon size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <h5 className={`font-black tracking-tight ${paymentMethod === method.id ? 'text-[#00E6A0]' : 'text-white'}`}>{method.name}</h5>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{loading && paymentMethod === method.id ? 'Connecting...' : method.desc}</p>
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
                                onClick={() => { 
                                    setStep(3); 
                                    if (selectedSalon) {
                                        // Filter experts by the first selected service ritual
                                        const serviceId = selectedServices[0]?.original_id || selectedServices[0]?.id;
                                        fetchStaff(selectedSalon.id, serviceId);
                                    }
                                }}
                                className={`w-full py-5 rounded-[1.5rem] text-lg font-black text-[#050505] flex items-center justify-center gap-3 shadow-lg transition-all ${selectedServices.length > 0 ? 'bg-[#00E6A0] hover:bg-white shadow-[#00E6A0]/20' : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-500 shadow-none'}`}
                            >
                                Select Expert <ArrowRight size={18} />
                            </button>
                        )}
                        {step === 3 && (
                            <button
                                onClick={() => { setSelectedStaff(null); setStep(4); fetchSlots(selectedDate); }}
                                className="w-full py-5 rounded-[1.5rem] text-lg font-black text-white bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                            >
                                Skip to Date & Time
                            </button>
                        )}
                        {step === 4 && (
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
                                    disabled={!selectedSlot}
                                    onClick={() => setStep(5)}
                                    className={`flex-1 py-5 rounded-[1.5rem] text-lg font-black text-[#050505] flex items-center justify-center gap-3 shadow-lg transition-all ${selectedSlot ? 'bg-[#00E6A0] hover:bg-white shadow-[#00E6A0]/20' : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-500 shadow-none'}`}
                                >
                                    Your Details <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                        {step === 5 && (
                            <button
                                disabled={!fullName || !email || !otpVerified || (phone !== '' && phone.length !== 10)}
                                onClick={() => setStep(6)}
                                className={`w-full py-5 rounded-[1.5rem] text-lg font-black text-[#050505] flex items-center justify-center gap-3 shadow-lg transition-all ${fullName && email && otpVerified && (phone === '' || phone.length === 10) ? 'bg-[#00E6A0] hover:bg-white shadow-[#00E6A0]/20' : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-500 shadow-none'}`}
                            >
                                Review & Pay <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* UPI QR Payment Modal */}
            <AnimatePresence>
                {showQRModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 30 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-[#0D0D0D] border border-white/10 rounded-[3rem] p-10 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00E6A0]/5 rounded-full blur-3xl" />
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="absolute top-5 right-5 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>

                            {/* Header */}
                            <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.4em] mb-3 relative">UPI Payment</p>
                            <h3 className="text-2xl font-black text-white mb-1 relative">Scan & Pay</h3>
                            <p className="text-xs text-gray-500 mb-8 relative">Use any UPI app to scan the code below</p>

                            {/* QR Code */}
                            <div className="bg-white p-5 rounded-[2rem] mb-6 shadow-xl shadow-[#00E6A0]/10 inline-block relative">
                                <QRCodeSVG
                                    value={`upi://pay?pa=beautex@upi&pn=Beautex%20Luxe&am=${payableAmount || 0}&cu=INR&tn=Booking%20for%20${selectedServices?.length || 0}%20services`}
                                    size={190}
                                    level="H"
                                    includeMargin={false}
                                    bgColor="#FFFFFF"
                                    fgColor="#050505"
                                />
                            </div>

                            {/* Amount */}
                            <div className="mb-2 relative">
                                <p className="text-3xl font-black text-white">₹{payableAmount}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total payable amount</p>
                            </div>

                            {/* UPI ID */}
                            <p className="text-xs text-gray-600 mb-8 relative">UPI ID: <span className="text-gray-400 font-mono">beautex@upi</span></p>

                            {/* Apps row */}
                            <div className="flex justify-center gap-4 mb-8 relative">
                                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                                    <div key={app} className="text-center">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                                            <QrCode size={16} className="text-gray-400" />
                                        </div>
                                        <p className="text-[8px] text-gray-600 font-bold">{app}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Confirm button */}
                            <button
                                disabled={loading}
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        if (qrBooking?.id) {
                                            await api.post('/payments/verify-qr', {
                                                booking_id: qrBooking.id
                                            });
                                            // Optimistically update loyalty points in Redux (only for full payment)
                                            const ptsEarned = paymentType === 'full' ? Math.floor(payableAmount / 100) : 0;
                                            const storedUser = localStorage.getItem('user');
                                            if (storedUser) {
                                                try {
                                                    const pUser = JSON.parse(storedUser);
                                                    const currentPts = pUser.loyalty_points || 0;
                                                    const newPts = Math.max(0, currentPts - discountAmount) + ptsEarned;
                                                    dispatch(updateUser({ loyalty_points: newPts }));
                                                } catch(e){}
                                            }
                                        }
                                    } catch (err) {
                                        console.warn('Could not verify QR payment server-side:', err.message);
                                        // Still proceed to success screen — booking is pending at worst
                                    } finally {
                                        setLoading(false);
                                    }
                                    setShowQRModal(false);
                                    setConfirmation(qrBooking || { booking_number: 'QR-PAY' });
                                    setStep(6);
                                }}
                                className={`w-full py-4 bg-[#00E6A0] hover:bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#00E6A0]/20 relative mb-3 ${loading ? 'opacity-60 cursor-wait' : ''}`}
                            >
                                {loading ? 'Confirming...' : '✓ I have completed payment'}
                            </button>

                            <button
                                onClick={() => setShowQRModal(false)}
                                className="text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-white transition-colors relative"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default BookingFlow;
