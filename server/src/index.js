import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import salonRoutes from './routes/salonRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import razorpayRoutes from './routes/razorpayRoutes.js';
import productRoutes from './routes/productRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import { getAvailableSlots, getStaffForSalon } from './controllers/availabilityController.js';


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/shops', salonRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/products', productRoutes);
app.use('/api/announcements', announcementRoutes);
app.get('/api/availability/slots', getAvailableSlots);
app.get('/api/availability/staff/:salon_id', getStaffForSalon);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Beautex API is running');
});

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🚀 INITIALIZING BEAUTEX SERVER...');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ LIVE: Beautex API listening on http://0.0.0.0:${PORT}`);
});
