import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import session from 'express-session';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import artworksRouter from './routes/artworks.js';
import adminRouter from './routes/admin.js';

dotenv.config();
const app = express();

app.use(cors());
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
    // secure: true, // enable with HTTPS in production
    maxAge: 1000 * 60 * 60 * 8,
  }
}));

// CSRF protection
const csrfProtection = csrf();
app.use(csrfProtection);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/artworks', artworksRouter);
app.use('/admin-api', adminRouter);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`कला server running at http://localhost:${PORT}`);
});