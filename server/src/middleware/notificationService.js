import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'placeholder@gmail.com',
        pass: process.env.SMTP_PASS || 'password'
    }
});

export const sendBookingConfirmation = async (email, bookingDetails) => {
    try {
        const mailOptions = {
            from: `"Beautex Luxe" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reservation Confirmed - Beautex Luxe Sanctuary',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #fff; padding: 40px; border-radius: 30px;">
                    <h1 style="color: #00E6A0; text-transform: uppercase; font-style: italic;">Reservation Confirmed</h1>
                    <p>Your sanctuary journey is scheduled. We are preparing for your arrival.</p>
                    <div style="background: #0A0A0A; padding: 25px; border-radius: 20px; border: 1px solid #1A1A1A; margin: 30px 0;">
                        <h3 style="margin-top: 0; color: #00E6A0;">Booking Details</h3>
                        <p><strong>Ref Code:</strong> #${bookingDetails.booking_number}</p>
                        <p><strong>Venue:</strong> ${bookingDetails.salon_name}</p>
                        <p><strong>Schedule:</strong> ${bookingDetails.date} at ${bookingDetails.time}</p>
                        <p><strong>Artisan:</strong> ${bookingDetails.staff_name || 'Any Available'}</p>
                    </div>
                    <p style="color: #555; font-size: 12px;">This is an automated confirmation from the Beautex Strategic Intelligence System.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Email notification failed:', error);
        return false;
    }
};
