import nodemailer from 'nodemailer';

/**
 * Premium Email Template for Beautex Luxury Reminders
 */
export const getReminderTemplate = (data) => {
    const { customerName, salonName, startTime, date, services } = data;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #1A1A1A; border-radius: 40px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; }
            .header { background: linear-gradient(135deg, #00E6A0 0%, #00966a 100%); padding: 60px 40px; text-align: center; }
            .content { padding: 50px 40px; }
            h1 { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0; color: #000000; font-style: italic; }
            p { color: #888888; font-size: 16px; line-height: 1.6; }
            .highlight { color: #00E6A0; font-weight: bold; }
            .card { background-color: #111111; border: 1px solid #222222; border-radius: 24px; padding: 30px; margin: 30px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #1A1A1A; padding-bottom: 15px; }
            .detail-label { color: #555555; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
            .detail-value { color: #ffffff; font-weight: bold; font-size: 14px; }
            .footer { padding: 40px; text-align: center; border-top: 1px solid #1A1A1A; color: #444444; font-size: 12px; }
            .button { display: inline-block; background-color: #00E6A0; color: #000000; padding: 18px 35px; border-radius: 16px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Ritual Reminder</h1>
            </div>
            <div class="content">
                <p>Hello <span class="highlight">${customerName}</span>,</p>
                <p>Your transformation at <span class="highlight">${salonName}</span> is about to begin. We are preparing the sanctuary for your arrival in 15 minutes.</p>
                
                <div class="card">
                    <div class="detail-row">
                        <span class="detail-label">Appoinment Time</span>
                        <span class="detail-value">${startTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${date}</span>
                    </div>
                    <div class="detail-row" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
                        <span class="detail-label">Rituals</span>
                        <span class="detail-value">${services}</span>
                    </div>
                </div>

                <p style="text-align: center;">
                    <a href="http://localhost:5173/my-bookings" class="button">View Booking Details</a>
                </p>
            </div>
            <div class="footer">
                &copy; 2026 BEAUTEX LUXE • THE ART OF GROOMING<br>
                Please arrive 5 minutes early to settle into the luxury experience.
            </div>
        </div>
    </body>
    </html>
    `;
};
