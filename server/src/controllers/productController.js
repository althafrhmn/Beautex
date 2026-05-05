import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get all products (Public - for customers)
export const getAllProducts = async (req, res) => {
    try {
        const { salon_id } = req.query;
        let query = supabase.from('products').select('*').eq('is_active', true);
        
        if (salon_id) {
            query = query.eq('salon_id', salon_id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ products: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get single product
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Product not found' });

        res.status(200).json({ product: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create product (Staff/Admin)
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock_quantity, category, image_url } = req.body;
        
        // Ensure staff is adding product to their own shop
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('assigned_shop, role')
            .eq('id', req.user.id)
            .single();

        if (profile.role !== 'admin' && !profile.assigned_shop) {
            return res.status(403).json({ error: 'You must be assigned to a shop to create products' });
        }

        const salon_id = profile.role === 'admin' ? req.body.salon_id : profile.assigned_shop;

        if (!salon_id) return res.status(400).json({ error: 'Salon ID is required' });

        const { data, error } = await supabaseAdmin
            .from('products')
            .insert([{ salon_id, name, description, price, stock_quantity, category, image_url }])
            .select()
            .single();

        if (error) {
            console.error("Create Product Error:", error);
            throw error;
        }
        res.status(201).json({ message: 'Product created successfully', product: data });
    } catch (error) {
        console.error("Create Product Catch Error:", error);
        res.status(400).json({ error: error.message });
    }
};

// Update product (Staff/Admin)
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updated_at: new Date().toISOString() };

        // Verify ownership for staff
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('assigned_shop, role')
            .eq('id', req.user.id)
            .single();

        if (profile.role !== 'admin') {
            const { data: product } = await supabaseAdmin.from('products').select('salon_id').eq('id', id).single();
            if (!product || product.salon_id !== profile.assigned_shop) {
                return res.status(403).json({ error: 'Unauthorized to update this product' });
            }
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Product updated successfully', product: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete product (Staff/Admin)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership for staff
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('assigned_shop, role')
            .eq('id', req.user.id)
            .single();

        if (profile.role !== 'admin') {
            const { data: product } = await supabaseAdmin.from('products').select('salon_id').eq('id', id).single();
            if (!product || product.salon_id !== profile.assigned_shop) {
                return res.status(403).json({ error: 'Unauthorized to delete this product' });
            }
        }

        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
