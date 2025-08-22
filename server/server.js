import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import session from 'express-session';
import artworksRouter from './routes/artworks.js';
import adminRouter from './routes/admin.js';

dotenv.config();
const app = express();

app.use(cors()); // same-origin static + APIs; it's fine for local
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// sessions
app.use(session({
  name: 'kalaa.sid',
  secret: process.env.SESSION_SECRET || 'kalaa_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // secure: true, // disable for local; enable with HTTPS in production
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  }
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static assets (client + admin)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes (public)
app.use('/api/artworks', artworksRouter);

// Admin routes (protected by middleware inside adminRouter)
app.use('/admin-api', adminRouter);

// Fallback (serve SPA / index)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`कला server running at http://localhost:${PORT}`);
});
