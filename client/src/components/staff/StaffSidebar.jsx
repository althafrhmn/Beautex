import React from 'react';
import {
    LayoutDashboard,
    CalendarCheck,
    Users,
    Scissors,
    User,
    LogOut,
    ShieldAlert,
    BarChart3,
    Inbox,
    FileText,
    Package,
    Megaphone
} from 'lucide-react';

const StaffSidebar = ({ activeTab, setActiveTab, onLogout, isManagementMode, setIsManagementMode, setShowPinPrompt, role }) => {
    const staffItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'bookings', label: 'My Bookings', icon: CalendarCheck },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'services', label: 'Services', icon: Scissors },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'announcements', label: 'News Feed', icon: Megaphone },
    ];

    const managerItems = [
        { id: 'analytics', label: 'Executive Stats', icon: BarChart3 },
        { id: 'inbox', label: 'B2B Inbox', icon: Inbox },
        { id: 'reports', label: 'Report Station', icon: FileText },
        { id: 'inventory', label: 'Store Inventory', icon: Package },
        { id: 'announcements', label: 'Broadcast Station', icon: Megaphone },
    ];

    const menuItems = isManagementMode ? managerItems : staffItems;

    return (
        <aside className="w-72 h-screen bg-[#141414] border-r border-[#2A2A2A] flex flex-col sticky top-0 z-[100] font-sans">
            {/* Logo */}
            <div className="p-8 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00E6A0] rounded-lg flex items-center justify-center text-[#141414]">
                        <Scissors size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">
                            Beaute<span className={`${isManagementMode ? 'text-[#00D1FF]' : 'text-[#00E6A0]'}`}>X</span>
                        </h2>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                            Staff Portal
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                                isActive
                                    ? `bg-[#212121] ${isManagementMode ? 'text-[#00D1FF]' : 'text-[#00E6A0]'} shadow-sm`
                                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                            }`}
                        >
                            <div className={`${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}>
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'} tracking-wide`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className={`ml-auto w-1 h-4 rounded-full ${isManagementMode ? 'bg-[#00D1FF]' : 'bg-[#00E6A0]'}`} />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Logout & Mode Switch */}
            <div className="p-6 border-t border-[#2A2A2A] space-y-3">
                {(role === 'manager' || role === 'admin' || (role === 'staff' && setIsManagementMode)) && (
                    <button
                        onClick={() => {
                            if (isManagementMode) {
                                setIsManagementMode(false);
                                setActiveTab('dashboard');
                            } else {
                                setShowPinPrompt(true);
                            }
                        }}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border ${
                            isManagementMode 
                                ? 'bg-[#00D1FF]/10 border-[#00D1FF]/30 text-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.1)]' 
                                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                        <ShieldAlert size={14} />
                        {isManagementMode ? 'Exit Executive View' : 'Manager Executive View'}
                    </button>
                )}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#FF5A5A] bg-[#2A1414] hover:bg-[#3A1818] rounded-xl transition-all font-semibold text-sm"
                >
                    <LogOut size={16} strokeWidth={2.5} />
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default StaffSidebar;
