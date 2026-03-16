import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Scissors,
    Clock,
    DollarSign,
    Filter,
    X,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import api from '../../../utils/api';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        category: 'Hair',
        image_url: ''
    });

    const categories = [
        { id: 'Hair', label: 'Hair Styling' },
        { id: 'Nails', label: 'Nail Artistry' },
        { id: 'Skin', label: 'Skin Treatment' },
        { id: 'Massage', label: 'Body Massage' },
        { id: 'Other', label: 'Special Rituals' }
    ];

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data.services || []);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description || '',
                price: service.price,
                duration_minutes: service.duration_minutes,
                category: service.category,
                image_url: service.image_url || ''
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                duration_minutes: '',
                category: 'Hair',
                image_url: ''
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await api.put(`/services/${editingService.id}`, formData);
            } else {
                await api.post('/services', formData);
            }
            fetchServices();
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error saving service:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await api.delete(`/services/${id}`);
                fetchServices();
            } catch (error) {
                console.error('Error deleting service:', error);
            }
        }
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Service Menu</h2>
                    <p className="text-gray-400 text-sm mt-1">Curate your salon's services and pricing</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    <Plus size={18} /> Add New Service
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search services..."
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E6A0] transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-[#141414] rounded-xl animate-pulse" />)
                ) : filteredServices.map((service) => (
                    <div
                        key={service.id}
                        className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden group hover:border-[#00E6A0]/50 transition-all"
                    >
                        <div className="h-48 relative overflow-hidden bg-[#1A1A1A]">
                            <img
                                src={service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                                alt={service.name}
                            />
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                    onClick={() => handleOpenForm(service)}
                                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white hover:text-blue-400 transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="absolute bottom-3 left-3">
                                <span className="px-2.5 py-1 bg-[#141414]/80 backdrop-blur-md border border-[#2A2A2A] text-[#00E6A0] text-xs font-semibold capitalize rounded-md">
                                    {service.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            <div>
                                <h4 className="text-lg font-semibold text-white truncate">{service.name}</h4>
                                <p className="text-sm text-gray-400 line-clamp-2 mt-1">{service.description}</p>
                            </div>
                            <div className="flex items-center justify-between pt-3">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-gray-300">
                                        <Clock size={14} className="text-[#00E6A0]" />
                                        <span className="text-sm font-medium">{service.duration_minutes} min</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-300">
                                        <DollarSign size={14} className="text-[#00E6A0]" />
                                        <span className="text-sm font-medium">₹{service.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <div className="relative w-full max-w-lg bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-[#2A2A2A] pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Configure service details below</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Bridal Makeup"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                                <textarea
                                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] h-24 transition-colors resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the service..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Duration (mins)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                        value={formData.duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                                <select
                                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors appearance-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Image URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                        placeholder="https://..."
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-3 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> {editingService ? 'Save Changes' : 'Create Service'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManagement;
