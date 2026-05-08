import { getReminderTemplate } from './src/utils/emailTemplates.js';
import supabase, { supabaseAdmin } from './src/config/supabaseClient.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testSpecificReminder = async () => {
    console.log('Fetching the booking for hassan...');
    
    let query = supabaseAdmin
        .from('bookings')
        .select('*, salons(name)')
        .eq('guest_email', 'hassan1312089kutty@gmail.com')
        .order('created_at', { ascending: false })
        .limit(1);
    
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
        console.error("No booking found");
        process.exit();
    }
    const booking = data[0];
    console.log("Found booking:", booking.id);

    const emailData = {
        customerName: booking.guest_name || 'Valued Guest',
        salonName: booking.salons?.name || 'Beautex Salon',
        startTime: booking.start_time,
        date: new Date(booking.booking_date).toLocaleDateString(),
        services: 'Your Luxury Services'
    };

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log(`Sending email to ${booking.guest_email}...`);
        await transporter.sendMail({
            from: `"Beautex Luxe" <${process.env.SMTP_USER}>`,
            to: booking.guest_email,
            subject: '✨ 15 Minutes to Your Ritual - Beautex Luxe',
            html: getReminderTemplate(emailData)
        });
        console.log(`✅ Success! Email sent to ${booking.guest_email}`);
    } catch (err) {
        console.error("❌ Failed to send email:", err.message);
    }
    process.exit();
};

testSpecificReminder();
