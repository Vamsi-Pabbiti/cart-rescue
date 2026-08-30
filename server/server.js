import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initSockets } from './sockets/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import actionRoutes from './routes/actionRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import datasetRoutes from './routes/datasetRoutes.js';
import demoRoutes from './routes/demoRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});
initSockets(io);

app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Cart Rescue API', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/demo', demoRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend assets if built (Production Unified Single Service)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Cart Rescue Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
