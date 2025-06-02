import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data', 'db');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'salomarket.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    seller_id INTEGER NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'available',
    buyer_id INTEGER,
    listing_type TEXT DEFAULT 'fixed',
    starting_price REAL,
    current_bid REAL,
    auction_end DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    buyer_contact TEXT NOT NULL,
    contact_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    bidder_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (bidder_id) REFERENCES users(id)
  );
`);

// Add auction columns to existing products table if they don't exist
try {
  db.exec(`ALTER TABLE products ADD COLUMN listing_type TEXT DEFAULT 'fixed'`);
} catch {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE products ADD COLUMN starting_price REAL`);
} catch {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE products ADD COLUMN current_bid REAL`);
} catch {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE products ADD COLUMN auction_end DATETIME`);
} catch {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE products ADD COLUMN min_bid_step REAL DEFAULT 0.01`);
} catch {
  // Column already exists
}

// User operations
export const createUser = db.prepare(`
  INSERT INTO users (username, password, is_admin)
  VALUES (@username, @password, @is_admin)
`);

export const getUserByUsername = db.prepare(`
  SELECT * FROM users WHERE username = ?
`);

export const getUserById = db.prepare(`
  SELECT * FROM users WHERE id = ?
`);

// Product operations
export const createProduct = db.prepare(`
  INSERT INTO products (name, short_description, long_description, price, stock, seller_id, category, listing_type, starting_price, current_bid, auction_end, min_bid_step)
  VALUES (@name, @short_description, @long_description, @price, @stock, @seller_id, @category, @listing_type, @starting_price, @current_bid, @auction_end, @min_bid_step)
`);

export const getProductById = db.prepare(`
  SELECT p.*, u.username as seller_name
  FROM products p
  JOIN users u ON p.seller_id = u.id
  WHERE p.id = ?
`);

export const getAllProducts = db.prepare(`
  SELECT p.*, u.username as seller_name, 
    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
  FROM products p
  JOIN users u ON p.seller_id = u.id
  WHERE p.status = 'available'
  ORDER BY p.created_at DESC
`);

export const getProductsByUserId = db.prepare(`
  SELECT p.*, 
    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
  FROM products p
  WHERE p.seller_id = ?
  ORDER BY p.created_at DESC
`);

// Product image operations
export const addProductImage = db.prepare(`
  INSERT INTO product_images (product_id, image_url, is_primary)
  VALUES (@product_id, @image_url, @is_primary)
`);

export const getProductImages = db.prepare(`
  SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC
`);

// Delete product
export const deleteProduct = db.prepare(`
  DELETE FROM products WHERE id = ? AND seller_id = ?
`);

export const deleteProductAdmin = db.prepare(`
  DELETE FROM products WHERE id = ?
`);

// Purchase operations
export const createPurchase = db.prepare(`
  INSERT INTO purchases (product_id, buyer_id, buyer_contact, contact_type)
  VALUES (@product_id, @buyer_id, @buyer_contact, @contact_type)
`);

export const markProductAsSold = db.prepare(`
  UPDATE products 
  SET status = 'sold', buyer_id = ?
  WHERE id = ?
`);

// Notification operations
export const createNotification = db.prepare(`
  INSERT INTO notifications (user_id, type, message, data)
  VALUES (@user_id, @type, @message, @data)
`);

export const getNotificationsByUserId = db.prepare(`
  SELECT * FROM notifications
  WHERE user_id = ?
  ORDER BY created_at DESC
`);

export const markNotificationAsRead = db.prepare(`
  UPDATE notifications
  SET is_read = 1
  WHERE id = ?
`);

export const getUnreadNotificationCount = db.prepare(`
  SELECT COUNT(*) as count
  FROM notifications
  WHERE user_id = ? AND is_read = 0
`);

// Get products for buyer/seller even if sold
export const getProductsForUser = db.prepare(`
  SELECT p.*, u.username as seller_name,
    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
  FROM products p
  JOIN users u ON p.seller_id = u.id
  WHERE p.seller_id = ? OR p.buyer_id = ?
  ORDER BY p.created_at DESC
`);

// Helper functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export default db;

// Bid operations
export const createBid = db.prepare(`
  INSERT INTO bids (product_id, bidder_id, amount)
  VALUES (@product_id, @bidder_id, @amount)
`);

export const getBidsByProductId = db.prepare(`
  SELECT b.*, u.username as bidder_name
  FROM bids b
  JOIN users u ON b.bidder_id = u.id
  WHERE b.product_id = ?
  ORDER BY b.amount DESC, b.created_at ASC
`);

export const updateProductCurrentBid = db.prepare(`
  UPDATE products
  SET current_bid = ?
  WHERE id = ?
`);

// Get active auctions
export const getActiveAuctions = db.prepare(`
  SELECT p.*, u.username as seller_name,
    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
  FROM products p
  JOIN users u ON p.seller_id = u.id
  WHERE p.listing_type = 'auction' 
    AND p.status = 'available'
    AND datetime(p.auction_end) > datetime('now')
  ORDER BY p.created_at DESC
`);

// Get ended auctions that need processing
export const getEndedAuctions = db.prepare(`
  SELECT p.*
  FROM products p
  WHERE p.listing_type = 'auction' 
    AND p.status = 'available'
    AND datetime(p.auction_end) <= datetime('now')
`);

// Get highest bid for a product
export const getHighestBid = db.prepare(`
  SELECT b.*, u.username as bidder_name
  FROM bids b
  JOIN users u ON b.bidder_id = u.id
  WHERE b.product_id = ?
  ORDER BY b.amount DESC, b.created_at ASC
  LIMIT 1
`);

// Mark auction as sold to winner
export const markAuctionAsSold = db.prepare(`
  UPDATE products
  SET status = 'sold', buyer_id = ?
  WHERE id = ?
`);

// Initialize admin user
import('./init-admin');