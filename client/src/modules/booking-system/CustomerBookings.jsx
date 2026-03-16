import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, MapPin, Scissors, XCircle,
    AlertCircle, ChevronRight, Hash, Phone,
    CheckCircle, MessageSquare, ArrowLeft, ArrowRight,
    Tag, CreditCard, Timer, ArrowUpRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
    const [reschedulingBooking, setReschedulingBooking] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newSlot, setNewSlot] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchData = async () => {
        try {
            const res = await api.get('/bookings/my-bookings');
            setBookings(res.data.bookings || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await api.patch(`/bookings/${id}/cancel`);
            fetchData();
        } catch (err) {
            alert('Failed to cancel booking');
        }
    };

    const handleRescheduleClick = (booking) => {
        setReschedulingBooking(booking);
        setNewDate(booking.booking_date);
        fetchRescheduleSlots(booking.booking_date, booking.salon_id, booking.staff_id);
    };

    const fetchRescheduleSlots = async (date, salonId, staffId) => {
        try {
            const res = await api.get('/availability/slots', {
                params: { salon_id: salonId, staff_id: staffId || 'auto', date }
            });
            setAvailableSlots(res.data.slots || []);
        } catch (err) {
            console.error('Error fetching reschedule slots:', err);
        }
    };

    const submitReschedule = async () => {
        if (!newSlot) return alert('Please select a time slot');
        try {
            await api.patch(`/bookings/${reschedulingBooking.id}/reschedule`, {
                booking_date: newDate,
                start_time: newSlot
            });
            setReschedulingBooking(null);
            setNewSlot('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Reschedule failed');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 bg-[#050505] min-h-screen">
            <div className="w-10 h-10 border-4 border-[#00E6A0] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Loading bookings...</p>
        </div>
    );

    const upcoming = bookings.filter(b => ['confirmed', 'pending', 'rescheduled'].includes(b.status));
    const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
    const displayedBookings = activeTab === 'upcoming' ? upcoming : past;

    const getTimeRemaining = (dateStr, timeStr) => {
        try {
            const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
            const now = new Date();
            const diffMs = bookingDateTime - now;
            if (diffMs < 0) return 'Passed';
            
            const diffMins = Math.floor(diffMs / 60000);
            const diffHrs = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHrs / 24);
            
            if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
            if (diffHrs > 0) return `in ${diffHrs} hr${diffHrs > 1 ? 's' : ''}`;
            return `in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
            <div className="max-w-xl mx-auto px-6">
                {/* Header */}
                <div className="py-8 flex items-center justify-center relative mb-8">
                    <button onClick={() => window.history.back()} className="absolute left-0 p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                    <h1 className="text-xl font-black tracking-tight text-white">My Bookings</h1>
                </div>

                {/* Tab Switcher */}
                <div className="bg-[#0A0A0A] p-1.5 rounded-[1.5rem] flex border border-white/5 mb-10 shadow-sm">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-3 rounded-[1.2rem] text-sm font-black transition-all ${activeTab === 'upcoming' ? 'bg-[#00E6A0] text-[#050505] shadow-sm' : 'text-gray-500 hover:text-white'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 py-3 rounded-[1.2rem] text-sm font-black transition-all ${activeTab === 'past' ? 'bg-[#00E6A0] text-[#050505] shadow-sm' : 'text-gray-500 hover:text-white'}`}
                    >
                        Past
                    </button>
                </div>

                {/* Booking List */}
                <div className="space-y-6">
                    {displayedBookings.length > 0 ? displayedBookings.map((b) => (
                        <motion.div
                            key={b.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0A0A0A] rounded-[2.5rem] p-6 border border-white/5 shadow-sm group hover:border-[#00E6A0]/20 transition-all"
                        >
                            <div className="flex gap-6 mb-6">
                                <div className="w-24 h-24 rounded-3xl overflow-hidden flex-none">
                                    <img src={b.salons?.image_url || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-[#00E6A0]/10 text-[#00E6A0]' : b.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {b.status}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500">#{b.booking_number || 'BK-0000'}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-white truncate group-hover:text-[#00E6A0] transition-colors">{b.salons?.name}</h3>
                                    
                                    {/* Styles Details */}
                                    <div className="flex flex-wrap gap-2 mb-3 mt-2">
                                        {b.booking_services?.map((s, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-gray-300 border border-white/5 flex items-center gap-1">
                                                <Tag size={10} className="text-[#00E6A0]" /> {s.services?.name}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2 mt-4 text-xs font-bold text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-[#00E6A0]" />
                                            <span>{new Date(b.booking_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-[#00E6A0]" />
                                            <span>Reach Shop By: <span className="text-white">{b.start_time}</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info Row */}
                            <div className="flex justify-between items-center gap-4 pt-4 pb-4 border-t border-white/5 text-xs">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1"><CreditCard size={12} className="text-[#00E6A0]" /> Payment</p>
                                    <p className="font-bold text-white flex items-center gap-2">₹{b.total_price || 0} <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-gray-400 border border-white/10 uppercase">{b.payment_method || 'Online'}</span></p>
                                </div>
                                {activeTab === 'upcoming' && (
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><Timer size={12} className="text-amber-400" /> Time to Start</p>
                                        <p className="font-black text-amber-400 uppercase tracking-wider">{getTimeRemaining(b.booking_date, b.start_time)}</p>
                                    </div>
                                )}
                            </div>

                            {activeTab === 'upcoming' && (
                                <div className="flex gap-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => handleRescheduleClick(b)}
                                        className="flex-1 py-4 bg-[#00E6A0]/10 text-[#00E6A0] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#00E6A0] hover:text-[#050505] transition-all"
                                    >
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={() => handleCancel(b.id)}
                                        className="flex-1 py-4 bg-white/5 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )) : (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-[#0A0A0A] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Scissors size={32} className="text-gray-500/30" />
                            </div>
                            <p className="text-gray-500 font-medium">No {activeTab} bookings found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reschedule Modal */}
            <AnimatePresence>
                {reschedulingBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0A0A0A] rounded-[3rem] p-10 max-w-sm w-full shadow-2xl relative border border-white/5"
                        >
                            <h3 className="text-2xl font-black text-white text-center mb-8">Adjust Time</h3>
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">New Date</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => {
                                            setNewDate(e.target.value);
                                            fetchRescheduleSlots(e.target.value, reschedulingBooking.salon_id, reschedulingBooking.staff_id);
                                        }}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-[#00E6A0] outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Available Slots</label>
                                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                                        {availableSlots.map((s, i) => (
                                            <button
                                                key={i}
                                                disabled={!s.available}
                                                onClick={() => setNewSlot(s.time)}
                                                className={`py-3 rounded-xl text-[11px] font-black border transition-all ${!s.available ? 'opacity-10 grayscale' : newSlot === s.time ? 'bg-[#00E6A0] border-[#00E6A0] text-[#050505]' : 'bg-white/5 border-transparent text-gray-400 hover:border-[#00E6A0]/30'}`}
                                            >
                                                {s.time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setReschedulingBooking(null)} className="flex-1 py-4 bg-white/5 text-gray-400 rounded-2xl font-bold text-xs hover:bg-white/10 transition-colors">Close</button>
                                    <button onClick={submitReschedule} className="flex-1 py-4 bg-[#00E6A0] text-[#050505] rounded-2xl font-bold text-xs shadow-lg shadow-[#00E6A0]/20 hover:bg-white transition-colors">Reschedule</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerBookings;
