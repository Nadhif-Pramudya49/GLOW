const express = require('express');
const cors = require('cors');
const path = require('path');
const locationRoutes = require('./routes/location.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const ownerRoutes = require('./routes/owner.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const productivityRoutes = require('./routes/productivity.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend (client) as static files
app.use(express.static(path.join(__dirname, '..', 'client')));

const packageRoutes = require('./routes/package.routes');
const favoriteRoutes = require('./routes/favorite.routes');

app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/productivity', productivityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/favorites', favoriteRoutes);

// SPA catch-all: serve index.html for any non-API route
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({ error: 'Global Error: ' + err.message });
});

module.exports = app;
