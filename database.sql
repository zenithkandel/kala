-- कला Database Schema
CREATE DATABASE IF NOT EXISTS kala_db;
USE kala_db;

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    school VARCHAR(150) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    bio TEXT,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('sketch', 'painting', 'digital', 'sculpture', 'mixed_media', 'other') NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    artist_id INT NOT NULL,
    status ENUM('available', 'sold', 'pending') DEFAULT 'available',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_name VARCHAR(100) NOT NULL,
    buyer_email VARCHAR(100) NOT NULL,
    buyer_phone VARCHAR(20),
    buyer_address TEXT NOT NULL,
    artwork_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('cash_on_delivery', 'esewa', 'khalti', 'bank_transfer') DEFAULT 'cash_on_delivery',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- Categories table for better organization
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
('sketch', 'Pencil sketches and drawings', 'fas fa-pencil-alt'),
('painting', 'Watercolor, oil, and acrylic paintings', 'fas fa-palette'),
('digital', 'Digital art and illustrations', 'fas fa-laptop'),
('sculpture', '3D sculptures and models', 'fas fa-cube'),
('mixed_media', 'Mixed media artworks', 'fas fa-layer-group'),
('other', 'Other forms of art', 'fas fa-star');

-- Sample data for testing
INSERT INTO artists (name, email, school, grade, bio) VALUES
('राम श्रेष्ठ', 'ram.shrestha@email.com', 'शान्ति माध्यमिक विद्यालय', 'कक्षा १०', 'मलाई चित्रकला मन पर्छ र म प्रकृतिका चित्रहरू बनाउँछु।'),
('सीता गुरुङ', 'sita.gurung@email.com', 'हिमालय उच्च माध्यमिक विद्यालय', 'कक्षा ९', 'डिजिटल आर्टमा रुचि छ र एनिमे क्यारेक्टरहरू बनाउँछु।'),
('हरि तामाङ', 'hari.tamang@email.com', 'सरस्वती विद्यालय', 'कक्षा ८', 'स्केच गर्न मन पर्छ र पोर्ट्रेटमा विशेषज्ञता छ।');

INSERT INTO artworks (title, description, price, category, image_url, artist_id) VALUES
('हिमालयको दृश्य', 'सुन्दर हिमालयको पानी रङको चित्र', 500.00, 'painting', '/uploads/sample1.jpg', 1),
('एनिमे गर्ल', 'डिजिटल एनिमे क्यारेक्टर', 300.00, 'digital', '/uploads/sample2.jpg', 2),
('पोर्ट्रेट स्केच', 'पेन्सिलले बनाएको पोर्ट्रेट', 250.00, 'sketch', '/uploads/sample3.jpg', 3);
