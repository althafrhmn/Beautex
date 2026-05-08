import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, loginSuccess } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import api from '../utils/api';
import { Search, Bell, Menu } from 'lucide-react';

import StaffSidebar from '../components/staff/StaffSidebar';
import StaffDashboardOverview from '../components/staff/sections/StaffDashboardOverview';
import StaffBookings from '../components/staff/sections/StaffBookings';
import StaffCustomers from '../components/staff/sections/StaffCustomers';
import StaffServices from '../components/staff/sections/StaffServices';
import StaffProfile from '../components/staff/sections/StaffProfile';
import ProductInventory from '../components/staff/sections/ProductInventory';
import AnnouncementManager from '../components/staff/sections/AnnouncementManager';
import ManagementOverview from '../components/manager/sections/ManagementOverview';
import ManagerInbox from '../components/manager/sections/ManagerInbox';
import ReportStation from '../components/manager/sections/ReportStation';
import PinPrompt from '../components/manager/PinPrompt';

const StaffDashboard = () => {
    const { user, role } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isManagementMode, setIsManagementMode] = useState(false);
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [profile, setProfile] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Wait for Supabase to restore the session before firing any API calls
    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.access_token) {
                localStorage.setItem('token', session.access_token);
                // Fetch full profile (with shop PIN)
                try {
                    const res = await api.get('/staff/me/profile');
                    setProfile(res.data.profile);
                    dispatch(loginSuccess({
                        user: { ...session.user, ...res.data.profile },
                        token: session.access_token,
                        role: res.data.profile.role
                    }));
                } catch (err) {
                    console.error('Error fetching profile:', err);
                }
            }
            setAuthReady(true);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        dispatch(logout());
        navigate('/login');
    };
    
    // Allow both 'staff' and 'manager' roles
    if (role !== 'staff' && role !== 'manager' && role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-20 text-center font-sans">
                <div className="max-w-md w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8">
                    <h1 className="text-white text-2xl font-bold mb-2">Restricted Area</h1>
                    <p className="text-gray-400 text-sm mb-8">You do not have administrative or staff privileges to access this portal.</p>
                    <button onClick={() => navigate('/')} className="w-full px-6 py-3 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] font-semibold rounded-xl transition-colors">
                        Return to Site
                    </button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        const props = { searchTerm, setActiveTab };
        if (isManagementMode) {
            switch (activeTab) {
                case 'analytics': return <ManagementOverview {...props} />;
                case 'inbox': return <ManagerInbox {...props} />;
                case 'reports': return <ReportStation {...props} />;
                case 'inventory': return <ProductInventory {...props} />;
                case 'announcements': return <AnnouncementManager {...props} />;
                default: return <ManagementOverview {...props} />;
            }
        }

        switch (activeTab) {
            case 'dashboard': return <StaffDashboardOverview {...props} />;
            case 'bookings': return <StaffBookings {...props} />;
            case 'customers': return <StaffCustomers {...props} />;
            case 'services': return <StaffServices {...props} />;
            case 'inventory': return <ProductInventory {...props} />;
            case 'profile': return <StaffProfile {...props} />;
            case 'announcements': return <AnnouncementManager {...props} />;
            default: return <StaffDashboardOverview {...props} />;
        }
    };

    const tabLabels = {
        dashboard: 'Dashboard',
        bookings: 'My Bookings',
        customers: 'Assigned Customers',
        services: 'Services',
        inventory: 'Store Inventory',
        profile: 'My Profile',
        announcements: 'Broadcast Station'
    };

    const isOwner = role === 'manager' || (role === 'staff' && user?.assigned_shop) || role === 'admin';

    const handlePinVerify = (pin) => {
        // Priority: Shop-level PIN (set in Add Shop) -> Profile PIN -> Default
        const masterPin = profile?.salon?.manager_pin || profile?.manager_pin || '1234';
        
        if (pin === masterPin) {
            setIsManagementMode(true);
            setActiveTab('analytics');
            setShowPinPrompt(false);
            return true;
        }
        return false;
    };

    return (
        <div className="min-h-screen bg-[#0F1115] flex text-white font-sans selection:bg-[#00E6A0] selection:text-[#141414]">
            {showPinPrompt && (
                <PinPrompt 
                    onVerify={handlePinVerify} 
                    onCancel={() => setShowPinPrompt(false)} 
                />
            )}
            <StaffSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={handleLogout} 
                isManagementMode={isManagementMode}
                setIsManagementMode={setIsManagementMode}
                setShowPinPrompt={setShowPinPrompt}
                role={role}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative custom-scrollbar">
                {/* Header */}
                <header className="sticky top-0 z-[90] bg-[#0F1115]/90 backdrop-blur-xl border-b border-[#2A2A2A] px-10 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-2xl font-black tracking-tight text-white capitalize">
                            {isManagementMode ? (
                                <>Executive <span className="text-[#00D1FF] border-b-2 border-[#00D1FF] pb-1">{activeTab}</span></>
                            ) : (
                                <>Staff <span className="text-[#00E6A0] border-b-2 border-[#00E6A0] pb-1">{tabLabels[activeTab] || activeTab}</span></>
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden lg:block">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors ${isManagementMode ? 'group-focus-within:text-[#00D1FF]' : 'group-focus-within:text-[#00E6A0]'}`} size={16} />
                            <input 
                                type="text" 
                                placeholder={`Search ${isManagementMode ? 'Executive records' : tabLabels[activeTab]}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`bg-[#141414] border border-[#2A2A2A] rounded-xl pl-10 pr-6 py-2.5 text-sm font-medium focus:outline-none text-white min-w-[280px] transition-all ${isManagementMode ? 'focus:border-[#00D1FF]/50' : 'focus:border-[#00E6A0]/50'}`} 
                            />
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
                                        <span className={`${isManagementMode ? 'text-[#00D1FF]' : 'text-[#00E6A0]'} font-bold text-sm`}>{user?.user_metadata?.full_name?.[0] || 'S'}</span>
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
