import supabase, { supabaseAdmin } from '../config/supabaseClient.js';
import { sendOtpEmail } from '../services/mailService.js';

export const requestOtp = async (req, res) => {
    const { email, metadata } = req.body;

    try {
        // 1. Policy check (Wait, Login.jsx already does this, but backend should too)
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            return res.status(403).json({ error: 'Strict Policy: Access restricted to @gmail.com accounts only.' });
        }

        // 2. Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Clear any existing code for this email and save new one using supabaseAdmin (to bypass RLS if needed)
        await supabaseAdmin.from('verification_codes').delete().eq('email', email);
        const { error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .insert({ 
                email, 
                code: otpCode, 
                expires_at: expiresAt.toISOString() 
            });

        if (dbError) {
            console.error('❌ DATABASE ERROR (Verification Table):', dbError);
            return res.status(500).json({ 
                error: `Database Failure: ${dbError.message}`, 
                details: dbError.message,
                hint: 'Check if public.verification_codes table contains the "email" column as primary or unique key.'
            });
        }

        // 4. Send the email
        const mailResult = await sendOtpEmail(email, otpCode, metadata?.full_name || 'Guest');
        
        // If email fails but it's dev/test, we might still want to signal success
        // if we told the user to check the console.
        res.status(200).json({ 
            message: 'Security code dispatched.',
            // If fallback happened, tell the frontend so it can maybe show a hint
            testMode: mailResult.fallback || mailResult.devMode
        });
    } catch (error) {
        console.error('Request OTP Error:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Guest OTP Request (Lightweight, no registration required yet)
 */
export const requestGuestOtp = async (req, res) => {
    const email = req.body.email?.trim()?.toLowerCase();
 
    try {
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for guest

        // 3. Clear any existing code for this email and save new one
        await supabaseAdmin.from('verification_codes').delete().eq('email', email);
        const { error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .insert({ 
                email, 
                code: otpCode, 
                expires_at: expiresAt.toISOString() 
            });

        if (dbError) {
            console.error('❌ OTP UPSERT ERROR:', dbError);
            throw dbError;
        }

        // Send email 
        await sendOtpEmail(email, otpCode, 'Guest');
        // console.log(`[TEST MODE] OTP for ${email}: ${otpCode}`);
        
        res.status(200).json({ message: 'Verification code sent to your email.' });
    } catch (error) {
        console.error('Guest Request OTP Error:', error);
        res.status(500).json({ error: 'Failed to send verification code.' });
    }
};

/**
 * Guest OTP Verification
 */
export const verifyGuestOtp = async (req, res) => {
    console.log('🔍 Full Request Body:', JSON.stringify(req.body));
    const { code } = req.body;
    const email = req.body.email?.trim()?.toLowerCase();
    console.log(`🔍 Normalized Email: [${email}], Code: [${code}]`);
 
    try {
        console.log(`🔍 Verifying Guest OTP for: [${email}]`);

        const { data: record, error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .select('*')
            .eq('email', email)
            .eq('code', code)
            .single();

        if (dbError || !record) {
            console.warn(`❌ Verification failed for ${email}. Code: ${code}. Database error:`, dbError?.message);
            return res.status(401).json({ error: 'Invalid verification code.' });
        }

        if (new Date(record.expires_at) < new Date()) {
            console.warn(`❌ Code expired for ${email}.`);
            return res.status(401).json({ error: 'Code has expired.' });
        }

        // Clean up
        await supabaseAdmin.from('verification_codes').delete().eq('email', email);

        res.status(200).json({ message: 'Verified successfully.' });
    } catch (error) {
        console.error('Verify Guest OTP Error:', error);
        res.status(400).json({ error: 'Verification failed.' });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, token, metadata } = req.body;

    try {
        // 1. Verify code in our custom table
        const { data: record, error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .select('*')
            .eq('email', email)
            .eq('code', token)
            .single();

        if (dbError || !record) {
            return res.status(401).json({ error: 'Invalid or expired validation token.' });
        }

        // Check expiry
        if (new Date(record.expires_at) < new Date()) {
            return res.status(401).json({ error: 'Verification token has expired. Please request a new one.' });
        }

        // 2. Clear used code
        await supabaseAdmin.from('verification_codes').delete().eq('email', email);

        // 3. Ensure user exists in Supabase Auth
        // If they don't, we create them (Auto-Registration)
        // We look for them by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        let user = users.find(u => u.email === email);

        if (!user) {
            // New User Registration
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                email_confirm: true, // We already verified them!
                user_metadata: { 
                    role: 'customer',
                    full_name: metadata?.full_name || email.split('@')[0]
                }
            });
            if (createError) throw createError;
            user = newUser.user;
            
            // Link any past guest bookings and restore loyalty points
            await linkGuestBookingsToNewUser(email, user.id);
        } else if (!user.email_confirmed_at) {
            // Confirm existing user if they weren't confirmed
            await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
        }

        // 4. Generate a Magic Link to get a valid session
        // This returns a temporary token that we can immediately verify to get a full session
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email
        });

        if (linkError) throw linkError;

        // 5. Use the generated token to fetch a REAL session
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
            token_hash: linkData.properties.hashed_token,
            type: 'magiclink'
        });

        if (authError) throw authError;

        // Return the full session that the frontend expects
        res.status(200).json({ 
            message: 'Identity verified. Accessing sanctuary.', 
            session: authData.session 
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(400).json({ error: error.message });
    }
};

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
        
        // 3. Retroactively link past guest bookings and calculate unclaimed loyalty points
        await linkGuestBookingsToNewUser(email, data.user.id);

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

/**
 * Links any disconnected guest bookings to a newly registered user account
 * and retroactively awards loyalty points for completed/confirmed payments.
 */
const linkGuestBookingsToNewUser = async (email, customerId) => {
    try {
        const { data: bookings, error: bErr } = await supabaseAdmin
            .from('bookings')
            .select('id, total_price, points_used, status')
            .ilike('guest_email', email)
            .is('customer_id', null);

        if (bErr || !bookings || bookings.length === 0) return;

        // 1. Link bookings
        await supabaseAdmin
            .from('bookings')
            .update({ customer_id: customerId })
            .ilike('guest_email', email)
            .is('customer_id', null);

        // 2. Calculate retroactive loyalty points
        let totalBonusPoints = 0;
        for (const b of bookings) {
            if (['confirmed', 'completed'].includes(b.status)) {
                totalBonusPoints += Math.floor((b.total_price || 0) / 100);
            }
        }

        if (totalBonusPoints > 0) {
            // Wait slightly to ensure trigger has created the profile
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('loyalty_points')
                .eq('id', customerId)
                .single();

            const newPoints = (profile?.loyalty_points || 0) + totalBonusPoints;
            await supabaseAdmin
                .from('profiles')
                .update({ loyalty_points: newPoints })
                .eq('id', customerId);
        }
    } catch (err) {
        console.error('Error linking guest bookings:', err);
    }
};
