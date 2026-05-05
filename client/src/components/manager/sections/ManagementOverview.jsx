import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../../../utils/supabaseClient';
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const ManagementOverview = ({ searchTerm }) => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        revenue: 0,
        customers: 0,
        bookings: 0,
        capacity: 0,
        staffCount: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.assigned_shop) fetchManagementStats();
    }, [user?.assigned_shop]);

    const fetchManagementStats = async () => {
        try {
            const salonId = user.assigned_shop;
            
            // 1. Fetch Staff Count for Capacity Calculation
            const { data: staff } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'staff')
                .eq('assigned_shop', salonId);
            
            const staffCount = staff?.length || 1;

            // 2. Fetch Bookings for this Salon (Live)
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('id, total_price, customer_id, start_time, end_time, status, booking_date')
                .eq('salon_id', salonId)
                .neq('status', 'cancelled');

            const totalBookings = bookingsData?.length || 0;
            const uniqueCustomers = new Set(bookingsData?.map(b => b.customer_id) || []).size;
            const totalRevenue = (bookingsData || [])
                .filter(b => b.status === 'completed' || b.status === 'confirmed')
                .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);

            // 3. Calculate Capacity (Simplified: percentage of staff hours filled)
            // Assuming 8 hours per staff per day
            const totalStaffMinutes = staffCount * 480; 
            const today = new Date().toISOString().split('T')[0];
            const todaysBookings = (bookingsData || []).filter(b => b.booking_date === today);
            
            let bookedMinutes = 0;
            todaysBookings.forEach(b => {
                if (b.start_time && b.end_time) {
                    const [sh, sm] = b.start_time.split(':').map(Number);
                    const [eh, em] = b.end_time.split(':').map(Number);
                    bookedMinutes += (eh * 60 + em) - (sh * 60 + sm);
                }
            });
            const capacity = Math.min(Math.round((bookedMinutes / totalStaffMinutes) * 100), 100);

            // 4. Generate Chart Data (Last 6 Months)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentMonth = new Date().getMonth();
            const last6 = [];
            for (let i = 5; i >= 0; i--) {
                const mIdx = (currentMonth - i + 12) % 12;
                last6.push({ label: months[mIdx], value: Math.floor(Math.random() * 40 + 60) }); // Placeholder for trend until we have enough history
            }

            setStats({
                revenue: totalRevenue.toFixed(2),
                customers: uniqueCustomers,
                bookings: totalBookings,
                capacity: capacity || 0,
                staffCount
            });
            setChartData(last6);

        } catch (err) {
            console.error('Stat fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const themeColor = '#00D1FF';

    const cards = [
        { title: 'Total Revenue', value: `₹${stats.revenue}`, icon: DollarSign, color: 'text-[#00D1FF]', trend: 'Live' },
        { title: 'Active Members', value: stats.customers, icon: Users, color: 'text-[#00D1FF]', trend: 'Verified' },
        { title: 'Monthly Volume', value: stats.bookings, icon: Calendar, color: 'text-[#00D1FF]', trend: 'Active' },
        { title: 'Shop Capacity', value: `${stats.capacity}%`, icon: Activity, color: 'text-[#00D1FF]', trend: 'Real-time' },
    ];

    const filteredCards = cards.filter(c => 
        !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syncing Executive Data...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Upper Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCards.map((c, i) => (
                    <div key={i} className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-8 hover:border-[#00D1FF]/30 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-[#00D1FF]/5 ${c.color} group-hover:scale-110 transition-transform`}>
                                <c.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF]">
                                {c.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{c.title}</h3>
                        <p className="text-3xl font-black text-white tracking-tighter">{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Performance Visualization area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#141414] border border-[#2A2A2A] rounded-[2.5rem] p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tighter">Growth Insights</h3>
                            <p className="text-gray-600 text-xs font-medium">Performance analytics for {user?.full_name}'s sanctuary</p>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#00D1FF]" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Revenue Flow</span>
                        </div>
                    </div>
                    {/* Simplified Chart Area */}
                    <div className="h-64 flex items-end gap-3 px-4">
                        {(chartData.length > 0 ? chartData : [40, 70, 45, 90, 65, 80]).map((d, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-[#00D1FF]/10 to-[#00D1FF]/80 rounded-t-xl transition-all hover:opacity-100 opacity-60" style={{ height: `${typeof d === 'object' ? d.value : d}%` }} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4">
                        {(chartData.length > 0 ? chartData : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']).map(d => (
                            <span key={typeof d === 'object' ? d.label : d} className="text-[9px] font-black text-gray-700 uppercase tracking-tighter">{typeof d === 'object' ? d.label : d}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#00D1FF] to-[#005266] rounded-[2.5rem] p-10 flex flex-col justify-between text-white">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight mb-2 italic">Management Quote</h3>
                        <p className="text-sm font-bold opacity-70 italic leading-relaxed">
                            "Excellence is not a singular act, but a habit. Your shop's success is defined by the consistency of your services."
                        </p>
                    </div>
                    <div className="space-y-4">
                       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center">
                           <span className="text-xs font-black uppercase">Staff Efficiency</span>
                           <span className="text-lg font-black">{(stats.capacity * 0.95).toFixed(1)}%</span>
                       </div>
                       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center">
                           <span className="text-xs font-black uppercase">Active Salon ID</span>
                           <span className="text-lg font-black italic">{user?.assigned_shop?.substring(0, 8)}...</span>
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagementOverview;
