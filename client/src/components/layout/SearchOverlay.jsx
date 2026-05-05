import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Store, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const SearchOverlay = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 100);
            fetchShops();
        } else {
            document.body.style.overflow = 'unset';
            setSearchQuery('');
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const fetchShops = async () => {
        if (shops.length > 0) return; // Only fetch if we haven't already
        setLoading(true);
        try {
            const res = await api.get('/shops');
            setShops(res.data?.salons || res.data?.shops || []);
        } catch (error) {
            console.error('Failed to fetch shops for search:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (id) => {
        onClose();
        navigate(`/shop/${id}`);
    };

    const filteredShops = shops.filter(shop => {
        const query = searchQuery.toLowerCase();
        return (
            shop.name?.toLowerCase().includes(query) || 
            shop.city?.toLowerCase().includes(query) || 
            shop.address?.toLowerCase().includes(query)
        );
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-[#050505]/95 backdrop-blur-2xl flex flex-col"
                >
                    {/* Header / Search Input */}
                    <div className="w-full max-w-4xl mx-auto px-6 pt-12 pb-6 border-b border-white/10">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-8 h-8" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by shop name or city..."
                                    className="w-full bg-transparent text-white text-lg md:text-2xl font-bold tracking-tight placeholder:text-gray-700 outline-none pl-20 pr-6 py-4"
                                />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-4 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-none"
                            >
                                <X size={32} />
                            </button>
                        </div>
                    </div>

                    {/* Results Container */}
                    <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-6 py-8">
                        {loading && searchQuery.length > 0 && (
                            <div className="text-gray-500 text-sm font-bold uppercase tracking-widest animate-pulse">Loading directory...</div>
                        )}

                        {!loading && searchQuery.length > 0 && filteredShops.length === 0 && (
                            <div className="text-center py-20">
                                <Search className="w-16 h-16 text-white/10 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No sanctuaries found</h3>
                                <p className="text-gray-500 font-medium">We couldn't find any shops matching "{searchQuery}"</p>
                            </div>
                        )}

                        {searchQuery.length > 0 && filteredShops.length > 0 && (
                            <div className="grid gap-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">Search Results ({filteredShops.length})</h4>
                                {filteredShops.map((shop, index) => (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={shop.id}
                                        onClick={() => handleResultClick(shop.id)}
                                        className="group w-full flex items-center p-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-3xl transition-all cursor-pointer text-left"
                                    >
                                        {/* Shop Image */}
                                        <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden shadow-lg border border-white/10 flex-none mr-6">
                                            {shop.image_url ? (
                                                <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5"><Store className="text-gray-500" /></div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-2xl font-black text-white truncate tracking-tight">{shop.name}</h3>
                                            <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm font-medium">
                                                <MapPin size={14} className="text-[#00E6A0]" />
                                                <span className="truncate">{shop.address}, {shop.city}</span>
                                            </div>
                                        </div>

                                        {/* Nav Icon */}
                                        <div className="hidden sm:flex w-12 h-12 rounded-full bg-[#00E6A0]/10 flex items-center justify-center text-[#00E6A0] group-hover:bg-[#00E6A0] group-hover:text-black transition-all ml-4 flex-none">
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {searchQuery.length === 0 && (
                            <div className="text-center py-32 opacity-30">
                                <Store className="w-24 h-24 text-white mx-auto mb-6" />
                                <h3 className="text-4xl font-black text-white tracking-tighter">Find Your Sanctuary</h3>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
