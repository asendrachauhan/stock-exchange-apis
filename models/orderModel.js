import pool from '../config/dbConnection.js';

export async function getClient() {
  return await pool.connect();
}

export async function handleBuyer(client, qty, price) {
  const sellerResult = await client.query(
    `SELECT * FROM pending_orders
     WHERE seller_price = $1 AND seller_qty > 0
     ORDER BY seller_price ASC LIMIT 1
     FOR UPDATE`,
    [price]
  );

  if (sellerResult.rows.length === 0) {
    await client.query(
      `INSERT INTO pending_orders (buyer_qty, buyer_price) VALUES ($1, $2)`,
      [qty, price]
    );
  } else {
    const seller = sellerResult.rows[0];
    const matchedQty = Math.min(qty, seller.seller_qty);

    await client.query(
      `INSERT INTO completed_orders (price, qty) VALUES ($1, $2)`,
      [seller.seller_price, matchedQty]
    );

    const remainingSellerQty = seller.seller_qty - matchedQty;
    if (remainingSellerQty > 0) {
      await client.query(
        `UPDATE pending_orders SET seller_qty = $1 WHERE id = $2`,
        [remainingSellerQty, seller.id]
      );
    } else {
      await client.query(
        `DELETE FROM pending_orders WHERE id = $1`,
        [seller.id]
      );
    }

    const remainingBuyerQty = qty - matchedQty;
    if (remainingBuyerQty > 0) {
      await client.query(
        `INSERT INTO pending_orders (buyer_qty, buyer_price) VALUES ($1, $2)`,
        [remainingBuyerQty, price]
      );
    }
  }
}

export async function handleSeller(client, qty, price) {
  const buyerResult = await client.query(
    `SELECT * FROM pending_orders
     WHERE buyer_price = $1 AND buyer_qty > 0
     ORDER BY buyer_price DESC LIMIT 1
     FOR UPDATE`,
    [price]
  );

  if (buyerResult.rows.length === 0) {
    await client.query(
      `INSERT INTO pending_orders (seller_qty, seller_price) VALUES ($1, $2)`,
      [qty, price]
    );
  } else {
    const buyer = buyerResult.rows[0];
    const matchedQty = Math.min(qty, buyer.buyer_qty);

    await client.query(
      `INSERT INTO completed_orders (price, qty) VALUES ($1, $2)`,
      [buyer.buyer_price, matchedQty]
    );

    const remainingBuyerQty = buyer.buyer_qty - matchedQty;
    if (remainingBuyerQty > 0) {
      await client.query(
        `UPDATE pending_orders SET buyer_qty = $1 WHERE id = $2`,
        [remainingBuyerQty, buyer.id]
      );
    } else {
      await client.query(
        `DELETE FROM pending_orders WHERE id = $1`,
        [buyer.id]
      );
    }

    const remainingSellerQty = qty - matchedQty;
    if (remainingSellerQty > 0) {
      await client.query(
        `INSERT INTO pending_orders (seller_qty, seller_price) VALUES ($1, $2)`,
        [remainingSellerQty, price]
      );
    }
  }
}

export async function getPendingBuyers() {
   const result = await pool.query(
    `SELECT * FROM pending_orders WHERE buyer_qty > 0`
  );
  return result.rows;
}

export async function getPendingSellers() {
  const result = await pool.query(
    `SELECT * FROM pending_orders WHERE seller_qty > 0`
  );
  return result.rows;
}

export async function getCompletedOrders() {
  const result = await pool.query(`SELECT * FROM completed_orders`);
  return result.rows;
}
