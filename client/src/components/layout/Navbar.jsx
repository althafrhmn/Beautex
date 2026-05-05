import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scissors, ChevronDown, User, LogOut, Menu, X, Bell, Calendar, Search, Award } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import SearchOverlay from './SearchOverlay';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user, role } = useSelector((state) => state.auth);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setIsSearchOpen(false); // Close search when navigating
    }, [location]);

    const hideNavbarPaths = ['/login', '/register', '/bookings', '/my-bookings'];
    if (hideNavbarPaths.includes(location.pathname) || location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff')) return null;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { name: 'Shops', path: '/explore/all' },
        { name: 'Bookings', path: '/bookings' },
        { name: 'Offers', path: '/offers' }
    ];

    return (
        <>
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
                ? 'py-4 bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-[#00E6A0] rounded-xl flex items-center justify-center shadow-[0_8px_20px_rgba(0,230,160,0.25)] group-hover:rotate-12 transition-transform">
                            <Scissors className="w-5 h-5 text-[#050505]" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">Beautex</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/5 px-2 py-1.5 rounded-2xl backdrop-blur-md">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${location.pathname === item.path
                                    ? 'bg-[#00E6A0] text-[#050505] shadow-lg shadow-[#00E6A0]/20'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth & Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        {/* Search Action */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-[#00E6A0] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Search size={18} />
                        </button>

                        {/* Only show User Info on Admin/Staff/MyBookings paths for a CLEAN landing page */}
                        {user && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff') || location.pathname === '/my-bookings') ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex flex-col items-end mr-2">
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{user.user_metadata?.full_name || user.full_name || user.email?.split('@')[0]}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] font-bold text-[#00E6A0] uppercase tracking-widest opacity-70">{role}</span>
                                        {role === 'customer' && (
                                            <span title="Loyalty Points" className="text-[8px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 bg-amber-400/10 px-1.5 py-0.5 rounded-sm">
                                                <Award size={8} /> {user.loyalty_points || 0} PTS
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    to={role === 'admin' ? '/admin' : (role === 'staff' || role === 'manager') ? '/staff/dashboard' : '/my-bookings'}
                                    className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-white/5 border border-white/5 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    {role === 'admin' ? <User size={14} className="text-[#00E6A0]" /> : (role === 'staff' || role === 'manager') ? <User size={14} className="text-[#00E6A0]" /> : <Calendar size={14} className="text-[#00E6A0]" />}
                                    {role === 'admin' ? 'Admin Portal' : (role === 'staff' || role === 'manager') ? 'Staff Portal' : 'My Bookings'}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-[#00E6A0] hover:bg-white/10 transition-all"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {user ? (
                                    <>
                                        {role === 'customer' && (
                                            <span title="Loyalty Points" className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-2 rounded-xl border border-amber-400/20">
                                                <Award size={12} /> {user.loyalty_points || 0} PTS
                                            </span>
                                        )}
                                        {role === 'customer' && (
                                            <Link
                                                to="/my-bookings"
                                                className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-white/5 border border-white/5 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all"
                                            >
                                                <Calendar size={14} className="text-[#00E6A0]" /> My Bookings
                                            </Link>
                                        )}
                                        {(role === 'admin' || role === 'manager' || role === 'staff') && (
                                            <Link
                                                to={role === 'admin' ? '/admin' : '/staff/dashboard'}
                                                className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-white/5 border border-white/5 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all"
                                            >
                                                <User size={14} className="text-[#00E6A0]" /> {role === 'admin' ? 'Admin Portal' : 'Staff Portal'}
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0] hover:text-white transition-all bg-white/5 px-6 py-3 rounded-xl border border-white/5"
                                        >
                                            Logout Session
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-[#1A1D1F] px-6 py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-black/10"
                                    >
                                        <User size={14} className="text-[#00E6A0]" />
                                        Login
                                    </Link>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2.5 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10 transition-all"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-[#0A0A0A] border-b border-white/5 p-6 shadow-2xl"
                    >
                        <div className="space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block text-xl font-black tracking-tight uppercase transition-colors ${location.pathname === item.path ? 'text-[#00E6A0]' : 'text-gray-500'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {user && (
                                <>
                                    <Link
                                        to={role === 'admin' ? '/admin' : (role === 'staff' || role === 'manager') ? '/staff/dashboard' : '/my-bookings'}
                                        className="block p-4 bg-white/5 rounded-2xl font-black text-white text-center border border-white/5"
                                    >
                                        {role === 'admin' ? 'Admin Portal' : (role === 'staff' || role === 'manager') ? 'Staff Portal' : 'My Bookings'}
                                    </Link>
                                    {role === 'customer' && (
                                        <div className="flex items-center justify-center gap-2 p-3 bg-amber-400/10 rounded-2xl border border-amber-400/20">
                                            <Award size={16} className="text-amber-400" />
                                            <span className="text-sm font-black text-amber-400">{user.loyalty_points || 0} Points</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>

        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Navbar;
