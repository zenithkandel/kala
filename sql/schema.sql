-- Create database and tables for 'कला'
CREATE DATABASE IF NOT EXISTS kalaa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kalaa_db;

-- Artworks
CREATE TABLE IF NOT EXISTS artworks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  artist_name VARCHAR(120) NOT NULL,
  price INT NOT NULL CHECK (price >= 0),
  category VARCHAR(80) DEFAULT 'Sketch',
  image_url VARCHAR(255) DEFAULT '',
  description TEXT,
  is_sold TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artwork_id INT NOT NULL,
  buyer_name VARCHAR(120) NOT NULL,
  buyer_email VARCHAR(180) NOT NULL,
  amount INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

-- Seed sample artworks (prices in NPR)
INSERT INTO artworks (title, artist_name, price, category, image_url, description) VALUES
('Mountain Dawn', 'Sujal K.', 300, 'Sketch', '/images/mountain.jpg', 'Pencil sketch of a Himalayan morning.'),
('City Rain', 'Pragati S.', 500, 'Watercolor', '/images/rain.jpg', 'Rainy evening on a busy street.'),
('Old Temple Lines', 'Ritvik T.', 200, 'Line Art', '/images/temple.jpg', 'Minimal line art of a pagoda.'),
('Pashmina Dreams', 'Asmita R.', 1500, 'Digital', '/images/dreams.jpg', 'Digital art inspired by textile patterns.');
