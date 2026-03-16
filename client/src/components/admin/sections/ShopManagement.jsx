import React, { useState, useEffect, useRef } from 'react';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    MapPin, 
    Building, 
    X, 
    Save, 
    Phone, 
    Clock, 
    Image as ImageIcon,
    Globe,
    User,
    Scissors,
    Check,
    ChevronDown
} from 'lucide-react';
import api from '../../../utils/api';

const formatTime = (t) => {
    if (!t) return '—';
    const s = t.trim();
    // Already 12h format (e.g. "09:00 AM")
    if (/am|pm/i.test(s)) return s;
    // Convert 24h "HH:MM" → "hh:MM AM/PM"
    const [h, m] = s.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return s;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

// Parse "HH:MM - HH:MM" or "09:00 AM - 08:00 PM" into { open, close }
const parseHours = (hours) => {
    if (!hours) return { open: '', close: '' };
    const parts = hours.split(' - ');
    if (parts.length < 2) return { open: parts[0]?.trim() || '', close: '' };
    return { open: parts[0].trim(), close: parts[1].trim() };
};

const ShopManagement = () => {
    const [shops, setShops] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [saving, setSaving] = useState(false);

    // Services multi-select state
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
    const [serviceSearch, setServiceSearch] = useState('');
    const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
    const serviceDropdownRef = useRef(null);

    const emptyForm = { 
        name: '', 
        location: '',
        city: '',
        owner_name: '',
        phone: '', 
        opening_time: '', 
        closing_time: '', 
        image_url: '' 
    };
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        fetchShops();
        fetchAllServices();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target))
                setServiceDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchShops = async () => {
        try {
            const response = await api.get('/shops');
            setShops(response.data.salons || response.data.shops || []);
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllServices = async () => {
        try {
            const res = await api.get('/services');
            setAllServices(res.data.services || []);
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const fetchShopServices = async (shopId) => {
        try {
            const res = await api.get(`/shops/${shopId}/services`);
            return (res.data.services || []).map(s => s.id);
        } catch {
            return [];
        }
    };

    const handleOpenForm = async (shop = null) => {
        setServiceSearch('');
        if (shop) {
            const { open, close } = parseHours(shop.hours);
            setEditingShop(shop);
            setFormData({
                name: shop.name || '',
                location: shop.address || shop.location || '',
                city: shop.city || '',
                owner_name: shop.owner_name || '',
                phone: shop.phone || '',
                opening_time: open,
                closing_time: close,
                image_url: shop.image_url || ''
            });
            const ids = await fetchShopServices(shop.id);
            setSelectedServiceIds(ids);
        } else {
            setEditingShop(null);
            setFormData(emptyForm);
            setSelectedServiceIds([]);
        }
        setIsFormOpen(true);
    };

    const toggleService = (id) => {
        setSelectedServiceIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let shopId = editingShop?.id;
            if (editingShop) {
                await api.put(`/shops/${shopId}`, formData);
            } else {
                const res = await api.post('/shops', formData);
                shopId = res.data.salon?.id;
            }
            // Save service assignments
            if (shopId) {
                await api.put(`/shops/${shopId}/services`, { serviceIds: selectedServiceIds });
            }
            fetchShops();
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error saving shop:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this shop?')) {
            try {
                await api.delete(`/shops/${id}`);
                fetchShops();
            } catch (error) {
                console.error('Error deleting shop:', error);
            }
        }
    };

    const filteredShops = shops.filter(shop =>
        shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.address || shop.location)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.phone?.includes(searchQuery) ||
        shop.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Shop Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage all salon branches</p>
                </div>
                <button 
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    <Plus size={18} />
                    Add Shop
                </button>
            </div>
            
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search shops..."
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E6A0] transition-colors text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase bg-[#1A1A1A] text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold rounded-tl-lg">Shop Name</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Owner</th>
                                <th className="px-6 py-4 font-semibold">Phone</th>
                                <th className="px-6 py-4 font-semibold">Timings</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading shops...</td></tr>
                            ) : filteredShops.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">
                                        No shops found.
                                    </td>
                                </tr>
                            ) : (
                                filteredShops.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            <div>{shop.name}</div>
                                            {shop.city && <div className="text-xs text-gray-500 mt-0.5">{shop.city}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{shop.address || shop.location || '—'}</td>
                                        <td className="px-6 py-4 text-gray-400">{shop.owner_name || '—'}</td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {shop.phone
                                                ? <span className="flex items-center gap-1.5"><Phone size={13} className="text-gray-500" />{shop.phone}</span>
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {shop.hours
                                                ? (() => { const { open, close } = parseHours(shop.hours); return `${formatTime(open)} – ${formatTime(close)}`; })()
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button 
                                                onClick={() => handleOpenForm(shop)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(shop.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <div className="relative w-full max-w-lg bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-[#2A2A2A] pb-4">
                            <h3 className="text-xl font-bold text-white">
                                {editingShop ? 'Edit Shop' : 'Add New Shop'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Shop Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Shop name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Shop address/location"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Owner Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.owner_name}
                                            onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                            placeholder="Owner name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">City</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="City"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-16 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, phone: digits });
                                        }}
                                        placeholder="10-digit number"
                                    />
                                    {formData.phone.length > 0 && (
                                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono ${formData.phone.length === 10 ? 'text-[#00E6A0]' : 'text-gray-500'}`}>
                                            {formData.phone.length}/10
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Opening Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={16} />
                                        <input
                                            type="time"
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans appearance-none [color-scheme:dark]"
                                            value={formData.opening_time}
                                            onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Closing Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={16} />
                                        <input
                                            type="time"
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans appearance-none [color-scheme:dark]"
                                            value={formData.closing_time}
                                            onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Shop Image URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            {/* Services Multi-Select */}
                            <div ref={serviceDropdownRef}>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans flex items-center gap-1.5">
                                    <Scissors size={14} className="text-[#00E6A0]" /> Services Offered
                                    {selectedServiceIds.length > 0 && (
                                        <span className="ml-auto bg-[#00E6A0]/20 text-[#00E6A0] text-xs font-bold px-2 py-0.5 rounded-full">
                                            {selectedServiceIds.length} selected
                                        </span>
                                    )}
                                </label>

                                {/* Search trigger */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search services to add..."
                                        value={serviceSearch}
                                        onChange={(e) => { setServiceSearch(e.target.value); setServiceDropdownOpen(true); }}
                                        onFocus={() => setServiceDropdownOpen(true)}
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-9 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                    />
                                    <ChevronDown
                                        size={14}
                                        onClick={() => setServiceDropdownOpen(o => !o)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`}
                                    />

                                    {serviceDropdownOpen && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
                                            {allServices.length === 0 ? (
                                                <p className="px-4 py-3 text-sm text-gray-500 text-center">No services found. Add services first.</p>
                                            ) : (
                                                (() => {
                                                    const filtered = allServices.filter(s =>
                                                        s.name?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                                                        s.category?.toLowerCase().includes(serviceSearch.toLowerCase())
                                                    );
                                                    return filtered.length === 0
                                                        ? <p className="px-4 py-3 text-sm text-gray-500 text-center">No match for "{serviceSearch}"</p>
                                                        : filtered.map(svc => {
                                                            const selected = selectedServiceIds.includes(svc.id);
                                                            return (
                                                                <button
                                                                    key={svc.id}
                                                                    type="button"
                                                                    onClick={() => toggleService(svc.id)}
                                                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${selected ? 'bg-[#00E6A0]/10' : 'hover:bg-[#2A2A2A]'}`}
                                                                >
                                                                    <div>
                                                                        <span className={`font-medium ${selected ? 'text-[#00E6A0]' : 'text-white'}`}>{svc.name}</span>
                                                                        <span className="text-gray-500 text-xs ml-2">{svc.category} · {svc.duration_minutes}min · ₹{svc.price}</span>
                                                                    </div>
                                                                    {selected && <Check size={14} className="text-[#00E6A0] flex-none" />}
                                                                </button>
                                                            );
                                                        });
                                                })()
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Selected service chips */}
                                {selectedServiceIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedServiceIds.map(id => {
                                            const svc = allServices.find(s => s.id === id);
                                            if (!svc) return null;
                                            return (
                                                <span key={id} className="flex items-center gap-1.5 bg-[#00E6A0]/15 border border-[#00E6A0]/30 text-[#00E6A0] text-xs font-medium px-2.5 py-1 rounded-full">
                                                    {svc.name}
                                                    <button type="button" onClick={() => toggleService(id)} className="hover:text-white transition-colors">
                                                        <X size={11} />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full mt-4 py-3 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] rounded-lg font-bold transition-colors flex items-center justify-center gap-2 font-sans"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><Save size={18} /> {editingShop ? 'Save Changes' : 'Create Shop'}</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopManagement;
