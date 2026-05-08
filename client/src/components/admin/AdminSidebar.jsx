import React from 'react';
import {
    LayoutDashboard,
    Users,
    Scissors,
    Briefcase,
    Store,
    CalendarCheck,
    CreditCard,
    Star,
    Settings,
    LogOut,
    Shield,
    MessageSquare,
    Megaphone,
    X
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
    const menuItems = [
        { id: 'overview', label: 'Intelligence', icon: LayoutDashboard },
        { id: 'shops', label: 'Sanctuaries', icon: Store },
        { id: 'moderation', label: 'Broadcast Station', icon: Megaphone },
        { id: 'staff', label: 'Community', icon: Users },
        { id: 'communications', label: 'B2B Hub', icon: MessageSquare },
        { id: 'payments', label: 'Commerce', icon: CreditCard },
        { id: 'settings', label: 'System', icon: Settings },
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[95] transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed top-0 left-0 h-screen w-72 bg-[#141414] border-r border-[#2A2A2A] flex flex-col z-[100] font-sans transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                {/* Logo Section & Close Button */}
                <div className="p-8 border-b border-[#2A2A2A] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00E6A0] rounded-lg flex items-center justify-center text-[#141414]">
                            <Scissors size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">
                                Beaute<span className="text-[#00E6A0]">X</span>
                            </h2>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                               Admin portal
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                                isActive
                                    ? 'bg-[#212121] text-[#00E6A0] shadow-sm'
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
                                <div className="ml-auto w-1 h-4 rounded-full bg-[#00E6A0] shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-6 border-t border-[#2A2A2A]">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#FF5A5A] bg-[#2A1414] hover:bg-[#3A1818] rounded-xl transition-all font-semibold text-sm"
                >
                    <LogOut size={16} strokeWidth={2.5} />
                    Log Out
                </button>
            </div>
        </aside>
        </>
    );
};

export default AdminSidebar;
