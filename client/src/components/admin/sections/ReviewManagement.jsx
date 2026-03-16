import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../../../utils/api';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await api.get('/reviews/admin/all');
            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/reviews/${id}/status`, { status });
            fetchReviews();
        } catch (error) {
            console.error('Error updating review status:', error);
        }
    };

    const filteredReviews = reviews.filter(review =>
        review.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Review Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage customer feedback and ratings</p>
                </div>
            </div>

            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search reviews..."
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
                                <th className="px-6 py-4 font-semibold rounded-tl-lg">Customer</th>
                                <th className="px-6 py-4 font-semibold">Salon / Branch</th>
                                <th className="px-6 py-4 font-semibold">Rating</th>
                                <th className="px-6 py-4 font-semibold">Comment</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading reviews...</td></tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No reviews found.</td></tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white">{review.customer?.full_name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{review.salon?.name || 'Main Branch'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex text-[#00E6A0]">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        fill={i < review.rating ? "currentColor" : "none"} 
                                                        className={i < review.rating ? "text-[#00E6A0]" : "text-gray-600"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 max-w-xs transition-all italic">
                                            "{review.comment}"
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                review.status === 'approved' ? 'bg-[#00E6A0]/10 text-[#00E6A0] border-[#00E6A0]/20' :
                                                review.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {review.status !== 'approved' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                    className="p-1 px-2 bg-[#00E6A0]/10 text-[#00E6A0] rounded hover:bg-[#00E6A0]/20 transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                    className="p-1 px-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                                                    title="Hide/Reject"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
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

export default ReviewManagement;
