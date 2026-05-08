import { getReminderTemplate } from './src/utils/emailTemplates.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testReminder = async () => {
    console.log('--- Testing Reminder Notification System ---');
    
    // Simulate booking data
    const emailData = {
        customerName: 'Test User',
        salonName: 'Beautex Luxury Salon',
        startTime: new Date(Date.now() + 15 * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        services: 'Signature Hair Spa & Styling'
    };

    console.log('\n[Generated Email Template Data]');
    console.log(emailData);

    const isTestMode = !process.env.SMTP_USER || process.env.SMTP_USER.includes('placeholder');
    
    if (isTestMode) {
        console.log('\n[SYSTEM IS IN DEV MODE] - No real SMTP credentials found in .env');
        console.log('The system will log the email instead of sending it.\n');
        
        console.log('--- EMAIL SIMULATION START ---');
        console.log(`To: test@example.com`);
        console.log(`Subject: ✨ 15 Minutes to Your Ritual - Beautex Luxe`);
        console.log(`Body (HTML length): ${getReminderTemplate(emailData).length} characters`);
        console.log('--- EMAIL SIMULATION END ---\n');
        console.log('Note: To send real emails, update SMTP_USER and SMTP_PASS in server/.env');
    } else {
        console.log('\n[SYSTEM IS IN LIVE MODE] - SMTP Credentials found.');
        console.log(`Attempting to send email from ${process.env.SMTP_USER}...`);
        
        try {
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

            await transporter.sendMail({
                from: `"Beautex Luxe" <${process.env.SMTP_USER}>`,
                to: process.env.SMTP_USER, // sending to self for test
                subject: '[TEST] ✨ 15 Minutes to Your Ritual - Beautex Luxe',
                html: getReminderTemplate(emailData)
            });
            console.log('✅ Success! Test email sent to your SMTP_USER address.');
        } catch (err) {
            console.error('❌ Failed to send email. Check your SMTP credentials:', err.message);
        }
    }
};

testReminder();
