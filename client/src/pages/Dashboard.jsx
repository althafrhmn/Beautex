import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import {
    Scissors, LogOut, LayoutDashboard,
    ArrowLeft, Bell, Settings, User, Calendar
} from 'lucide-react';

// New Module Imports
import ProfileModule from '../components/customer/ProfileModule';

const Dashboard = () => {
    const { user, role } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = "Beautex | Luxury salon booking";
        if (role === 'admin') {
            navigate('/admin');
        } else if (role === 'staff') {
            navigate('/staff/dashboard');
        }
    }, [role, navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        dispatch(logout());
        navigate('/login');
    };

    // CUSTOMER DASHBOARD
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
            <header className="bg-[#0A0A0A] border-b border-white/5 sticky top-0 z-50">
                <nav className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-[#00E6A0] rounded-xl flex items-center justify-center shadow-lg">
                            <Scissors className="w-5 h-5 text-[#050505]" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">Beautex Luxe</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/my-bookings')} className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E6A0]">My Bookings</button>
                        <button onClick={handleLogout} className="px-6 py-2.5 bg-white/5 border border-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">Sign Out</button>
                    </div>
                </nav>
            </header>

            <main className="max-w-6xl mx-auto px-8 pt-20">
                <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-[#00E6A0] flex items-center justify-center text-[#050505] text-xs font-black">
                                {user?.user_metadata?.full_name?.[0] || 'U'}
                            </div>
                            <span className="text-[10px] font-black uppercase text-[#00E6A0] tracking-[0.3em]">Signature Profile</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white transition-all">
                            Welcome, <br />
                            <span className="text-gray-500 italic">{user?.user_metadata?.full_name?.split(' ')[0] || 'Boutique'}</span>
                        </h1>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="bg-[#0A0A0A] px-8 py-5 border border-white/5 rounded-[2rem] shadow-2xl flex items-center gap-4">
                            <div className="p-3 bg-[#00E6A0]/10 text-[#00E6A0] rounded-xl border border-[#00E6A0]/20"><Calendar size={20} /></div>
                            <div>
                                <p className="text-lg font-black text-white">My Rituals</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Manage your schedule</p>
                            </div>
                            <button onClick={() => navigate('/bookings')} className="ml-auto w-10 h-10 bg-[#00E6A0] rounded-full flex items-center justify-center text-[#050505] shadow-lg hover:rotate-90 transition-transform">
                                <Scissors size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-20">
                    <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500 mb-8 px-1">Upcoming Schedule</h2>
                    <div className="p-10 border border-white/5 rounded-[3rem] bg-[#0A0A0A]/50 backdrop-blur-sm text-center">
                        <p className="text-gray-500 font-bold mb-6">You have no upcoming rituals scheduled at the moment.</p>
                        <button onClick={() => navigate('/bookings')} className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0] hover:underline">Book New Session</button>
                    </div>
                </div>

                <ProfileModule />
            </main>
        </div>
    );
};

export default Dashboard;
