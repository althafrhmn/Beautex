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
    ChevronDown,
    Upload,
    Calendar,
    Settings,
    Tag,
    MessageSquare,
    Shield,
    Mail,
    Key,
    AlertCircle
} from 'lucide-react';
import api from '../../../utils/api';
import { supabase } from '../../../utils/supabaseClient';

const formatTime = (t) => {
    if (!t) return '—';
    const s = t.trim();
    if (/am|pm/i.test(s)) return s;
    const [h, m] = s.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return s;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

const ShopManagement = () => {
    const [shops, setShops] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [saving, setSaving] = useState(false);

    const [assignedServices, setAssignedServices] = useState([]);
    const [serviceSearch, setServiceSearch] = useState('');
    const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
    const serviceDropdownRef = useRef(null);

    const emptyForm = { 
        name: '', 
        location: '',
        city: '',
        owner_name: '',
        phone: '', 
        opening_time: '09:00', 
        opening_period: 'AM',
        closing_time: '09:00', 
        closing_period: 'PM',
        image_url: '',
        google_maps_url: '',
        tags: [],
        off_days: [],
        holidays: [],
        manager_pin: '1234',
        owner_email: '',
        owner_password: ''
    };

    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    
    // Quick Service Creation State
    const [isQuickServiceOpen, setIsQuickServiceOpen] = useState(false);
    const [quickServiceForm, setQuickServiceForm] = useState({
        name: '',
        category: 'Hair Cutting Styles',
        price: '100'
    });
    const [quickServiceSaving, setQuickServiceSaving] = useState(false);

    const handleQuickServiceCreate = async (e) => {
        if (e) e.preventDefault();
        setQuickServiceSaving(true);
        try {
            const res = await api.post('/services', {
                ...quickServiceForm,
                duration_minutes: 30,
                description: `Express creation for ${quickServiceForm.name}`
            });
            const newService = res.data.service;
            
            // Re-fetch all services
            await fetchAllServices();
            
            // Automatically assign to current shop
            addService({
                id: newService.id,
                name: newService.name,
                price: newService.price
            });
            
            setQuickServiceForm({ name: '', category: 'Hair Cutting Styles', price: '100' });
            setIsQuickServiceOpen(false);
        } catch (err) {
            alert('Error creating service: ' + (err.response?.data?.error || err.message));
        } finally {
            setQuickServiceSaving(false);
        }
    };

    useEffect(() => {
        fetchShops();
        fetchAllServices();
    }, []);

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
            setShops(response.data?.salons || response.data?.shops || []);
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllServices = async () => {
        try {
            const res = await api.get('/services');
            setAllServices(res.data?.services || []);
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const fetchShopServices = async (id) => {
        try {
            const res = await api.get(`/shops/${id}/services`);
            return res.data?.services || [];
        } catch (error) {
            console.error('Error fetching shop services:', error);
            return [];
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `salon-${Date.now()}.${fileExt}`;
            const filePath = `images/${fileName}`;
            const { data, error } = await supabase.storage.from('salons').upload(filePath, file);
            if (error) {
                alert('Upload failed. Check Supabase permissions.');
            } else {
                const { data: { publicUrl } } = supabase.storage.from('salons').getPublicUrl(filePath);
                setFormData(prev => ({ ...prev, image_url: publicUrl }));
            }
        } catch (error) {
            alert('Error uploading: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenForm = async (shop = null) => {
        setServiceSearch('');
        if (shop) {
            const parts = (shop.hours || '').split(' - ');
            const parse = (p) => {
                const s = (p || '').trim().split(' ');
                return { time: s[0] || '09:00', period: s[1] || 'AM' };
            };
            const open = parse(parts[0]);
            const close = parse(parts[1]);

            setEditingShop(shop);
            setFormData({
                name: shop.name || '',
                location: shop.address || shop.location || '',
                city: shop.city || '',
                owner_name: shop.owner_name || '',
                phone: shop.phone || '',
                opening_time: open.time,
                opening_period: open.period,
                closing_time: close.time,
                closing_period: close.period,
                image_url: shop.image_url || '',
                google_maps_url: shop.google_maps_url || '',
                tags: Array.isArray(shop.tags) ? shop.tags : [],
                off_days: Array.isArray(shop.off_days) ? shop.off_days : [],
                holidays: Array.isArray(shop.holidays) ? shop.holidays : [],
                manager_pin: shop.manager_pin || '1234',
                owner_email: shop.owner_email || ''
            });
            const services = await fetchShopServices(shop.id);
            setAssignedServices(services.map(s => ({
                id: s.id,
                name: s.name,
                default_price: s.price,
                custom_price: s.custom_price || s.price 
            })));
        } else {
            setEditingShop(null);
            setFormData(emptyForm);
            setAssignedServices([]);
        }
        setIsFormOpen(true);
    };

    const addService = (s) => {
        if (assignedServices.some(as => as.id === s.id)) {
            removeService(s.id);
            return;
        }
        setAssignedServices(prev => [...prev, {
            id: s.id,
            name: s.name,
            default_price: s.price,
            custom_price: s.price
        }]);
        // Do NOT close dropdown for multi-select
    };

    const removeService = (id) => {
        setAssignedServices(prev => prev.filter(s => s.id !== id));
    };

    const updateServicePrice = (id, price) => {
        setAssignedServices(prev => prev.map(s => 
            s.id === id ? { ...s, custom_price: price } : s
        ));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            let shopId = editingShop?.id;
            const { opening_time, opening_period, closing_time, closing_period, ...cleanData } = formData;
            const payload = {
                ...cleanData,
                hours: `${opening_time} ${opening_period} - ${closing_time} ${closing_period}`
            };

            if (editingShop) await api.put(`/shops/${shopId}`, payload);
            else {
                const res = await api.post('/shops', payload);
                shopId = res.data?.salon?.id || res.data?.shop?.id;
            }
            if (shopId) {
                const sPayload = assignedServices.map(s => ({ service_id: s.id, price: s.custom_price }));
                await api.put(`/shops/${shopId}/services`, { services: sPayload });
            }
            await fetchShops();
            setIsFormOpen(false);
        } catch (error) {
            alert('Error saving shop: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this shop?')) {
            try {
                await api.delete(`/shops/${id}`);
                fetchShops();
            } catch (error) { console.error(error); }
        }
    };

    const filteredShops = shops.filter(shop =>
        (shop.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.address || shop.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.city || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shop Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage and configure salon branches</p>
                </div>
                <button 
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#00E6A0]/10"
                >
                    <Plus size={18} />
                    Add New Shop
                </button>
            </div>
            
            {/* Table Container */}
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, city or location..."
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E6A0] transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{filteredShops.length} locations</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase bg-[#1A1A1A] text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold rounded-tl-lg">Shop Identity</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Contact Info</th>
                                <th className="px-6 py-4 font-semibold">Operating Hours</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Retrieving system data...</td></tr>
                            ) : filteredShops.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">No shops discovered.</td></tr>
                            ) : (
                                filteredShops.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center overflow-hidden border border-[#3A3A3A]">
                                                    {shop.image_url ? (
                                                        <img src={shop.image_url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <Building size={16} className="text-[#00E6A0]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-base">{shop.name}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(Array.isArray(shop.tags) ? shop.tags : []).map(t => (
                                                            <span key={t} className="px-1.5 py-0.5 bg-[#00E6A0]/10 text-[#00E6A0] text-[9px] font-black uppercase rounded border border-[#00E6A0]/10">{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            <p className="font-medium">{shop.city}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{shop.address || shop.location}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-white font-bold text-sm tracking-tight">{shop.owner_name || '—'}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 truncate max-w-[150px]">{shop.owner_email || 'No System Email'}</p>
                                                <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-[#00E6A0]/5 border border-[#00E6A0]/10 rounded-lg w-max">
                                                    <Shield size={10} className="text-[#00E6A0]" />
                                                    <span className="text-[9px] font-black text-[#00E6A0] uppercase tracking-widest">PIN: {shop.manager_pin}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                            {shop.hours ? shop.hours : 'NOT SET'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {shop.owner_email && (
                                                    <button 
                                                        onClick={() => {
                                                            // Logic to navigate to communications with this email pre-selected
                                                            window.location.hash = `/admin/communications?recipient=${shop.owner_email}`;
                                                        }} 
                                                        className="p-2 text-[#00E6A0] hover:bg-[#00E6A0]/10 rounded-lg transition-colors"
                                                        title="Message Owner"
                                                    >
                                                        <MessageSquare size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleOpenForm(shop)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(shop.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Redesigned to match Staff/Standard format */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
                            <h3 className="text-lg font-bold text-white">{editingShop ? 'Edit Shop Identity' : 'Add New Shop'}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-5">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Shop Name *</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input 
                                            type="text" required 
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                            value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g. THE ROYAL SUITE" 
                                        />
                                    </div>
                                </div>

                                {/* Address & Owner */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Location / Address *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input 
                                                type="text" required
                                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                                value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                                placeholder="Street name, Landmark" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Proprietor / Owner Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input 
                                                type="text" 
                                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                                value={formData.owner_name} onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                                                placeholder="Owner's Legal Name" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">City</label>
                                        <input type="text" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]" value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} placeholder="City name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Phone</label>
                                        <input 
                                            type="tel" 
                                            maxLength="10"
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]" 
                                            value={formData.phone} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setFormData(p => ({ ...p, phone: val }));
                                            }} 
                                            placeholder="10-digit Number" 
                                        />
                                    </div>
                                </div>

                                {/* Time Section */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Operational Timeline</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Start Time */}
                                        <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 flex-1">
                                            <input type="text" className="w-full bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder:text-gray-700" value={formData.opening_time} onChange={(e) => setFormData(p => ({ ...p, opening_time: e.target.value }))} placeholder="09:00" />
                                            <div className="flex bg-[#0F1115] rounded-lg p-1 shrink-0">
                                                {['AM', 'PM'].map(p => (
                                                    <button key={p} type="button" onClick={() => setFormData(prev => ({ ...prev, opening_period: p }))} className={`px-2 py-1 rounded text-[8px] font-black transition-all ${formData.opening_period === p ? 'bg-[#00E6A0] text-[#141414]' : 'text-gray-500'}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* End Time */}
                                        <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 flex-1">
                                            <input type="text" className="w-full bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder:text-gray-700" value={formData.closing_time} onChange={(e) => setFormData(p => ({ ...p, closing_time: e.target.value }))} placeholder="09:00" />
                                            <div className="flex bg-[#0F1115] rounded-lg p-1 shrink-0">
                                                {['AM', 'PM'].map(p => (
                                                    <button key={p} type="button" onClick={() => setFormData(prev => ({ ...prev, closing_period: p }))} className={`px-2 py-1 rounded text-[8px] font-black transition-all ${formData.closing_period === p ? 'bg-[#00E6A0] text-[#141414]' : 'text-gray-500'}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Google Maps Location Link</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input 
                                                type="url"
                                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                                value={formData.google_maps_url} onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                                                placeholder="https://maps.google.com/..." 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#00E6A0] uppercase tracking-widest block flex items-center gap-2">
                                            <Settings size={12} /> Executive PIN *
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="text" required
                                                maxLength="4"
                                                className="w-full bg-[#1A1A1A] border border-[#00E6A0]/30 rounded-xl px-4 py-3 text-sm font-black text-white tracking-[0.5rem] focus:outline-none focus:border-[#00E6A0] transition-all"
                                                value={formData.manager_pin} 
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 4) setFormData(prev => ({ ...prev, manager_pin: val }));
                                                }}
                                                placeholder="1234" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6 bg-[#00E6A0]/5 border border-[#00E6A0]/20 rounded-[2rem] space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-2xl bg-[#00E6A0]/10 flex items-center justify-center text-[#00E6A0]">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tighter">Owner Access Provisioning</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Automated Login Creation</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Owner System Gmail</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                                <input 
                                                    type="email"
                                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                                    value={formData.owner_email} onChange={(e) => setFormData(p => ({ ...p, owner_email: e.target.value }))}
                                                    placeholder="owner@gmail.com" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Account Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                                <input 
                                                    type="text"
                                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                                    value={formData.owner_password} onChange={(e) => setFormData(p => ({ ...p, owner_password: e.target.value }))}
                                                    placeholder="Initial Login Pasword" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-[#00E6A0]/70 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle size={10} /> Note: This email will be matched with the Shop Portal for official communications.
                                    </p>
                                </div>

                                {/* Visual Section */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Visual Identity (Image URL) *</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input 
                                                type="url" required
                                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]" 
                                                value={formData.image_url} onChange={(e) => setFormData(p => ({ ...p, image_url: e.target.value }))} 
                                                placeholder="https://..." 
                                            />
                                        </div>
                                        <label className={`cursor-pointer px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex items-center transition-all ${isUploading ? 'opacity-50' : 'hover:border-[#00E6A0]'}`}>
                                            {isUploading ? <div className="w-4 h-4 border-2 border-[#00E6A0] border-t-transparent rounded-full animate-spin" /> : <Upload size={18} className="text-gray-400" />}
                                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic">A shop image is mandatory for platform aesthetics.</p>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block flex items-center gap-2"><Tag size={12}/> Categories</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Hair Cutting Styles', 'Beautician Styles', 'Bridal & Makeup', 'Grooming', 'Nail Art', 'Massage & Spa', 'All Related Salon'].map(cat => (
                                            <button 
                                                key={cat} type="button" 
                                                onClick={() => setFormData(prev => ({ ...prev, tags: (Array.isArray(prev.tags) ? prev.tags : []).includes(cat) ? prev.tags.filter(t => t !== cat) : [...(Array.isArray(prev.tags) ? prev.tags : []), cat] }))} 
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${(Array.isArray(formData.tags) ? formData.tags : []).includes(cat) ? 'bg-[#00E6A0]/20 text-[#00E6A0] border-[#00E6A0]/50' : 'bg-[#1A1A1A] text-gray-500 border-[#2A2A2A] hover:border-gray-600'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Weekly Off-Days */}
                                <div className="space-y-3 mb-6">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block flex items-center gap-2"><Calendar size={12}/> Weekly Off-Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                            const isOff = (formData.off_days || []).includes(day);
                                            return (
                                                <button 
                                                    key={day} type="button" 
                                                    onClick={() => setFormData(p => ({ ...p, off_days: isOff ? p.off_days.filter(d => d !== day) : [...(p.off_days || []), day] }))} 
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${isOff ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-[#1A1A1A] text-gray-500 border-[#2A2A2A] hover:border-gray-600'}`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Holidays */}
                                <div className="space-y-3 mb-6">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block flex items-center gap-2"><X size={12}/> Specific Holidays</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="date" 
                                            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E6A0]"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = e.target.value;
                                                    if (val) {
                                                        const exists = (formData.holidays || []).includes(val);
                                                        if (!exists) {
                                                            setFormData(p => ({ ...p, holidays: [...(p.holidays || []), val] }));
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(formData.holidays || []).map(date => (
                                            <div key={date} className="flex items-center gap-2 px-3 py-1 bg-[#00E6A0]/10 border border-[#00E6A0]/20 rounded-lg text-[10px] text-[#00E6A0] font-bold">
                                                {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, holidays: p.holidays.filter(d => d !== date) }))} className="hover:text-white"><X size={10}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Services */}
                                <div className="space-y-3 pt-6 border-t border-white/5" ref={serviceDropdownRef}>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block flex items-center gap-2"><Scissors size={12}/> Assisted Services & Pricing</label>
                                    
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input 
                                            type="text" 
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]"
                                            value={serviceSearch} onChange={(e) => setServiceSearch(e.target.value)}
                                            onFocus={() => setServiceDropdownOpen(true)}
                                            placeholder="Find service to add..." 
                                        />
                                        
                                        {serviceDropdownOpen && (
                                            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsQuickServiceOpen(true)}
                                                    className="w-full text-[#00E6A0] px-4 py-3 hover:bg-[#00E6A0]/5 border-b border-white/5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest bg-[#00E6A0]/5"
                                                >
                                                    <Plus size={14} /> Create Brand New Service
                                                </button>
                                                {allServices
                                                    .filter(s => s.name?.toLowerCase().includes((serviceSearch || '').toLowerCase()))
                                                    .map(s => {
                                                        const isAssigned = assignedServices.some(as => as.id === s.id);
                                                        return (
                                                            <button 
                                                                key={s.id} 
                                                                type="button" 
                                                                onClick={() => addService(s)} 
                                                                className={`w-full text-left px-4 py-3 hover:bg-[#2A2A2A] flex justify-between items-center group border-b border-white/5 last:border-none ${isAssigned ? 'bg-[#00E6A0]/5' : ''}`}
                                                            >
                                                                <div className="flex-1 overflow-hidden">
                                                                    <p className={`text-sm font-bold truncate ${isAssigned ? 'text-[#00E6A0]' : 'text-white'}`}>{s.name}</p>
                                                                    <p className="text-[10px] text-gray-500 uppercase">Master: ₹{s.price}</p>
                                                                </div>
                                                                {isAssigned ? (
                                                                    <Check size={14} className="text-[#00E6A0]" />
                                                                ) : (
                                                                    <Plus size={14} className="text-gray-600 group-hover:text-[#00E6A0] transition-colors" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Assigned List */}
                                    <div className="space-y-2 mt-3">
                                        {assignedServices.map(s => (
                                            <div key={s.id} className="bg-[#1A1A1A] border border-[#2A2A2A] p-3 rounded-xl flex items-center justify-between group hover:border-[#00E6A0]/30 transition-all">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-white uppercase">{s.name}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F1115] rounded-lg border border-[#2A2A2A]">
                                                        <span className="text-[10px] text-gray-500 font-bold">₹</span>
                                                        <input 
                                                            type="number" 
                                                            className="bg-transparent border-none focus:outline-none w-14 text-xs font-bold text-[#00E6A0]" 
                                                            value={s.custom_price} 
                                                            onChange={(e) => updateServicePrice(s.id, e.target.value)} 
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => removeService(s.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 p-6 bg-[#141414] border-t border-[#2A2A2A] flex items-center justify-end gap-3 rounded-b-2xl">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                                    {saving ? <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                                    {editingShop ? 'Save Changes' : 'Create Shop'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Quick Service Modal Inner Overlay */}
                    {isQuickServiceOpen && (
                        <div className="absolute inset-0 z-[250] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsQuickServiceOpen(false)} />
                            <div className="relative w-full max-w-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                                <h4 className="text-xl font-black text-white tracking-tighter mb-4">Quick <span className="text-[#00E6A0]">Service</span></h4>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Service Name</label>
                                        <input 
                                            type="text" 
                                            autoFocus
                                            className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]"
                                            value={quickServiceForm.name}
                                            onChange={(e) => setQuickServiceForm(p => ({ ...p, name: e.target.value }))}
                                            placeholder="e.g. Royal Shaving"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                                        <select 
                                            className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] appearance-none"
                                            value={quickServiceForm.category}
                                            onChange={(e) => setQuickServiceForm(p => ({ ...p, category: e.target.value }))}
                                        >
                                            {['Hair Cutting Styles', 'Beautician Styles', 'Bridal & Makeup', 'Grooming', 'Nail Art', 'Massage & Spa'].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Standard Price (₹)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]"
                                            value={quickServiceForm.price}
                                            onChange={(e) => setQuickServiceForm(p => ({ ...p, price: e.target.value }))}
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => setIsQuickServiceOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Cancel</button>
                                        <button 
                                            onClick={handleQuickServiceCreate} 
                                            disabled={quickServiceSaving || !quickServiceForm.name}
                                            className="flex-1 py-3 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-xl text-[10px] font-black uppercase tracking-[0.2rem] transition-all disabled:opacity-50"
                                        >
                                            {quickServiceSaving ? 'Provisioning...' : 'Provision'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopManagement;
