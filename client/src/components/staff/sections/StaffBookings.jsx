import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Scissors, CheckCircle, XCircle } from 'lucide-react';
import api from '../../../utils/api';

const StaffBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/staff/me/bookings');
            setBookings(res.data.bookings || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/staff/me/bookings/${id}/status`, { status });
            fetchBookings();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const statusColors = {
        pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        confirmed: 'bg-[#00E6A0]/10 text-[#00E6A0] border-[#00E6A0]/20',
        completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    const filtered = bookings.filter(b => {
        const matchSearch = b.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        return (matchSearch || !searchQuery) && matchStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Bookings</h2>
                    <p className="text-gray-400 text-sm mt-1">View and manage your assigned appointments</p>
                </div>
                <div className="flex items-center gap-2 bg-[#1A1A1A] p-1.5 rounded-xl border border-[#2A2A2A]">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                                statusFilter === s ? 'bg-[#00E6A0] text-[#141414]' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
                            }`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="text" placeholder="Search by customer or booking ID..."
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E6A0] transition-colors"
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase bg-[#1A1A1A] text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold rounded-tl-lg">Customer Name</th>
                                <th className="px-6 py-4 font-semibold">Service</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Time</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading bookings...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">No bookings found.</td></tr>
                            ) : (
                                filtered.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#00E6A0] text-xs font-bold">
                                                    {booking.customer?.full_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{booking.customer?.full_name}</p>
                                                    <p className="text-xs text-gray-500">{booking.customer?.phone_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.booking_services?.map((bs, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-sm text-gray-300">
                                                    <Scissors size={12} className="text-[#00E6A0]" />
                                                    {bs.services?.name}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-300">
                                                <Calendar size={14} className="text-[#00E6A0]" />
                                                {new Date(booking.booking_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-300">
                                                <Clock size={14} className="text-[#00E6A0]" />
                                                {booking.start_time} - {booking.end_time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${statusColors[booking.status] || statusColors.pending}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {booking.status === 'pending' && (
                                                    <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                        className="p-1.5 text-[#00E6A0] hover:bg-[#00E6A0]/10 rounded-lg transition-colors" title="Confirm">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Complete">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                    <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Cancel">
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffBookings;
