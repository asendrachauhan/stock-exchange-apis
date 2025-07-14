import express from 'express';
import { placeOrder, getPendingBuyers, getPendingSellers, getCompletedOrders } from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', placeOrder);
router.get('/pending/buyers', getPendingBuyers);
router.get('/pending/sellers',getPendingSellers);
router.get('/completed', getCompletedOrders);

export default router;
