import express from 'express';
import pool from '../db.js';
const router = express.Router();

// GET /api/artworks?search=&category=&maxPrice=&includeSold=false
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', maxPrice = '', includeSold = 'false' } = req.query;
    const parts = [];
    const params = [];

    if (search) {
      parts.push('(title LIKE ? OR artist_name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      parts.push('category = ?');
      params.push(category);
    }
    if (maxPrice) {
      parts.push('price <= ?');
      params.push(Number(maxPrice));
    }
    if (includeSold !== 'true') {
      parts.push('is_sold = 0');
    }

    const where = parts.length ? 'WHERE ' + parts.join(' AND ') : '';
    const [rows] = await pool.query(`SELECT * FROM artworks ${where} ORDER BY created_at DESC`, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// POST /api/artworks  (simple admin add; no auth for demo)
router.post('/', async (req, res) => {
  try {
    const { title, artist_name, price, category, image_url, description } = req.body;
    if (!title || !artist_name || !price) return res.status(400).json({ error: 'Missing required fields' });
    const [result] = await pool.query(
      'INSERT INTO artworks (title, artist_name, price, category, image_url, description) VALUES (?,?,?,?,?,?)',
      [title, artist_name, price, category || 'Sketch', image_url || '', description || '']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add artwork' });
  }
});

// POST /api/orders (simulate checkout)
router.post('/order', async (req, res) => {
  try {
    const { artwork_id, buyer_name, buyer_email, amount } = req.body;
    if (!artwork_id || !buyer_name || !buyer_email || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // ensure artwork exists and not sold
      const [rows] = await conn.query('SELECT * FROM artworks WHERE id=? FOR UPDATE', [artwork_id]);
      if (!rows.length) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: 'Artwork not found' });
      }
      const art = rows[0];
      if (art.is_sold) {
        await conn.rollback();
        conn.release();
        return res.status(409).json({ error: 'Already sold' });
      }
      await conn.query(
        'INSERT INTO orders (artwork_id, buyer_name, buyer_email, amount) VALUES (?,?,?,?)',
        [artwork_id, buyer_name, buyer_email, amount]
      );
      await conn.query('UPDATE artworks SET is_sold=1 WHERE id=?', [artwork_id]);
      await conn.commit();
      conn.release();
      res.json({ success: true });
    } catch (e) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

export default router;
