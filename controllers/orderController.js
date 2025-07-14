import { decryptPayload } from '../utils/decypt.js';
import * as Order from '../models/orderModel.js';

export async function placeOrder(req, res) {
  const client = await Order.getClient();
  try {
    const decrypted = decryptPayload(req.body.encrypted);
    const { type, qty, price } = decrypted;

     console.log('Decrypted payload:', decrypted);

    if (!type || !qty || !price){
      res.status(400).json({ error: 'Invaild Payload' });
    }

    await client.query('BEGIN');

    if (type === 'buyer') {
      await Order.handleBuyer(client, qty, price);
    } else if (type === 'seller') {
      await Order.handleSeller(client, qty, price);
    }

    await client.query('COMMIT');
    res.json({ success: true });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
}

export async function getPendingBuyers(req, res) {
  const orders = await Order.getPendingBuyers();
  res.json(orders);
}

export async function getPendingSellers(req, res) {
  const orders = await Order.getPendingSellers();
  res.json(orders);
}

export async function getCompletedOrders(req, res) {
  const orders = await Order.getCompletedOrders();
  res.json(orders);
}
