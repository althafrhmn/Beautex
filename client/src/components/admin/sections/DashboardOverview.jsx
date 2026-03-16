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
    Calendar as CalendarIcon
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

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 transition-transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg bg-[#1A1A1A] ${colorClass}`}>
                <Icon size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                Live
            </span>
        </div>
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data.stats);
                setChartData(response.data.charts);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
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
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h2>
                    <p className="text-gray-400 text-sm mt-1">Real-time performance analytics for BeauteX</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard label="Total Revenue" value={`₹${parseFloat(stats.totalRevenue).toLocaleString()}`} icon={DollarSign} colorClass="text-[#00E6A0]" />
                <StatCard label="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} colorClass="text-blue-500" />
                <StatCard label="Total Customers" value={stats.totalCustomers} icon={Users} colorClass="text-emerald-500" />
                <StatCard label="Total Staff" value={stats.totalStaff} icon={Briefcase} colorClass="text-purple-500" />
                <StatCard label="Total Shops" value={stats.totalShops} icon={Store} colorClass="text-rose-500" />
                <StatCard label="Total Services" value={stats.totalServices} icon={Scissors} colorClass="text-amber-500" />
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
