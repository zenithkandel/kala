# कला — Student Art Marketplace (NPR 200–1500)

A minimal, fast, and responsive marketplace for school-level students to sell their art at affordable prices.

## Features
- Modern, minimal design with dark/light theme
- Responsive layout, custom scrollbar, smooth scrolling
- Gentle particle background and micro-interactions
- Search, category, and price filtering
- Simple checkout simulation (records order + marks artwork sold)
- Vanilla HTML/CSS/JS front-end — no frameworks
- Node.js (Express) + MySQL backend

## Quick Start
1. Install dependencies
   ```bash
   npm install
   ```

2. Create database and tables
   - Start MySQL locally.
   - Import the schema and seed data:
     ```sql
     SOURCE sql/schema.sql;
     ```

3. Configure environment
   - Copy `.env.example` to `.env` and set credentials:
     ```ini
     PORT=3000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=kalaa_db
     ```

4. Run the server
   ```bash
   npm run start
   ```
   Open http://localhost:3000

## API (minimal)
- `GET /api/artworks?search=&category=&maxPrice=&includeSold=false`
- `POST /api/artworks` — add new artwork (demo, no auth)
  ```json
  {
    "title": "Sunset Sketch",
    "artist_name": "Aakriti S.",
    "price": 300,
    "category": "Sketch",
    "image_url": "https://...",
    "description": "My first sketch"
  }
  ```
- `POST /api/artworks/order` — simulate checkout
  ```json
  {
    "artwork_id": 1,
    "buyer_name": "Zenith",
    "buyer_email": "zen@example.com",
    "amount": 300
  }
  ```

## Notes
- For production, add authentication, image uploads, proper payment gateways (eSewa/Khalti), server-side validation, and file storage (S3, etc.).
- All prices are in NPR; you can enforce `CHECK (price BETWEEN 0 AND 1500)` if desired.
