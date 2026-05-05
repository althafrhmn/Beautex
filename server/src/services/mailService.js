import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    console.log(`📧 Mail Service: LIVE MODE — Sending from ${process.env.EMAIL_USER}`);
} else {
    console.log('📧 Mail Service: DEV MODE — OTPs will be printed to console (no EMAIL_USER/EMAIL_PASS found in .env)');
}

/**
 * Sends a 6-digit OTP to the user's email
 * @param {string} toEmail 
 * @param {string} otpCode 
 * @param {string} userName (Optional)
 */
export const sendOtpEmail = async (toEmail, otpCode, userName = 'Valued Customer') => {
    // If no email credentials, fallback to console logging (Dev Mode)
    if (!transporter) {
        console.log('\n=========================================');
        console.log(`🚀 DEV MODE: OTP for ${toEmail} is: [ ${otpCode} ]`);
        console.log('=========================================\n');
        return { success: true, devMode: true };
    }

    const mailOptions = {
        from: `"BeauteX Luxe" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your BeauteX Security Verification Code',
        html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #1a1a1a;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; background-color: #00E6A0; color: #050505; font-weight: 900; font-size: 24px; padding: 12px 24px; border-radius: 12px;">B</div>
                    <h1 style="color: #ffffff; margin-top: 20px; font-weight: 900; letter-spacing: -1px;">BEAUTEX</h1>
                </div>
                
                <h2 style="font-weight: 800; font-size: 24px; margin-bottom: 20px;">Identity Verification</h2>
                <p style="color: #888888; line-height: 1.6; margin-bottom: 30px;">
                    Hello ${userName},<br/>
                    We received a request to access your BeauteX profile. Please use the following one-time security code to finalize your authentication.
                </p>
                
                <div style="background-color: #0d0d0d; border: 1px solid #222222; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
                    <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #00E6A0; font-family: monospace;">${otpCode}</span>
                </div>
                
                <p style="color: #666666; font-size: 14px; margin-bottom: 40px;">
                    This code is strictly for your personal use and will expire in 10 minutes. <strong>Do not share this code</strong> with anyone, including BeauteX staff.
                </p>
                
                <div style="border-top: 1px solid #1a1a1a; padding-top: 30px; text-align: center; color: #444444; font-size: 12px; font-weight: 700; letter-spacing: 1px;">
                    &copy; 2026 BEAUTEX LUXE &bull; PERSONAL IDENTITY ARCHITECTS
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email successfully dispatched to: ${toEmail}`);
        console.log(`🚀 DEBUG: OTP for ${toEmail} is: [ ${otpCode} ]`); // Log for testing
        return { success: true };
    } catch (error) {
        console.error('❌ Mail dispatch failed. Full error:');
        console.error('   Error Code:', error.code);
        console.error('   Error Message:', error.message);
        console.error('   Response:', error.response);
        console.log('\n=========================================');
        console.log(`⚠️  EMAIL FAILED — Falling back to console OTP`);
        console.log(`🚀 OTP for ${toEmail} is: [ ${otpCode} ]`);
        console.log('=========================================');
        console.log('💡 TIP: Check your EMAIL_USER and EMAIL_PASS in server/.env');
        console.log('   - EMAIL_USER should be your full Gmail address');
        console.log('   - EMAIL_PASS should be a 16-char App Password (no spaces)\n');
        // Don't throw — return success so the user can still test with the console OTP
        return { success: true, fallback: true };
    }
};
