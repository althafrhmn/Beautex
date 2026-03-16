import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, loginSuccess } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Search, Bell } from 'lucide-react';

import StaffSidebar from '../components/staff/StaffSidebar';
import StaffDashboardOverview from '../components/staff/sections/StaffDashboardOverview';
import StaffBookings from '../components/staff/sections/StaffBookings';
import StaffCustomers from '../components/staff/sections/StaffCustomers';
import StaffServices from '../components/staff/sections/StaffServices';
import StaffProfile from '../components/staff/sections/StaffProfile';

const StaffDashboard = () => {
    const { user, role } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [authReady, setAuthReady] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Wait for Supabase to restore the session before firing any API calls
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) {
                // Keep Redux/localStorage in sync with the live session
                localStorage.setItem('token', session.access_token);
                dispatch(loginSuccess({
                    user: session.user,
                    token: session.access_token,
                    role: role || session.user?.user_metadata?.role || 'staff'
                }));
            }
            setAuthReady(true);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        dispatch(logout());
        navigate('/login');
    };

    // Only staff can access
    if (role !== 'staff') {
        return (
            <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-20 text-center font-sans">
                <div className="max-w-md w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8">
                    <h1 className="text-white text-2xl font-bold mb-2">Restricted Area</h1>
                    <p className="text-gray-400 text-sm mb-8">You do not have staff privileges to access this portal.</p>
                    <button onClick={() => navigate('/')} className="w-full px-6 py-3 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] font-semibold rounded-xl transition-colors">
                        Return to Site
                    </button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <StaffDashboardOverview />;
            case 'bookings': return <StaffBookings />;
            case 'customers': return <StaffCustomers />;
            case 'services': return <StaffServices />;
            case 'profile': return <StaffProfile />;
            default: return <StaffDashboardOverview />;
        }
    };

    const tabLabels = {
        dashboard: 'Dashboard',
        bookings: 'My Bookings',
        customers: 'Assigned Customers',
        services: 'Services',
        profile: 'My Profile'
    };

    return (
        <div className="min-h-screen bg-[#0F1115] flex text-white font-sans selection:bg-[#00E6A0] selection:text-[#141414]">
            <StaffSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
                {/* Header */}
                <header className="sticky top-0 z-[90] bg-[#0F1115]/90 backdrop-blur-xl border-b border-[#2A2A2A] px-10 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white capitalize">
                            Staff <span className="text-[#00E6A0] inline-block pb-1 border-b-2 border-[#00E6A0]">{tabLabels[activeTab] || activeTab}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={16} />
                            <input type="text" placeholder="Search here..."
                                className="bg-[#141414] border border-[#2A2A2A] rounded-xl pl-10 pr-6 py-2.5 text-sm font-medium focus:outline-none focus:border-[#00E6A0]/50 text-white min-w-[260px] transition-all" />
                        </div>

                        <div className="flex items-center gap-5 border-l border-[#2A2A2A] pl-6">
                            <button className="relative text-gray-400 hover:text-white transition-colors">
                                <Bell size={20} />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-white">{user?.user_metadata?.full_name || 'Staff'}</p>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{role}</p>
                                </div>
                                <div className="w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] rounded-full flex items-center justify-center overflow-hidden">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span className="text-[#00E6A0] font-bold text-sm">{user?.user_metadata?.full_name?.[0] || 'S'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10 pb-20">
                    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {authReady ? renderContent() : (
                            <div className="flex items-center justify-center py-32">
                                <div className="w-8 h-8 border-2 border-[#00E6A0] border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StaffDashboard;
