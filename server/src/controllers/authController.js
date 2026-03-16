import supabase from '../config/supabaseClient.js';

export const register = async (req, res) => {
    const { email, password, fullName, role } = req.body;

    try {
        // 1. Sign up user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role || 'customer' // Allow passing role (staff/customer)
                }
            }
        });

        if (error) throw error;

        // 2. Profile and Customer records are now handled by the PostgreSQL trigger 'on_auth_user_created'
        // This ensures data consistency and reduces backend complexity.
        
        res.status(201).json({ 
            message: 'Ritual account created successfully. Welcome to the sanctuary.', 
            user: data.user 
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        res.status(200).json({ message: 'Login successful', session: data.session });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(401).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        // req.user is set by requireAuth middleware
        const user = req.user;

        // Fetch profile details
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        res.status(200).json({ user: { ...user, ...profile } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
