import express from 'express';
import pool from '../db.js';
const router = express.Router();

// Simple requireAdmin middleware (uses session)
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// LOGIN (compare with .env)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASS || 'supersecret';

    if (username === ADMIN_USER && password === ADMIN_PASS) {
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

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.json({ success: true });
  });
});

/* ADMIN ARTWORKS */
// list all artworks (including sold)
router.get('/artworks', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM artworks ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// add artwork
router.post('/artworks', requireAdmin, async (req, res) => {
  try {
    const { title, artist_name, price, category, image_url, description } = req.body;
    if (!title || !artist_name || typeof price === 'undefined') return res.status(400).json({ error: 'Missing fields' });
    const [result] = await pool.query(
      'INSERT INTO artworks (title, artist_name, price, category, image_url, description) VALUES (?,?,?,?,?,?)',
      [title, artist_name, price, category || 'Sketch', image_url || '', description || '']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add artwork' });
  }
});

// update artwork
router.put('/artworks/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, artist_name, price, category, image_url, description, is_sold } = req.body;
    await pool.query(
      'UPDATE artworks SET title=?, artist_name=?, price=?, category=?, image_url=?, description=?, is_sold=? WHERE id=?',
      [title, artist_name, price, category || 'Sketch', image_url || '', description || '', is_sold ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update artwork' });
  }
});

// delete artwork
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

// mark sold/un-sold
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

/* ORDERS (view) */
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT o.*, a.title AS artwork_title, a.artist_name FROM orders o LEFT JOIN artworks a ON o.artwork_id = a.id ORDER BY o.id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
