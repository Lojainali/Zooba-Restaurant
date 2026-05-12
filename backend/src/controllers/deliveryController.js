import Order from '../models/Order.js';
import { createNotification, sendSMS } from '../utils/sendNotification.js';
import { emitToUser } from '../utils/socketEmitter.js';

// @desc    Get delivery orders
// @route   GET /api/delivery
// @access  Private
export const getDeliveryOrders = async (req, res) => {
  try {
    const query = { orderType: 'online' };

    if (req.user.role === 'delivery_driver') {
      query.$or = [
        { deliveryDriver: req.user._id },
        { deliveryDriver: null, status: 'ready' }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone address')
      .populate('items.menuItem')
      .populate('deliveryDriver', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign delivery driver
// @route   PUT /api/delivery/:id/assign
// @access  Private/Admin
export const assignDeliveryDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderType !== 'online') {
      return res.status(400).json({ message: 'Order is not a delivery order' });
    }

    order.deliveryDriver = driverId;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone address')
      .populate('deliveryDriver', 'name phone');

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery status
// @route   PUT /api/delivery/:id/status
// @access  Private/DeliveryDriver
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, estimatedDeliveryTime } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'delivery_driver' && order.deliveryDriver?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    if (estimatedDeliveryTime) {
      order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone address')
      .populate('deliveryDriver', 'name phone')
      .populate('items.menuItem');

    // Emit socket event
    const io = req.app.get('io');
    emitToUser(io, order.customer.toString(), 'delivery-update', populatedOrder);

    // Create notification
    await createNotification(
      order.customer,
      'Delivery Update',
      `Your order ${order.orderNumber} is now ${status}`,
      'delivery',
      `/orders/${order._id}`
    );

    // Send SMS if status is out_for_delivery
    if (status === 'out_for_delivery' && order.customer.phone) {
      await sendSMS(
        order.customer.phone,
        `Your Zooba order ${order.orderNumber} is out for delivery. Estimated delivery time: ${estimatedDeliveryTime || '30 minutes'}`
      );
    }

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery tracking
// @route   GET /api/delivery/track/:orderId
// @access  Private
export const trackDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('customer', 'name email phone')
      .populate('deliveryDriver', 'name phone')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'user' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      deliveryDriver: order.deliveryDriver,
      deliveryAddress: order.deliveryAddress,
      currentLocation: 'In transit', // In production, integrate with GPS
      lastUpdated: order.updatedAt
    };

    res.json(trackingInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

