const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kala_db'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/artist/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'artist.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// API Routes
app.get('/api/artworks', (req, res) => {
    const query = `
        SELECT a.*, ar.name as artist_name, ar.school, ar.grade 
        FROM artworks a 
        JOIN artists ar ON a.artist_id = ar.id 
        ORDER BY a.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

app.get('/api/artists', (req, res) => {
    const query = 'SELECT * FROM artists ORDER BY name';
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

app.post('/api/artists', (req, res) => {
    const { name, email, school, grade, bio } = req.body;
    const query = 'INSERT INTO artists (name, email, school, grade, bio) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [name, email, school, grade, bio], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: result.insertId, message: 'Artist registered successfully' });
        }
    });
});

app.post('/api/artworks', upload.single('artwork'), (req, res) => {
    const { title, description, price, category, artist_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const query = 'INSERT INTO artworks (title, description, price, category, image_url, artist_id) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [title, description, price, category, image_url, artist_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: result.insertId, message: 'Artwork uploaded successfully' });
        }
    });
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

app.listen(PORT, () => {
    console.log(`कला server running on http://localhost:${PORT}`);
});
