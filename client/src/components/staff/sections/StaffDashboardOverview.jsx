import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../../../utils/api';

const StaffDashboardOverview = () => {
    const [stats, setStats] = useState({ todayAppointments: 0, upcomingBookings: 0, completedServices: 0 });
    const [todayBookings, setTodayBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                api.get('/staff/me/dashboard'),
                api.get('/staff/me/bookings')
            ]);
            setStats(statsRes.data.stats || {});
            
            const today = new Date().toISOString().split('T')[0];
            const todayOnly = (bookingsRes.data.bookings || []).filter(b => b.booking_date === today);
            setTodayBookings(todayOnly);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "Today's Appointments", value: stats.todayAppointments, icon: CalendarCheck, color: '#00E6A0' },
        { label: 'Upcoming Bookings', value: stats.upcomingBookings, icon: Clock, color: '#3B82F6' },
        { label: 'Completed Services', value: stats.completedServices, icon: CheckCircle, color: '#A855F7' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Staff Dashboard</h2>
                <p className="text-gray-400 text-sm mt-1">Your daily overview and performance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#3A3A3A] transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl" style={{ background: `${card.color}15` }}>
                                    <Icon size={20} style={{ color: card.color }} />
                                </div>
                                <TrendingUp size={16} className="text-gray-600" />
                            </div>
                            <p className="text-3xl font-bold text-white">{loading ? '—' : card.value}</p>
                            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Today's Schedule */}
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Today's Schedule</h3>
                {loading ? (
                    <p className="text-gray-500 text-sm">Loading...</p>
                ) : todayBookings.length === 0 ? (
                    <div className="text-center py-10">
                        <CalendarCheck size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayBookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#00E6A0] font-bold text-sm">
                                        {booking.customer?.full_name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{booking.customer?.full_name || 'Guest User'}</p>
                                        <p className="text-xs text-gray-500">{booking.customer?.phone_number || booking.guest_phone || booking.customer?.email || booking.guest_email || 'No contact info'}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {booking.booking_services?.map(bs => bs.services?.name).join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-[#00E6A0]">{booking.start_time} - {booking.end_time}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-md font-semibold capitalize ${
                                        booking.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                                        booking.status === 'confirmed' ? 'bg-[#00E6A0]/10 text-[#00E6A0]' :
                                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                        'bg-amber-500/10 text-amber-400'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboardOverview;
