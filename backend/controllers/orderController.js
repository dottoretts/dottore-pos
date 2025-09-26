const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Create new order
const createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, tax, discount } = req.body;
    
    // Validation
    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Customer details and at least one item are required' 
      });
    }

    // Validate menu items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ 
          success: false,
          message: `Menu item with ID ${item.menuItem} not found` 
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    const taxAmount = subtotal * ((tax || 14) / 100);
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    const order = new Order({
      customerName,
      customerPhone,
      customerAddress,
      items: orderItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total
    });

    await order.save();
    
    // Populate the order with menu item details
    await order.populate('items.menuItem');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders' 
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching order' 
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get sales statistics
const getSalesStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todaySales = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = todaySales.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      success: true,
      data: {
        todayRevenue,
        todayOrders: todaySales.length,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching sales statistics' 
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getSalesStats
};