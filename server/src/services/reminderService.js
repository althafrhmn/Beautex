import cron from 'node-cron';
import nodemailer from 'nodemailer';
import supabase, { supabaseAdmin } from '../config/supabaseClient.js';
import { getReminderTemplate } from '../utils/emailTemplates.js';

// 1. Setup Email Transporter (Placeholder for User Credentials)
// By default, this will log to the terminal if no credentials are provided
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'placeholder@gmail.com',
        pass: process.env.SMTP_PASS || 'placeholder_pass'
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Core Reminder Logic
 * Checks for bookings starting in ~15 minutes
 */
const checkAndSendReminders = async () => {
    console.log(`[REMINDER SERVICE] Running check: ${new Date().toISOString()}`);
    
    try {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        // Calculate the window (15 to 25 minutes from now)
        // We use a 10-minute window to ensure we don't miss anyone if the cron runs every 5-10 mins
        const fifteenMinsLater = new Date(now.getTime() + 15 * 60000);
        const twentyFiveMinsLater = new Date(now.getTime() + 25 * 60000);
        
        const formatTime = (date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        const startTimeWindow = formatTime(fifteenMinsLater);
        const endTimeWindow = formatTime(twentyFiveMinsLater);

        console.log(`[REMINDER SERVICE] Searching for slots between ${startTimeWindow} and ${endTimeWindow} on ${todayStr}`);

        // 1. Fetch bookings that fit the criteria
        // We use a more flexible select to handle cases where the schema hasn't refreshed
        let query = supabaseAdmin
            .from('bookings')
            .select('*, salons(name)')
            .eq('booking_date', todayStr)
            .eq('status', 'confirmed')
            .gte('start_time', startTimeWindow)
            .lte('start_time', endTimeWindow);
        
        // Only add the reminder_sent filter if we are sure it won't crash 
        // For now, we'll fetch all and filter in memory to be safe against schema cache issues
        const { data: allUpcoming, error } = await query;

        if (error) throw error;

        // Filter out those that already had a reminder (if the column exists in the data)
        const bookings = (allUpcoming || []).filter(b => b.reminder_sent !== true);

        if (!bookings || bookings.length === 0) {
            console.log('[REMINDER SERVICE] No upcoming rituals found in the immediate window.');
            return;
        }

        console.log(`[REMINDER SERVICE] Found ${bookings.length} ritual(s) to remind.`);

        // 2. Process each booking
        for (const booking of bookings) {
            try {
                const emailData = {
                    customerName: booking.guest_name || 'Valued Guest',
                    salonName: booking.salons?.name || 'Beautex Salon',
                    startTime: booking.start_time,
                    date: new Date(booking.booking_date).toLocaleDateString(),
                    services: 'Your Luxury Services' // Simplified for now
                };

                // Check if we have valid SMTP credentials
                const isTestMode = !process.env.SMTP_USER || process.env.SMTP_USER.includes('placeholder');

                if (isTestMode) {
                    console.log(`[TEST MODE] Would send email to: ${booking.guest_email}`);
                    console.log(`[TEST MODE] Content: Your ritual at ${emailData.salonName} starts at ${emailData.startTime}`);
                } else {
                    await transporter.sendMail({
                        from: `"Beautex Luxe" <${process.env.SMTP_USER}>`,
                        to: booking.guest_email,
                        subject: '✨ 15 Minutes to Your Ritual - Beautex Luxe',
                        html: getReminderTemplate(emailData)
                    });
                    console.log(`[REMINDER SERVICE] Success: Email sent to ${booking.guest_email}`);
                }

                // 3. Mark as sent (If the column exists)
                if ('reminder_sent' in booking) {
                    await supabaseAdmin
                        .from('bookings')
                        .update({ reminder_sent: true })
                        .eq('id', booking.id);
                }

            } catch (err) {
                console.error(`[REMINDER SERVICE] Failed for booking ${booking.id}:`, err.message);
            }
        }

    } catch (err) {
        console.error('[REMINDER SERVICE] CRITICAL ERROR:', err.message);
    }
};

// 4. Initialize Scheduler (Every 5 minutes)
export const initReminderService = () => {
    console.log('[REMINDER SERVICE] Background scheduler activated (5-min intervals).');
    
    // Check every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        checkAndSendReminders();
        cleanupAbandonedBookings();
    });
};

/**
 * Cleanup Logic: 
 * Removes 'pending' bookings that were never completed (older than 10 mins)
 * to free up slots for other customers.
 */
const cleanupAbandonedBookings = async () => {
    try {
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        
        // Find bookings that are 'pending' and older than 10 minutes
        const { data: stuckBookings, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('status', 'pending')
            .lt('created_at', tenMinsAgo);

        if (fetchError) throw fetchError;
        if (!stuckBookings || stuckBookings.length === 0) return;

        const ids = stuckBookings.map(b => b.id);
        console.log(`[CLEANUP] Removing ${ids.length} abandoned pending bookings:`, ids);

        // Delete from related tables first (if any) or just the main table if cascaded
        await supabaseAdmin.from('bookings').delete().in('id', ids);
        
    } catch (err) {
        console.error('[CLEANUP SERVICE] Error:', err.message);
    }
};
