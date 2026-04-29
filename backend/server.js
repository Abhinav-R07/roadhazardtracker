require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/user');
const { Server } = require('socket.io');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const hazardRoutes = require('./routes/hazard');

const app = express();

// Validate essential environment variables early
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Missing environment variables. Please set MONGODB_URI and JWT_SECRET.');
  process.exit(1);
}

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Road Hazard Tracker API is running!' });
});

// Import and register route modules
app.use('/api/auth', authRoutes);
app.use('/api/hazards', hazardRoutes);

// Centralized 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// MongoDB connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
      break;
    } catch (err) {
      attempt++;
      console.error(`MongoDB connection attempt ${attempt} failed`);
      if (attempt >= maxRetries) {
        console.error('Exceeded max MongoDB connection attempts. Exiting.');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 2000)); // wait 2 secs before retry
    }
  }
};

// Create HTTP and Socket.IO servers
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Socket.IO events
io.on('connection', socket => {
  console.log('New client connected:', socket.id);

  socket.on('reportHazard', hazardData => {
    console.log('Hazard reported:', hazardData);
    socket.broadcast.emit('newHazard', hazardData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

// Start server after DB connection
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
