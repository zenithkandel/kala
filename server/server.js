import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import artworksRouter from './routes/artworks.js';
const session = require("express-session");
const bcrypt = require("bcrypt"); // optional if you want to hash, otherwise plain compare

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/artworks', artworksRouter);

// Fallback to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`कला server running at http://localhost:${PORT}`);
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "kalaa_secret_key",
  resave: false,
  saveUninitialized: false,
}));

// Middleware: require admin login
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

// Admin login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.isAdmin = true;
    return res.json({ message: "Login successful" });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

// Admin logout
app.post("/admin/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

// Protected routes
app.get("/admin/artworks", requireAdmin, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM artworks ORDER BY id DESC");
  res.json(rows);
});

app.post("/admin/artworks", requireAdmin, async (req, res) => {
  const { title, category, price, image_url } = req.body;
  await pool.query(
    "INSERT INTO artworks (title, category, price, image_url) VALUES (?, ?, ?, ?)",
    [title, category, price, image_url]
  );
  res.json({ message: "Artwork added" });
});

app.put("/admin/artworks/:id", requireAdmin, async (req, res) => {
  const { title, category, price, image_url } = req.body;
  await pool.query(
    "UPDATE artworks SET title=?, category=?, price=?, image_url=? WHERE id=?",
    [title, category, price, image_url, req.params.id]
  );
  res.json({ message: "Artwork updated" });
});

app.delete("/admin/artworks/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM artworks WHERE id=?", [req.params.id]);
  res.json({ message: "Artwork deleted" });
});

app.get("/admin/orders", requireAdmin, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM orders ORDER BY id DESC");
  res.json(rows);
});
