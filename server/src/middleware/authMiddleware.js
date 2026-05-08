import supabase from '../config/supabaseClient.js';

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // Also accept token from query param — needed for direct browser downloads (can't set headers on <a href>)
        const token = authHeader?.split(' ')[1] || req.query.token;

        if (!token) {
            console.warn('[AUTH] No token provided in Authorization header or query param');
            return res.status(401).json({ error: 'No token provided' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('[AUTH] Supabase getUser error:', error?.message || 'No user found', 'Token start:', token.substring(0, 15));
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const restrictTo = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Check role in public.profiles
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', req.user.id)
                .single();

            if (error || !data) {
                return res.status(403).json({ error: 'Access denied: Profile not found' });
            }

            if (!allowedRoles.includes(data.role)) {
                return res.status(403).json({ error: `Access denied: Requires one of [${allowedRoles.join(', ')}]` });
            }

            // Attach role to request for convenience
            req.user.role = data.role;
            next();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};
