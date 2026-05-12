import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { createNotification, sendSMS } from '../utils/sendNotification.js';
import { emitToRole, emitToUser } from '../utils/socketEmitter.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, orderType, tableNumber, deliveryAddress, specialInstructions, paymentMethod } = req.body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!orderType) {
      return res.status(400).json({ message: 'Order type is required' });
    }

    // Check database connection
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.default.connection.readyState);
      return res.status(503).json({ message: 'Database connection unavailable. Please try again later.' });
    }

    // Prevent duplicate orders: Check for recent duplicate order from same user with same items
    // (within last 10 seconds to prevent accidental double-clicks)
    if (items && items.length > 0) {
      const recentDuplicate = await Order.findOne({
        customer: req.user._id,
        createdAt: { $gte: new Date(Date.now() - 10000) }, // Last 10 seconds
        'items.menuItem': items[0].menuItem,
        'items.quantity': items[0].quantity,
        orderType: orderType
      }).sort({ createdAt: -1 });

      if (recentDuplicate) {
        console.log('⚠️ Duplicate order detected, returning existing order:', recentDuplicate.orderNumber);
        const populatedOrder = await Order.findById(recentDuplicate._id)
          .populate('customer', 'name email phone')
          .populate('items.menuItem');
        return res.status(200).json(populatedOrder);
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.menuItem || !item.quantity) {
        return res.status(400).json({ message: 'Each item must have menuItem and quantity' });
      }

      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not found` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `Menu item ${menuItem.name} is not available` });
      }

      const price = menuItem.discountedPrice || menuItem.price;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: price,
        specialInstructions: item.specialInstructions || ''
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      orderType,
      tableNumber: orderType === 'in-house' ? tableNumber : null,
      deliveryAddress: orderType === 'online' ? deliveryAddress : null,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      specialInstructions: specialInstructions || ''
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.menuItem');

    // Emit socket event
    try {
      const io = req.app.get('io');
      if (io) {
        emitToRole(io, 'chef', 'new-order', populatedOrder);
        emitToRole(io, 'waiter', 'new-order', populatedOrder);
        emitToRole(io, 'admin', 'new-order', populatedOrder);
      }
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
      // Don't fail the request if socket fails
    }

    // Create notification (don't fail if this fails)
    try {
      await createNotification(
        req.user._id,
        'Order Placed',
        `Your order ${order.orderNumber} has been placed successfully`,
        'order',
        `/orders/${order._id}`
      );
    } catch (notifError) {
      console.error('Notification creation error:', notifError);
      // Don't fail the order if notification fails
    }

    console.log(`✅ Order created: ${order.orderNumber} by ${req.user.name}`);
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      return res.status(503).json({ 
        message: 'Database error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    // Ensure req.user exists and has a role
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { status, orderType } = req.query;
    const query = {};

    const userRole = req.user.role || 'user';

    // Role-based filtering
    if (userRole === 'user') {
      query.customer = req.user._id;
    } else if (userRole === 'chef') {
      query.$or = [
        { assignedChef: req.user._id },
        { assignedChef: null, status: { $in: ['pending', 'confirmed', 'preparing'] } }
      ];
    } else if (userRole === 'waiter') {
      query.$or = [
        { assignedWaiter: req.user._id },
        { assignedWaiter: null, orderType: 'in-house' }
      ];
    } else if (userRole === 'delivery_driver') {
      query.$or = [
        { deliveryDriver: req.user._id },
        { deliveryDriver: null, orderType: 'online', status: 'ready' }
      ];
    }

    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    const orders = await Order.find(query)
      .populate({
        path: 'customer',
        select: 'name email phone',
        options: { lean: true }
      })
      .populate({
        path: 'items.menuItem',
        options: { lean: true }
      })
      .populate({
        path: 'assignedChef',
        select: 'name',
        options: { lean: true }
      })
      .populate({
        path: 'assignedWaiter',
        select: 'name',
        options: { lean: true }
      })
      .populate({
        path: 'deliveryDriver',
        select: 'name',
        options: { lean: true }
      })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() to avoid mongoose document issues

    res.json(orders || []);
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('items.menuItem')
      .populate('assignedChef', 'name')
      .populate('assignedWaiter', 'name')
      .populate('deliveryDriver', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'user' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    // Auto-assign based on status
    if (status === 'preparing' && !order.assignedChef && req.user.role === 'chef') {
      order.assignedChef = req.user._id;
    }
    if (status === 'ready' && order.orderType === 'in-house' && !order.assignedWaiter && req.user.role === 'waiter') {
      order.assignedWaiter = req.user._id;
    }
    
    // For takeaway orders: when marked as ready, can be marked as delivered
    // For takeaway orders: when delivered, mark payment as paid if not already
    if (status === 'delivered' && order.orderType === 'takeaway' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    }
    
    // Auto-complete delivered orders after a delay (optional - can be done manually)
    // For now, delivered orders need to be manually marked as completed

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.menuItem');

    // Emit socket event
    try {
      const io = req.app.get('io');
      if (io) {
        emitToUser(io, order.customer.toString(), 'order-update', populatedOrder);
        emitToRole(io, 'admin', 'order-update', populatedOrder);
      }
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
      // Don't fail the request if socket fails
    }

    // Create notification
    await createNotification(
      order.customer,
      'Order Status Updated',
      `Your order ${order.orderNumber} status has been updated to ${status}`,
      'order',
      `/orders/${order._id}`
    );

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign order to staff
// @route   PUT /api/orders/:id/assign
// @access  Private/Admin/Chef/Waiter
export const assignOrder = async (req, res) => {
  try {
    const { chefId, waiterId, driverId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (chefId) order.assignedChef = chefId;
    if (waiterId) order.assignedWaiter = waiterId;
    if (driverId) order.deliveryDriver = driverId;

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.menuItem')
      .populate('assignedChef', 'name')
      .populate('assignedWaiter', 'name')
      .populate('deliveryDriver', 'name');

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

