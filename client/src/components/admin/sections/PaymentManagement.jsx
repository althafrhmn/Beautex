import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, ArrowUpRight, ArrowDownRight, CheckCircle, Clock } from 'lucide-react';
import api from '../../../utils/api';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ totalMonthly: 0, pending: 0, count: 0 });

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await api.get('/payments/admin/all');
            const data = response.data.payments || [];
            setPayments(data);
            calculateStats(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const now = new Date();
        const thisMonth = data.filter(p => new Date(p.created_at).getMonth() === now.getMonth());
        const totalMonthly = thisMonth.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const pending = data.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0);
        setStats({ totalMonthly, pending, count: data.length });
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/payments/${id}/status`, { status });
            fetchPayments();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredPayments = payments.filter(payment =>
        payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.booking?.booking_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Commerce <span className="text-[#00E6A0]">&</span> Contracts</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Manage platform revenue from shop renewals and ad campaigns</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Contract Revenue (Monthly)</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black tracking-tighter text-white">₹{stats.totalMonthly.toLocaleString()}</h3>
                        <span className="flex items-center text-[#00E6A0] text-sm font-semibold">
                            <ArrowUpRight size={16} className="mr-1" />
                            Live
                        </span>
                    </div>
                </div>
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
                    <p className="text-sm text-gray-400 font-medium mb-2">Pending Payments</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-bold tracking-tight text-white">₹{stats.pending.toLocaleString()}</h3>
                        <span className="flex items-center text-amber-500 text-sm font-semibold">
                            <Clock size={16} className="mr-1" />
                            Awaiting
                        </span>
                    </div>
                </div>
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
                    <p className="text-sm text-gray-400 font-medium mb-2">Total Transactions</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-bold tracking-tight text-white">{stats.count}</h3>
                        <span className="flex items-center text-[#00E6A0] text-sm font-semibold">
                            <ArrowUpRight size={16} className="mr-1" />
                            Database
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E6A0] transition-colors text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[10px] uppercase bg-[#1A1A1A] text-gray-500 font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-5 rounded-tl-2xl">Invoice ID</th>
                                <th className="px-6 py-5">Partner / Shop Identity</th>
                                <th className="px-6 py-5">Revenue Source</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5">Renewal Date</th>
                                <th className="px-6 py-5 text-right rounded-tr-2xl">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading payments...</td></tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No transactions found.</td></tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-300">{payment.transaction_id}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white uppercase tracking-tight">{payment.customer?.full_name}</p>
                                            <p className="text-[10px] text-[#00E6A0] font-black uppercase">Active Sanctuary</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                            {payment.amount > 5000 ? 'Contract Renewal' : 'App Promotion Ad'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-white">₹{parseFloat(payment.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-400">{new Date(payment.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {payment.status === 'pending' ? (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(payment.id, 'completed')}
                                                        className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                                                    >
                                                        Mark Completed
                                                    </button>
                                                ) : (
                                                    <span className="px-3 py-1 bg-[#00E6A0]/10 text-[#00E6A0] border border-[#00E6A0]/20 rounded text-xs font-semibold">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagement;
