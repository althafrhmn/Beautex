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
    Tag
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
        tags: [] 
    };

    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

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
                tags: Array.isArray(shop.tags) ? shop.tags : []
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
        if (assignedServices.some(as => as.id === s.id)) return;
        setAssignedServices(prev => [...prev, {
            id: s.id,
            name: s.name,
            default_price: s.price,
            custom_price: s.price
        }]);
        setServiceDropdownOpen(false);
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
                                            <p className="text-gray-300 font-medium">{shop.owner_name || '—'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{shop.phone || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                            {shop.hours ? shop.hours : 'NOT SET'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
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

                                {/* Address */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Location / Address *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input 
                                            type="text" required
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                            value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            placeholder="Street name, Landmark" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">City</label>
                                        <input type="text" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]" value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} placeholder="City name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Phone</label>
                                        <input type="tel" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="Contact Number" />
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

                                {/* Visual Section */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Visual Identity (Image URL)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input type="text" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0]" value={formData.image_url} onChange={(e) => setFormData(p => ({ ...p, image_url: e.target.value }))} placeholder="URL or Identifier" />
                                        </div>
                                        <label className={`cursor-pointer px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex items-center transition-all ${isUploading ? 'opacity-50' : 'hover:border-[#00E6A0]'}`}>
                                            {isUploading ? <div className="w-4 h-4 border-2 border-[#00E6A0] border-t-transparent rounded-full animate-spin" /> : <Upload size={18} className="text-gray-400" />}
                                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                        </label>
                                    </div>
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

                                {/* Services */}
                                <div className="space-y-3 pt-2" ref={serviceDropdownRef}>
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
                                                {allServices
                                                    .filter(s => s.name?.toLowerCase().includes((serviceSearch || '').toLowerCase()))
                                                    .map(s => (
                                                        <button key={s.id} type="button" onClick={() => addService(s)} className="w-full text-left px-4 py-3 hover:bg-[#2A2A2A] flex justify-between items-center group border-b border-white/5 last:border-none">
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="text-sm font-bold text-white truncate">{s.name}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase">Master: ₹{s.price}</p>
                                                            </div>
                                                            <Plus size={14} className="text-gray-600 group-hover:text-[#00E6A0] transition-colors" />
                                                        </button>
                                                    ))}
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
                </div>
            )}
        </div>
    );
};

export default ShopManagement;
