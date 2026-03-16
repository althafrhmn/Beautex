import React, { useState, useEffect } from 'react';
import {
    Calendar, User, Clock, CheckCircle,
    XCircle, MoreVertical, Search, Filter,
    TrendingUp, Users, Scissors, DollarSign,
    Shield, Briefcase, Mail, Phone, ExternalLink
} from 'lucide-react';
import api from '../../utils/api';
import { supabase } from '../../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';


const BookingManagerAdmin = () => {
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [stats, setStats] = useState({ totalBookings: 0, revenue: 0, totalStaff: 0, totalCustomers: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings'); // bookings, customers, staff
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch Bookings
            const bookingsRes = await api.get('/bookings/all');
            setBookings(bookingsRes.data.bookings || []);

            // Fetch Customers
            const customersRes = await api.get('/admin/customers');
            setCustomers(customersRes.data.customers || []);

            // Fetch Staff
            const staffRes = await api.get('/admin/staff');
            setStaffList(staffRes.data.staff || []);

            // Fetch Detailed Stats
            const statsRes = await api.get('/admin/stats');
            if (statsRes.data.stats) {
                setStats(statsRes.data.stats);
            }

        } catch (err) {
            console.error('Error fetching administration data:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            fetchAllData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-[#00E6A0]/10 text-[#00E6A0] border-[#00E6A0]/20';
            case 'rescheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-white/5 text-gray-400 border-white/10';
        }
    };

    const tabs = [
        { id: 'bookings', label: 'Reservation Ledger', icon: Calendar },
        { id: 'customers', label: 'Customer Database', icon: User },
        { id: 'staff', label: 'Artisan Roster', icon: Scissors }
    ];

    const filteredBookings = bookings.filter(b =>
        b.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredStaff = staffList.filter(s =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-32 pt-10">
            {/* Administration Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 text-[#00E6A0] font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                        <Shield size={14} /> Administration Board
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">
                        System <span className="text-gray-500 italic">Command</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Global oversight of all Beautex operations and members.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={fetchAllData} className="px-6 py-3 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white text-xs font-bold uppercase tracking-widest hover:border-[#00E6A0]/30 transition-all flex items-center gap-2">
                        Refresh Sync
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Omni-search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#0A0A0A] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:outline-none focus:border-[#00E6A0]/30 text-white min-w-[250px] transition-all"
                        />
                    </div>
                </div>
            </header>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, icon: DollarSign, color: 'text-white' },
                    { label: 'Active Slots', value: stats.totalBookings || 0, icon: Calendar, color: 'text-white' },
                    { label: 'Joined Artisans', value: stats.totalStaff || 0, icon: Scissors, color: 'text-[#00E6A0]' },
                    { label: 'Registered Boutique', value: stats.totalCustomers || 0, icon: User, color: 'text-white' }
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-[#00E6A0]/20 transition-all shadow-2xl"
                    >
                        <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon size={80} />
                        </div>
                        <p className="text-gray-700 font-black uppercase tracking-widest text-[9px] mb-3">{stat.label}</p>
                        <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Command Tabs */}
            <div className="flex gap-2 p-1.5 bg-[#0A0A0A] border border-white/5 rounded-[2rem] w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-[#00E6A0] text-[#050505] shadow-lg shadow-[#00E6A0]/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl"
                >
                    <div className="overflow-x-auto">
                        {activeTab === 'bookings' && (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                        <th className="px-10 py-8">Customer Identity</th>
                                        <th className="px-10 py-8">Service & Venue</th>
                                        <th className="px-10 py-8">Schedule</th>
                                        <th className="px-10 py-8">Artisan</th>
                                        <th className="px-10 py-8">Status</th>
                                        <th className="px-10 py-8 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredBookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="font-bold text-white mb-1 group-hover:text-[#00E6A0] transition-colors">{b.customer?.full_name}</div>
                                                <div className="text-xs text-gray-500 font-medium">Ref: {b.booking_number}</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-sm font-bold text-white mb-1">{b.booking_services?.[0]?.services?.name || 'Multiple Services'}</div>
                                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{b.salons?.name}</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-sm font-medium text-gray-300 mb-1">{b.booking_date}</div>
                                                <div className="text-sm font-black text-white">{b.start_time}</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[#00E6A0] text-xs font-black border border-white/10 group-hover:bg-[#00E6A0] group-hover:text-[#050505] transition-all">
                                                        {b.staff?.full_name?.[0] || 'A'}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{b.staff?.full_name || 'Assigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${getStatusColor(b.status)}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {b.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => updateStatus(b.id, 'confirmed')} className="p-3 bg-white/5 text-[#00E6A0] rounded-xl hover:bg-[#00E6A0] hover:text-[#050505] transition-all border border-white/5"><CheckCircle size={18} /></button>
                                                            <button onClick={() => updateStatus(b.id, 'cancelled')} className="p-3 bg-white/5 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-white/5"><XCircle size={18} /></button>
                                                        </>
                                                    )}
                                                    {b.status === 'confirmed' && (
                                                        <button onClick={() => updateStatus(b.id, 'completed')} className="px-6 py-3 bg-[#00E6A0] text-[#050505] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#00E6A0]/10">Mark Complete</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'customers' && (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                        <th className="px-10 py-8">Member Name</th>
                                        <th className="px-10 py-8">Contact Information</th>
                                        <th className="px-10 py-8">Join Date</th>
                                        <th className="px-10 py-8">Activity Status</th>
                                        <th className="px-10 py-8 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredCustomers.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-lg">
                                                        {c.full_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-[#00E6A0] transition-colors">{c.full_name}</div>
                                                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Premium Member</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 text-sm text-gray-300 mb-1"><Mail size={14} className="text-[#00E6A0]" /> {c.email}</div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500"><Phone size={14} className="text-[#00E6A0]" /> {c.phone_number || 'No Phone'}</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-sm font-medium text-gray-400">{new Date(c.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                {c.lastBooking ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Last Activity</span>
                                                        <span className="text-xs text-white font-bold">{new Date(c.lastBooking.date).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest italic">No Recent Flow</span>
                                                )}
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="p-3 bg-white/5 text-gray-500 rounded-xl hover:text-white hover:bg-white/10 transition-all border border-white/5"><ExternalLink size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'staff' && (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                        <th className="px-10 py-8">Specialist</th>
                                        <th className="px-10 py-8">Access Level</th>
                                        <th className="px-10 py-8">Email Channel</th>
                                        <th className="px-10 py-8">Joined System</th>
                                        <th className="px-10 py-8 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredStaff.map((s) => (
                                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-[1.25rem] overflow-hidden border-2 border-white/10 group-hover:border-[#00E6A0]/50 transition-all">
                                                        {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#00E6A0] text-[#050505] flex items-center justify-center font-black">{s.full_name?.[0]}</div>}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-[#00E6A0] transition-colors">{s.full_name}</div>
                                                        <div className="text-[10px] text-[#00E6A0] font-black uppercase tracking-widest">Certified Artisan</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2">
                                                    <Shield size={14} className="text-amber-500" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-white">{s.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-sm font-medium text-gray-400">{s.email}</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-sm font-medium text-gray-500">{new Date(s.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#00E6A0] hover:bg-[#00E6A0] hover:text-[#050505] transition-all">Schedules</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {((activeTab === 'bookings' && filteredBookings.length === 0) ||
                        (activeTab === 'customers' && filteredCustomers.length === 0) ||
                        (activeTab === 'staff' && filteredStaff.length === 0)) && (
                            <div className="p-32 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-700">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Vault Entry Empty</h3>
                                <p className="text-gray-500 max-w-xs text-sm">No records found matching your current filter in this system module.</p>
                            </div>
                        )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default BookingManagerAdmin;
