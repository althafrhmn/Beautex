import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    CalendarCheck,
    Users,
    Scissors,
    Briefcase,
    Store,
    Clock,
    UserPlus,
    Calendar as CalendarIcon,
    Edit2,
    Save,
    X,
    MapPin,
    Building,
    Image as ImageIcon,
    Globe,
    Phone,
    Check
} from 'lucide-react';
import api from '../../../utils/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StatCard = ({ label, value, icon: Icon, trend, colorClass }) => (
    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 transition-all hover:border-[#00E6A0]/30 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <Icon size={80} />
        </div>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl bg-[#1A1A1A] ${colorClass} border border-white/5 shadow-inner`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#00E6A0]/10 text-[#00E6A0] uppercase tracking-widest border border-[#00E6A0]/20">
                    {trend}
                </span>
            )}
        </div>
        <div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
            <h3 className="text-4xl font-black tracking-tighter text-white">{value}</h3>
        </div>
    </div>
);

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalStaff: 0,
        totalCustomers: 0,
        totalShops: 0,
        totalServices: 0
    });
    const [chartData, setChartData] = useState({ revenue: {}, dailyBookings: {}, recentActivities: [] });
    const [loading, setLoading] = useState(true);
    
    // Salon Edit States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data.stats || {});
            setChartData(response.data.charts || { revenue: {}, dailyBookings: {}, recentActivities: [] });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueLabels = months;
    const revenueValues = months.map(m => chartData.revenue[m] || 0);

    const revenueConfig = {
        labels: revenueLabels,
        datasets: [
            {
                label: 'Revenue (₹)',
                data: revenueValues,
                borderColor: '#00E6A0',
                backgroundColor: 'rgba(0, 230, 160, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#00E6A0',
            }
        ]
    };

    const bookingLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const bookingValues = bookingLabels.map(d => chartData.dailyBookings[d] || 0);

    const bookingsConfig = {
        labels: bookingLabels,
        datasets: [
            {
                label: 'Bookings',
                data: bookingValues,
                backgroundColor: '#3B82F6',
                borderRadius: 4,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: '#2A2A2A', drawBorder: false }, ticks: { color: '#888' } },
            x: { grid: { display: false, drawBorder: false }, ticks: { color: '#888' } }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-8 h-8 border-4 border-[#00E6A0] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white">System <span className="text-[#00E6A0]">Intelligence</span></h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Real-time performance metrics</p>
                </div>

                {stats.currentSalon && (
                    <div className="bg-[#141414] border border-[#00E6A0]/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-[#00E6A0]/5 animate-in slide-in-from-right duration-700">
                        <div className="w-12 h-12 rounded-xl bg-[#00E6A0]/10 flex items-center justify-center text-[#00E6A0]">
                            <Store size={24} />
                        </div>
                        <div className="pr-4 border-r border-[#2A2A2A]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0]">Active Sanctuary</p>
                            <h4 className="text-lg font-black text-white leading-tight">{stats.currentSalon.name}</h4>
                        </div>
                        <button 
                            onClick={() => {
                                setEditFormData({
                                    ...stats.currentSalon,
                                    location: stats.currentSalon.address,
                                    opening_time: stats.currentSalon.hours?.split(' - ')[0] || '',
                                    closing_time: stats.currentSalon.hours?.split(' - ')[1] || ''
                                });
                                setIsEditModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl bg-[#00E6A0] text-[#141414] hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-[#00E6A0]/20"
                            title="Edit Salon Profile"
                        >
                            <Edit2 size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Salon Edit Modal */}
            {isEditModalOpen && editFormData && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-[#0F1115] border border-[#2A2A2A] rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <p className="text-[#00E6A0] text-[10px] font-black uppercase tracking-widest mb-1">Salon Identity</p>
                                <h3 className="text-2xl font-black text-white">Edit Sanctuary Profile</h3>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setSaving(true);
                            try {
                                await api.put(`/shops/${editFormData.id}`, editFormData);
                                setIsEditModalOpen(false);
                                fetchStats();
                            } catch (error) {
                                console.error('Error updating shop:', error);
                                alert('Failed to update shop. Please try again.');
                            } finally {
                                setSaving(false);
                            }
                        }} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 px-1">Shop Name</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-all"
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 px-1">Address & Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-all"
                                            value={editFormData.location}
                                            onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 px-1">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type="tel"
                                                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-all"
                                                value={editFormData.phone}
                                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 px-1">City</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type="text"
                                                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-all"
                                                value={editFormData.city}
                                                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 px-1">Opens @</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type="time"
                                                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-all [color-scheme:dark]"
                                                value={editFormData.opening_time}
                                                onChange={(e) => setEditFormData({ ...editFormData, opening_time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 px-1">Closes @</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type="time"
                                                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-all [color-scheme:dark]"
                                                value={editFormData.closing_time}
                                                onChange={(e) => setEditFormData({ ...editFormData, closing_time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3 px-1">Shop Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-all"
                                            value={editFormData.image_url}
                                            onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3 px-1">Salon Specialties</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Hair Cutting Styles', 'Beautician Styles', 'Bridal & Makeup', 'Grooming', 'Nail Art', 'Massage & Spa', 'All Related Salon'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    const current = editFormData.tags || [];
                                                    const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
                                                    setEditFormData({ ...editFormData, tags: next });
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${editFormData.tags?.includes(cat) ? 'bg-[#00E6A0] border-[#00E6A0] text-[#141414]' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full mt-4 py-4 bg-[#00E6A0] hover:bg-white text-[#141414] rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#00E6A0]/20 active:scale-95"
                            >
                                {saving ? (
                                    <div className="w-6 h-6 border-4 border-[#141414] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><Save size={20} /> Update Salon Profile</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Platform Revenue" value={`₹${parseFloat(stats.totalRevenue).toLocaleString()}`} icon={DollarSign} trend="+12%" colorClass="text-[#00E6A0]" />
                <StatCard label="Verified Customers" value={stats.totalCustomers} icon={Users} trend="Active" colorClass="text-[#00E6A0]" />
                <StatCard label="Active Community" value={stats.totalStaff} icon={Briefcase} trend="Stylists" colorClass="text-[#00E6A0]" />
                <StatCard label="Total Services" value={stats.totalServices} icon={Scissors} trend="Catalog" colorClass="text-[#00E6A0]" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#3A3A3A] transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-6">Revenue Growth (Monthly)</h3>
                    <div className="h-[300px]">
                        <Line data={revenueConfig} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#3A3A3A] transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-6">Booking Density</h3>
                    <div className="h-[300px]">
                        <Bar data={bookingsConfig} options={chartOptions} />
                    </div>
                </div>
            </div>

            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#3A3A3A] transition-colors">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Activity Monitor</h3>
                <div className="space-y-4">
                    {chartData.recentActivities.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No recent activity detected.</p>
                    ) : (
                        chartData.recentActivities.map((activity) => (
                            <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#212121] transition-colors border border-[#2A2A2A]">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${
                                        activity.type === 'registration' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#00E6A0]/10 text-[#00E6A0]'
                                    }`}>
                                        {activity.type === 'registration' ? <UserPlus size={18} /> : <CalendarIcon size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{activity.title}</p>
                                        <p className="text-xs text-gray-400 font-medium">{activity.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-right">
                                    <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                        <Clock size={12} /> {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        activity.status === 'confirmed' ? 'bg-[#00E6A0]/10 text-[#00E6A0]' : 
                                        activity.status === 'new' ? 'bg-emerald-500/10 text-emerald-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                        {activity.status}
                                    </span>
                                    {activity.meta && (
                                        <span className="font-bold text-white text-sm tracking-tight opacity-70">#{activity.meta.split('-')[1]}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
