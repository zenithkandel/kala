import express from 'express';
import pool from '../db.js';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// LOGIN (hashed password)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_HASH = process.env.ADMIN_HASH || bcrypt.hashSync('supersecret', 10);
    if (username === ADMIN_USER && bcrypt.compareSync(password, ADMIN_HASH)) {
      req.session.isAdmin = true;
      req.session.adminUser = username;
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.json({ success: true });
  });
});

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'public/images/artworks'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// CRUD endpoints with pagination
router.get('/artworks', requireAdmin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query('SELECT * FROM artworks ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

router.post('/artworks', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, artist_name, price, category, description } = req.body;
    if (!title || !artist_name || typeof price === 'undefined') return res.status(400).json({ error: 'Missing fields' });
    let image_url = req.body.image_url || '';
    if (req.file) {
      image_url = '/images/artworks/' + req.file.filename;
    }
    const [result] = await pool.query(
      'INSERT INTO artworks (title, artist_name, price, category, image_url, description) VALUES (?,?,?,?,?,?)',
      [title, artist_name, price, category || 'Sketch', image_url, description || '']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add artwork' });
  }
});

router.put('/artworks/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, artist_name, price, category, description, is_sold } = req.body;
    let image_url = req.body.image_url || '';
    if (req.file) {
      image_url = '/images/artworks/' + req.file.filename;
    }
    await pool.query(
      'UPDATE artworks SET title=?, artist_name=?, price=?, category=?, image_url=?, description=?, is_sold=? WHERE id=?',
      [title, artist_name, price, category || 'Sketch', image_url, description || '', is_sold ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update artwork' });
  }
});

router.delete('/artworks/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM artworks WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

router.put('/artworks/:id/mark-sold', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { sold } = req.body;
    await pool.query('UPDATE artworks SET is_sold=? WHERE id=?', [sold ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query('SELECT o.*, a.title AS artwork_title, a.artist_name FROM orders o LEFT JOIN artworks a ON o.artwork_id = a.id ORDER BY o.id DESC LIMIT ? OFFSET ?', [limit, offset]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;