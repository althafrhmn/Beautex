import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/sections/DashboardOverview';
import BookingManagement from '../components/admin/sections/BookingManagement';
import ServiceManagement from '../components/admin/sections/ServiceManagement';
import CustomerManagement from '../components/admin/sections/CustomerManagement';
import StaffManagement from '../components/admin/sections/StaffManagement';
import ShopManagement from '../components/admin/sections/ShopManagement';
import PaymentManagement from '../components/admin/sections/PaymentManagement';
import ReviewManagement from '../components/admin/sections/ReviewManagement';
import SettingsManagement from '../components/admin/sections/SettingsManagement';
import AdminManagement from '../components/admin/sections/AdminManagement';

import {
    Search,
    Bell
} from 'lucide-react';

const AdminTerminal = () => {
    const { user, role } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('overview');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Beautex | Admin portal";
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        dispatch(logout());
        navigate('/login');
    };

    if (role !== 'admin' && role !== 'manager' && role !== 'receptionist') {
        return (
            <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-20 text-center font-sans">
                <div className="max-w-md w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8">
                    <h1 className="text-white text-2xl font-bold mb-2">Restricted Area</h1>
                    <p className="text-gray-400 text-sm mb-8">You do not have administrative privileges to access this portal.</p>
                    <button onClick={() => navigate('/')} className="w-full px-6 py-3 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] font-semibold rounded-xl transition-colors">
                        Return to Site
                    </button>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <DashboardOverview />;
            case 'bookings': return <BookingManagement />;
            case 'customers': return <CustomerManagement />;
            case 'staff': return <StaffManagement />;
            case 'shops': return <ShopManagement />;
            case 'services': return <ServiceManagement />;
            case 'payments': return <PaymentManagement />;
            case 'reviews': return <ReviewManagement />;
            case 'admins': return <AdminManagement />;
            case 'settings': return <SettingsManagement />;
            default: return <DashboardOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1115] flex text-white font-sans selection:bg-[#00E6A0] selection:text-[#141414]">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative custom-scrollbar">
                {/* Header Container */}
                <header className="sticky top-0 z-[90] bg-[#0F1115]/90 backdrop-blur-xl border-b border-[#2A2A2A] px-10 py-6 flex justify-between items-center transition-all">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white capitalize">
                            Admin <span className="text-[#00E6A0] relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-[#00E6A0] after:rounded-full inline-block pb-1">{activeTab}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="bg-[#141414] border border-[#2A2A2A] rounded-xl pl-10 pr-6 py-2.5 text-sm font-medium focus:outline-none focus:border-[#00E6A0]/50 focus:ring-1 focus:ring-[#00E6A0]/20 text-white min-w-[280px] transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-5 border-l border-[#2A2A2A] pl-6">
                            <button className="relative text-gray-400 hover:text-white transition-colors">
                                <Bell size={20} />
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0F1115]"></span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-white">{user?.user_metadata?.full_name || 'Administrator'}</p>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{role}</p>
                                </div>
                                <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] rounded-full flex items-center justify-center shadow-md cursor-pointer overflow-hidden transform hover:scale-105 transition-transform">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[#00E6A0] font-bold text-sm">{user?.user_metadata?.full_name?.[0] || 'A'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10 pb-20">
                    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminTerminal;
