import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import reservationRoutes from './src/routes/reservationRoutes.js';
import deliveryRoutes from './src/routes/deliveryRoutes.js';
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Zooba API is running' });
});

// 404 handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    hint: 'Make sure you are using the correct endpoint. All API routes start with /api/'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Zooba Restaurant API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      reservations: '/api/reservations',
      delivery: '/api/delivery',
      inventory: '/api/inventory',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      users: '/api/users'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zooba';

// MongoDB connection options (mongoose 6+ handles these automatically)
const mongooseOptions = {};

// For MongoDB Atlas (mongodb+srv), SSL/TLS is handled automatically
// For local MongoDB, no SSL needed

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    }).on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n Port ${PORT} is already in use!`);
        console.error('Please either:');
        console.error(`  1. Stop the process using port ${PORT}`);
        console.error(`  2. Change the PORT in your .env file`);
        console.error(`\nTo find what's using the port, run:`);
        console.error(`  netstat -ano | findstr :${PORT}`);
        console.error(`\nTo kill the process (Windows):`);
        console.error(`  taskkill /PID <process_id> /F`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error(' MongoDB connection error:', error.message);
    console.error('\n Troubleshooting tips:');
    console.error('1. Check your MONGODB_URI in .env file');
    console.error('2. For MongoDB Atlas: Ensure your IP is whitelisted');
    console.error('3. For local MongoDB: Make sure MongoDB is running');
    console.error('4. Check your internet connection (for Atlas)');
    process.exit(1);
  });

export default app;

