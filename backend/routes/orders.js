const express = require('express');
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus,
  getSalesStats 
} = require('../controllers/orderController');
const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/stats', getSalesStats);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);

module.exports = router;