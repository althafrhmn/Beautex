import React, { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import api from '../../../utils/api';

const StaffServices = ({ searchTerm }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services');
                setServices(res.data?.services || []);
            } catch (err) {
                console.error('Error fetching services:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Services</h2>
                <p className="text-gray-400 text-sm mt-1">View all salon services offered</p>
            </div>

            {loading ? (
                <p className="text-gray-500 text-center py-12">Loading services...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.filter(s => 
                        !searchTerm || 
                        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.category?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((service) => (
                        <div key={service.id} className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#3A3A3A] transition-colors">
                            {service.image_url && (
                                <img src={service.image_url} alt={service.name} className="w-full h-36 object-cover" />
                            )}
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Scissors size={14} className="text-[#00E6A0]" />
                                    <span className="text-xs text-[#00E6A0] font-semibold uppercase tracking-wider">{service.category}</span>
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">{service.name}</h3>
                                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{service.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-[#00E6A0]">₹{service.price}</span>
                                    <span className="text-xs text-gray-500">{service.duration_minutes} min</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StaffServices;
