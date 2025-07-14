import pool from '../config/dbConnection.js';

async function runSchema() {
    try {
        await pool.query(`
      CREATE TABLE pending_orders (
  id SERIAL PRIMARY KEY,
  buyer_qty INT DEFAULT 0 CHECK (buyer_qty >= 0),
  buyer_price DECIMAL(10,2),
  seller_qty INT DEFAULT 0 CHECK (seller_qty >= 0),
  seller_price DECIMAL(10,2)
);
ALTER TABLE pending_orders OWNER TO admin;

      CREATE TABLE completed_orders (
  id SERIAL PRIMARY KEY,
  price DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE completed_orders OWNER TO admin;

CREATE INDEX idx_pending_buyer_price ON pending_orders (buyer_price);
CREATE INDEX idx_pending_seller_price ON pending_orders (seller_price);

    `);

        console.log('Schema applied!');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

runSchema();
