-- ---------------------------------------
-- 1️⃣ Create the database (run as postgres)
-- ---------------------------------------

CREATE DATABASE order_matching OWNER admin;

-- ---------------------------------------
-- 2️⃣ Switch to your new DB
-- ---------------------------------------

\c order_matching

-- ---------------------------------------
-- 3️⃣ Create the admin user if needed
-- (Skip this if it already exists!)
-- ---------------------------------------

CREATE USER admin WITH PASSWORD 'admin';
ALTER USER admin CREATEDB;

-- ---------------------------------------
-- 4️⃣ Create pending_orders table, owned by admin
-- ---------------------------------------

CREATE TABLE pending_orders (
  id SERIAL PRIMARY KEY,
  buyer_qty INT DEFAULT 0 CHECK (buyer_qty >= 0),
  buyer_price DECIMAL(10,2),
  seller_qty INT DEFAULT 0 CHECK (seller_qty >= 0),
  seller_price DECIMAL(10,2)
);

ALTER TABLE pending_orders OWNER TO admin;

-- ---------------------------------------
-- 5️⃣ Create completed_orders table, owned by admin
-- ---------------------------------------

CREATE TABLE completed_orders (
  id SERIAL PRIMARY KEY,
  price DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE completed_orders OWNER TO admin;

-- ---------------------------------------
-- 6️⃣ Add indexes for performance
-- ---------------------------------------

CREATE INDEX idx_pending_buyer_price ON pending_orders (buyer_price);
CREATE INDEX idx_pending_seller_price ON pending_orders (seller_price);

-- ---------------------------------------
-- ✅ Done — admin owns all tables!
-- No permission errors when app connects.
-- ---------------------------------------
