const MenuItem = require('../models/MenuItem');

// Get all active menu items
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(menuItems);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching menu items' 
    });
  }
};

// Get menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }
    res.json(menuItem);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching menu item' 
    });
  }
};

// Create new menu item
const createMenuItem = async (req, res) => {
  try {
    const { name, price, description, preparationTime, image } = req.body;
    
    // Validation
    if (!name || !price || !description || !preparationTime) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required except image' 
      });
    }

    const menuItem = new MenuItem({
      name,
      price: parseFloat(price),
      description,
      preparationTime: parseInt(preparationTime),
      image: image || ''
    });
    
    await menuItem.save();
    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { name, price, description, preparationTime, image } = req.body;
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        price: parseFloat(price), 
        description, 
        preparationTime: parseInt(preparationTime), 
        image 
      },
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete menu item (soft delete)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting menu item' 
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};