const express = require('express');
const { 
  getInventoryItems, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getExpiredItems 
} = require('../controllers/inventoryController');
const router = express.Router();

router.get('/', getInventoryItems);
router.get('/expired', getExpiredItems);
router.get('/:id', getInventoryItemById);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;