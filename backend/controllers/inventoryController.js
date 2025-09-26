const Inventory = require('../models/Inventory');

// Get all inventory items
const getInventoryItems = async (req, res) => {
  try {
    const inventoryItems = await Inventory.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: inventoryItems
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching inventory items' 
    });
  }
};

// Get inventory item by ID
const getInventoryItemById = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Inventory item not found' 
      });
    }
    
    res.json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching inventory item' 
    });
  }
};

// Create new inventory item
const createInventoryItem = async (req, res) => {
  try {
    const { name, quantity, purchaseDate, purchasePrice, expiryDate, hasNoExpiry } = req.body;
    
    // Validation
    if (!name || !quantity || !purchaseDate || !purchasePrice) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required except expiry date if marked as no expiry' 
      });
    }

    const inventoryItem = new Inventory({
      name,
      quantity: parseInt(quantity),
      purchaseDate,
      purchasePrice: parseFloat(purchasePrice),
      expiryDate: hasNoExpiry ? null : expiryDate,
      hasNoExpiry: hasNoExpiry || false
    });
    
    await inventoryItem.save();
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const { name, quantity, purchaseDate, purchasePrice, expiryDate, hasNoExpiry } = req.body;
    
    const inventoryItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        quantity: parseInt(quantity), 
        purchaseDate, 
        purchasePrice: parseFloat(purchasePrice), 
        expiryDate: hasNoExpiry ? null : expiryDate, 
        hasNoExpiry: hasNoExpiry || false 
      },
      { new: true, runValidators: true }
    );
    
    if (!inventoryItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Inventory item not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Inventory item not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting inventory item' 
    });
  }
};

// Get expired inventory items
const getExpiredItems = async (req, res) => {
  try {
    const today = new Date();
    const expiredItems = await Inventory.find({
      hasNoExpiry: false,
      expiryDate: { $lt: today }
    });
    
    res.json({
      success: true,
      data: expiredItems
    });
  } catch (error) {
    console.error('Get expired items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching expired items' 
    });
  }
};

module.exports = {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getExpiredItems
};