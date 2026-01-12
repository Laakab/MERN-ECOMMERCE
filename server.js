const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Add this line
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload limit for file uploads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Import route files
const deleteRoutes = require('./App_Delete');
const getRoutes = require('./App_Get');
const postRoutes = require('./App_Post');
const putRoutes = require('./App_Put');

// Use route files
app.use(deleteRoutes);
app.use(getRoutes);
app.use(postRoutes);
app.use(putRoutes);

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/DB1', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.error(err));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/events')) {
  fs.mkdirSync('uploads/events', { recursive: true });
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));