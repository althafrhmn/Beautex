import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Upload } from 'lucide-react';
import api from '../../../utils/api';
import { useSelector } from 'react-redux';
import { supabase } from '../../../utils/supabaseClient';

const ProductInventory = () => {
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', stock_quantity: '', category: '', image_url: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/products?salon_id=${user.assigned_shop}`);
            setProducts(res.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            setUploadingImage(true);
            let finalImageUrl = formData.image_url;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `product-${Date.now()}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { data, error } = await supabase.storage
                    .from('salons')
                    .upload(filePath, imageFile);

                if (error) {
                    console.error('Upload error:', error);
                    alert('Failed to upload image');
                    setUploadingImage(false);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('salons')
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
            }

            const payload = { ...formData, image_url: finalImageUrl };

            await api.post('/products', payload);
            setShowAddModal(false);
            setFormData({ name: '', description: '', price: '', stock_quantity: '', category: '', image_url: '' });
            setImageFile(null);
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
            alert(`Failed to add product: ${errorMsg}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A]">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Package className="text-[#00E6A0]" />
                        Store Inventory
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Manage cosmetics and products for your salon</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#00E6A0] hover:bg-[#00C88B] text-black px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search products by name or category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#00E6A0]/50 transition-colors"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#00E6A0] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2A2A2A]">
                    <Package size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-1">No products found</h3>
                    <p className="text-gray-400">Add some products to your store inventory to start selling.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#3A3A3A] transition-all group">
                            <div className="h-48 bg-[#1A1A1A] relative overflow-hidden flex items-center justify-center">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <Package size={40} className="text-gray-600" />
                                )}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                                    ₹{product.price}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{product.name}</h3>
                                        <p className="text-xs font-semibold text-[#00E6A0] uppercase tracking-wider">{product.category}</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
                                <div className="flex justify-between items-center border-t border-[#2A2A2A] pt-4 mt-2">
                                    <div className="text-sm">
                                        <span className="text-gray-500">Stock: </span>
                                        <span className={`font-bold ${product.stock_quantity > 0 ? 'text-white' : 'text-red-500'}`}>
                                            {product.stock_quantity > 0 ? product.stock_quantity : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-400 hover:text-white rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Add New Product</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E6A0]/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price (₹)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E6A0]/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stock Qty</label>
                                    <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} required min="0" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E6A0]/50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Skincare, Haircare" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E6A0]/50" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Image</label>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                        id="product-image-upload" 
                                    />
                                    <label 
                                        htmlFor="product-image-upload"
                                        className="w-full bg-[#1A1A1A] border border-dashed border-[#2A2A2A] rounded-xl px-4 py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-[#00E6A0]/50 cursor-pointer transition-colors"
                                    >
                                        <Upload size={18} />
                                        {imageFile ? imageFile.name : 'Click to upload image'}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E6A0]/50"></textarea>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} disabled={uploadingImage} className="flex-1 px-4 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-xl font-semibold transition-colors disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={uploadingImage} className="flex-1 px-4 py-3 bg-[#00E6A0] hover:bg-[#00C88B] text-black rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                    {uploadingImage ? (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    ) : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductInventory;
