import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Search,
    Filter,
    Clock,
    User,
    Scissors,
    MoreVertical,
    CheckCircle,
    XCircle,
    RotateCcw,
    AlertCircle,
    Briefcase,
    Plus,
    X,
    Save,
    Building,
    Sparkles,
    MapPin
} from 'lucide-react';
import api from '../../../utils/api';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [staff, setStaff] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [services, setServices] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Form Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        customerId: '',
        serviceId: '',
        staffId: '',
        shopId: '',
        bookingDate: '',
        startTime: '',
        notes: '',
        manualCustomerName: '',
        manualCustomerPhone: ''
    });

    useEffect(() => {
        fetchBookings();
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [staffRes, customerRes, serviceRes, shopRes] = await Promise.all([
                api.get('/admin/staff'),
                api.get('/admin/customers'),
                api.get('/services'),
                api.get('/shops')
            ]);
            setStaff(staffRes.data.staff || []);
            setCustomers(customerRes.data.customers || []);
            setServices(serviceRes.data.services || []);
            setShops(shopRes.data.salons || shopRes.data.shops || []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/all');
            setBookings(response.data.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            fetchBookings();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAssignStaff = async (bookingId, staffId) => {
        try {
            await api.patch(`/bookings/${bookingId}/assign`, { staffId });
            fetchBookings();
        } catch (error) {
            console.error('Error assigning staff:', error);
        }
    };

    const handleAddBooking = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/bookings', {
                customer_id: formData.customerId,
                service_ids: [formData.serviceId],
                staff_id: formData.staffId,
                salon_id: formData.shopId,
                booking_date: formData.bookingDate,
                start_time: formData.startTime,
                notes: formData.notes,
                payment_method: 'unpaid'
            });
            fetchBookings();
            setIsFormOpen(false);
            setFormData({
                customerId: '',
                serviceId: '',
                staffId: '',
                shopId: '',
                bookingDate: '',
                startTime: '',
                notes: '',
                manualCustomerName: '',
                manualCustomerPhone: ''
            });
        } catch (error) {
            console.error('Error creating booking:', error);
            alert(error.response?.data?.error || 'Failed to create booking');
        } finally {
            setSaving(false);
        }
    };

    const statusColors = {
        pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        confirmed: 'bg-[#00E6A0]/10 text-[#00E6A0] border-[#00E6A0]/20',
        completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
        rescheduled: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.booking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        return (matchesSearch || !searchQuery) && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Booking Management</h2>
                    <p className="text-gray-400 text-sm mt-1 font-sans">Manage all salon appointments and schedules</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#1A1A1A] p-1.5 rounded-xl border border-[#2A2A2A]">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors font-sans ${statusFilter === status 
                                    ? 'bg-[#00E6A0] text-[#141414] shadow-sm' 
                                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] px-4 py-2 rounded-lg font-semibold transition-colors font-sans"
                    >
                        <Plus size={18} />
                        Add Booking
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID or Customer Name..."
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E6A0] transition-colors text-white font-sans"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-sans">
                        <thead className="text-xs uppercase bg-[#1A1A1A] text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold rounded-tl-lg">Booking ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Shop</th>
                                <th className="px-6 py-4 font-semibold">Service</th>
                                <th className="px-6 py-4 font-semibold">Staff</th>
                                <th className="px-6 py-4 font-semibold">Schedule</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading bookings...</td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 font-medium">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-[#00E6A0]">#{booking.booking_number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white text-xs font-bold">
                                                    {booking.customer?.full_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{booking.customer?.full_name}</p>
                                                    <p className="text-xs text-gray-400">{booking.customer?.phone_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Building size={14} className="text-[#00E6A0]" />
                                                <span className="font-medium">{booking.salons?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {booking.booking_services?.map((bs, i) => (
                                                <div key={i} className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Scissors size={14} className="text-[#00E6A0]" />
                                                        {bs.services?.name}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 ml-5 font-bold">₹{bs.services?.price || bs.price_at_booking}</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Briefcase size={14} className="text-[#00E6A0]" />
                                                    <span className="text-xs">{booking.staff?.full_name || 'Unassigned'}</span>
                                                </div>
                                                <select 
                                                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-gray-400 focus:outline-none focus:border-[#00E6A0]"
                                                    value={booking.staff_id || ''}
                                                    onChange={(e) => handleAssignStaff(booking.id, e.target.value)}
                                                >
                                                    <option value="">Assign Staff</option>
                                                    {staff.map(s => (
                                                        <option key={s.id} value={s.id}>{s.full_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-[#00E6A0]" />
                                                    {new Date(booking.booking_date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-[#00E6A0]" />
                                                    {booking.start_time} - {booking.end_time}
                                                </div>
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
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                        className="p-1.5 text-[#00E6A0] hover:bg-[#00E6A0]/10 rounded-lg transition-colors"
                                                        title="Approve Booking"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                        title="Mark as Completed"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        title="Cancel Booking"
                                                    >
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

            {/* Add Booking Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <div className="relative w-full max-w-lg bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-[#2A2A2A] pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white font-sans">Add Manual Booking</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Create an appointment for a guest or client</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddBooking} className="space-y-6">
                            {/* Customer Section */}
                            <div className="space-y-4 bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A]">
                                <h4 className="text-[11px] font-black text-[#00E6A0] uppercase tracking-[0.2em]">Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-sans">Customer Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Guest Name"
                                                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                                value={formData.manualCustomerName}
                                                onChange={(e) => setFormData({ ...formData, manualCustomerName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-sans">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-black tracking-tighter">+91</div>
                                            <input
                                                type="tel"
                                                placeholder="10-digit"
                                                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                                value={formData.manualCustomerPhone}
                                                onChange={(e) => setFormData({ ...formData, manualCustomerPhone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-[#2A2A2A]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                        <select
                                            className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-400 focus:outline-none focus:border-[#00E6A0] transition-colors appearance-none"
                                            value={formData.customerId}
                                            onChange={(e) => {
                                                const customer = customers.find(c => c.id === e.target.value);
                                                setFormData({ 
                                                    ...formData, 
                                                    customerId: e.target.value,
                                                    manualCustomerName: customer ? (customer.name || customer.full_name) : '',
                                                    manualCustomerPhone: customer ? (customer.phone_number || '') : ''
                                                });
                                            }}
                                        >
                                            <option value="">Or Select Existing Customer...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name || c.full_name} — {c.phone_number || 'No Phone'}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Selection Details Previews */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shop Selection */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-sans uppercase tracking-widest flex items-center gap-2">
                                            <Building size={14} className="text-[#00E6A0]" /> Shop/Salon
                                        </label>
                                        <select
                                            required
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors appearance-none"
                                            value={formData.shopId}
                                            onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                                        >
                                            <option value="">Select Shop</option>
                                            {shops.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {formData.shopId && (
                                        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#00E6A0]/20 animate-in fade-in zoom-in duration-300">
                                            {(() => {
                                                const shop = shops.find(s => s.id === formData.shopId);
                                                return (
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[#00E6A0]/10 flex items-center justify-center text-[#00E6A0] shrink-0">
                                                            <MapPin size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white leading-tight">{shop?.name}</p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{shop?.address}, {shop?.city}</p>
                                                            <span className="inline-block mt-2 px-2 py-0.5 bg-[#00E6A0]/10 text-[#00E6A0] text-[8px] font-black uppercase rounded border border-[#00E6A0]/20 tracking-widest">Selected Venue</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Service Selection */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 font-sans uppercase tracking-widest flex items-center gap-2">
                                            <Scissors size={14} className="text-[#00E6A0]" /> Service
                                        </label>
                                        <select
                                            required
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors appearance-none"
                                            value={formData.serviceId}
                                            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                        >
                                            <option value="">Select Service</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} — ₹{s.price}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.serviceId && (
                                        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#00E6A0]/20 animate-in fade-in zoom-in duration-300">
                                            {(() => {
                                                const service = services.find(s => s.id === formData.serviceId);
                                                return (
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[#00E6A0]/10 flex items-center justify-center text-[#00E6A0] shrink-0">
                                                            <Sparkles size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <p className="text-sm font-bold text-white leading-tight">{service?.name}</p>
                                                                <p className="text-sm font-black text-[#00E6A0]">₹{service?.price}</p>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{service?.description || 'Classic ritual for ultimate wellness.'}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                    <Clock size={10} /> {service?.duration_minutes} MINS
                                                                </span>
                                                                <span className="px-1.5 py-0.5 bg-white/5 text-gray-400 text-[8px] font-black uppercase rounded tracking-widest">{service?.category}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Staff Selection */}
                            <div className="space-y-4">
                                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-black text-[#00E6A0] uppercase tracking-[0.2em]">Assignment</h4>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">Optional Specialist Selection</span>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                                <select
                                                    className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors appearance-none"
                                                    value={formData.staffId}
                                                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                                >
                                                    <option value="">Select Staff</option>
                                                    {staff.map(s => (
                                                        <option key={s.id} value={s.id}>{s.full_name} — {s.role || 'Expert Stylist'}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {formData.staffId ? (
                                            <div className="flex-1 flex items-center gap-3 bg-[#141414] px-4 py-2 rounded-lg border border-[#00E6A0]/20 animate-in slide-in-from-right-2 duration-300">
                                                {(() => {
                                                    const s = staff.find(st => st.id === formData.staffId);
                                                    return (
                                                        <>
                                                            <div className="w-8 h-8 rounded-full bg-[#2A2A2A] overflow-hidden flex-shrink-0 border border-white/5">
                                                                {s?.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-[#00E6A0] uppercase">{s?.full_name[0]}</div>}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-white leading-tight">{s?.full_name}</p>
                                                                <p className="text-[9px] text-[#00E6A0] font-black uppercase tracking-widest mt-0.5">{s?.role || 'Expert'}</p>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#2A2A2A] rounded-lg px-4 py-2">
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Auto-Assign Enabled</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Appointment Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.bookingDate}
                                            onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Starting Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                        <input
                                            type="time"
                                            required
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                                    <RotateCcw size={12} /> Special Instructions (Notes)
                                </label>
                                <textarea
                                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors h-24 resize-none font-sans"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add any specific requirements for the master artist..."
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-4 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#00E6A0]/10"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <><Save size={18} /> Finalize Booking</>
                                    )}
                                </button>
                                <p className="text-[9px] text-gray-500 text-center mt-3 font-bold uppercase tracking-widest">The customer will receive an immediate confirmation</p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManagement;
