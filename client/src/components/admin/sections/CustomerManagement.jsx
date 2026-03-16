import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    X,
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar
} from 'lucide-react';
import api from '../../../utils/api';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const emptyForm = { fullName: '', email: '', phone: '', password: '', address: '' };
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/admin/customers');
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                fullName: customer.name || '',
                email: customer.email || '',
                phone: customer.phone_number || '',
                password: '', // Password is not returned from API
                address: customer.address || ''
            });
        } else {
            setEditingCustomer(null);
            setFormData(emptyForm);
        }
        setError('');
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (editingCustomer) {
                await api.put(`/admin/customers/${editingCustomer.id}`, formData);
            } else {
                await api.post('/admin/customers', formData);
            }
            fetchCustomers();
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error saving customer:', error);
            setError(error.response?.data?.error || 'Failed to save customer.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await api.delete(`/admin/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Customer Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage salon clientele and registrations</p>
                </div>
                <button 
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    <Plus size={18} />
                    Add Customer
                </button>
            </div>

            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search customers..."
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
                                <th className="px-6 py-4 font-semibold rounded-tl-lg">Name</th>
                                <th className="px-6 py-4 font-semibold">Phone Number</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Registration Date</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading customers...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#00E6A0] font-bold text-xs">
                                                    {customer.name?.[0]}
                                                </div>
                                                <span className="font-medium text-white">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{customer.phone_number || '-'}</td>
                                        <td className="px-6 py-4 text-gray-400">{customer.email}</td>
                                        <td className="px-6 py-4 text-gray-400">{new Date(customer.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button 
                                                onClick={() => handleOpenForm(customer)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(customer.id)}
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
                                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="customer@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            {!editingCustomer && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Password</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <span className="text-lg">🔒</span>
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Enter password"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 font-sans">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-500" size={16} />
                                    <textarea
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors h-24 resize-none font-sans"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Customer address"
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
                                    <><Save size={18} /> {editingCustomer ? 'Save Changes' : 'Create Customer'}</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
