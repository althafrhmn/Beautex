import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import api from '../../../utils/api';

const StaffCustomers = ({ searchTerm }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/staff/me/bookings');
            const bookings = res.data.bookings || [];
            // Extract unique customers from bookings
            const uniqueCustomers = [];
            const seen = new Set();
            bookings.forEach(b => {
                if (b.customer && !seen.has(b.customer.id)) {
                    seen.add(b.customer.id);
                    uniqueCustomers.push({
                        ...b.customer,
                        lastService: b.booking_services?.map(bs => bs.services?.name).join(', '),
                        lastDate: b.booking_date,
                        status: b.status
                    });
                }
            });
            setCustomers(uniqueCustomers);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Assigned Customers</h2>
                <p className="text-gray-400 text-sm mt-1">Customers from your booking history</p>
            </div>

            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                {loading ? (
                    <p className="text-gray-500 text-center py-8">Loading customers...</p>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No assigned customers yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase bg-[#1A1A1A] text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-semibold rounded-tl-lg">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Phone</th>
                                    <th className="px-6 py-4 font-semibold">Last Service</th>
                                    <th className="px-6 py-4 font-semibold">Last Visit</th>
                                    <th className="px-6 py-4 font-semibold rounded-tr-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2A2A]">
                                {customers.filter(c => 
                                    !searchTerm || 
                                    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((c, i) => (
                                    <tr key={i} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#00E6A0] text-xs font-bold">
                                                    {c.full_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{c.full_name}</p>
                                                    <p className="text-xs text-gray-500">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{c.phone_number || '—'}</td>
                                        <td className="px-6 py-4 text-gray-300">{c.lastService || '—'}</td>
                                        <td className="px-6 py-4 text-gray-400">{c.lastDate ? new Date(c.lastDate).toLocaleDateString() : '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                                                c.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                                                c.status === 'confirmed' ? 'bg-[#00E6A0]/10 text-[#00E6A0]' :
                                                'bg-amber-500/10 text-amber-400'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffCustomers;
