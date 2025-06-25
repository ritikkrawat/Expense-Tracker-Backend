const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const favicon = require('serve-favicon');

dotenv.config();

const connectDB = require('../config/db');
const authRoutes = require('../routes/authRoutes');
const incomeRoutes = require('../routes/incomeRoutes');
const expenseRoutes = require('../routes/expenseRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');

const app = express();

app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

connectDB();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/income', incomeRoutes);
app.use('/api/v1/expense', expenseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Export as serverless function
module.exports = app;
module.exports.handler = serverless(app);
