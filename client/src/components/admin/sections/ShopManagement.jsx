import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    MapPin, 
    Building, 
    Star, 
    X, 
    Save, 
    Phone, 
    User, 
    Clock, 
    Image as ImageIcon 
} from 'lucide-react';
import api from '../../../utils/api';

const ShopManagement = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [saving, setSaving] = useState(false);

    const emptyForm = { 
        name: '', 
        location: '', 
        owner_name: '', 
        phone: '', 
        opening_time: '', 
        closing_time: '', 
        image_url: '' 
    };
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const response = await api.get('/shops');
            setShops(response.data.shops || []);
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (shop = null) => {
        if (shop) {
            setEditingShop(shop);
            setFormData({
                name: shop.name || '',
                location: shop.location || '',
                owner_name: shop.owner_name || '',
                phone: shop.phone || '',
                opening_time: shop.opening_time || '',
                closing_time: shop.closing_time || '',
                image_url: shop.image_url || ''
            });
        } else {
            setEditingShop(null);
            setFormData(emptyForm);
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingShop) {
                await api.put(`/shops/${editingShop.id}`, formData);
            } else {
                await api.post('/shops', formData);
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
        shop.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
                                <th className="px-6 py-4 font-semibold">Timings</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading shops...</td></tr>
                            ) : filteredShops.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">
                                        No shops found.
                                    </td>
                                </tr>
                            ) : (
                                filteredShops.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{shop.name}</td>
                                        <td className="px-6 py-4 text-gray-400">{shop.location}</td>
                                        <td className="px-6 py-4 text-gray-400">{shop.owner_name}</td>
                                        <td className="px-6 py-4 text-gray-400">{shop.opening_time} - {shop.closing_time}</td>
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
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Phone number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Opening Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.opening_time}
                                            onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                                            placeholder="09:00 AM"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Closing Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.closing_time}
                                            onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                                            placeholder="08:00 PM"
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
