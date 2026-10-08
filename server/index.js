const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const { disconnectDB } = connectDB;
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { startReminderScheduler } = require('./services/reminderService');
const { validateEnvironment } = require('./utils/environment');
const { ensureTesterAccounts, logTesterAccounts } = require('./utils/seedTesterAccounts');
const { ensureDummyData } = require('./utils/seedDummyData');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

const allowedOrigins = new Set((process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean));

if (process.env.NODE_ENV !== 'production') {
  for (const origin of [...allowedOrigins]) {
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost') {
        url.hostname = '127.0.0.1';
        allowedOrigins.add(url.origin);
      } else if (url.hostname === '127.0.0.1') {
        url.hostname = 'localhost';
        allowedOrigins.add(url.origin);
      }
    } catch {
      // Invalid values are ignored and will fail the exact origin check below.
    }
  }
}

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait and try again.' },
}));

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.status(200).json({
  success: true,
  message: 'DOCVIA API is running.',
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString(),
}));

app.use((req, res) => res.status(404).json({
  success: false,
  message: `Route ${req.method} ${req.originalUrl} not found.`,
}));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  validateEnvironment();
  await connectDB();
  if (process.env.NODE_ENV !== 'production' && process.env.USE_IN_MEMORY_DB === 'true') {
    await ensureDummyData();
    await ensureTesterAccounts();
    logTesterAccounts();
  }
  server = app.listen(PORT, () => {
    console.log(`DOCVIA API running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Server: http://localhost:${PORT}`);
  });
  startReminderScheduler();
  return server;
};

const shutdown = async () => {
  const exit = async (code) => {
    await disconnectDB();
    process.exit(code);
  };
  if (!server) return exit(0);
  server.close(() => exit(0));
  setTimeout(() => exit(1), 10000).unref();
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  });
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = { app, startServer };
