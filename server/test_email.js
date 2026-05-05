import { sendOtpEmail } from './src/services/mailService.js';

async function test() {
    try {
        console.log('Testing OTP email...');
        const res = await sendOtpEmail('test@gmail.com', '123456', 'Test User');
        console.log('Result:', res);
    } catch (e) {
        console.error('Test script error:', e);
    }
}

test();
