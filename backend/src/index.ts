import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchCompany } from './routes/search.js';
import { createOrder } from './routes/orders.js';
import { payment } from './routes/payment.js';
import { netopiaPayment } from './routes/netopia.js';
import { generateCertificate } from './routes/certificate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

// CORS configuration - allow Vercel and localhost
const corsOptions = {
  origin: [
    'http://localhost:4000',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    /\.vercel\.app$/,
    /\.railway\.app$/,
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/search', searchCompany);
app.use('/api/orders', createOrder);
app.use('/api/payment', payment);
app.use('/api/payment/netopia', netopiaPayment);
app.use('/api/certificate', generateCertificate);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

