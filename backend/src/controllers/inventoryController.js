import Inventory from '../models/Inventory.js';
import { createNotification } from '../utils/sendNotification.js';
import { emitToRole } from '../utils/socketEmitter.js';
import User from '../models/User.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventoryItems = async (req, res) => {
  try {
    const { category, isLowStock, isOutOfStock } = req.query;
    const query = {};

    if (category) query.category = category;
    if (isLowStock === 'true') query.isLowStock = true;
    if (isOutOfStock === 'true') query.isOutOfStock = true;

    const items = await Inventory.find(query).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update stock level
// @route   PUT /api/inventory/:id/stock
// @access  Private/Admin
export const updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (operation === 'add') {
      item.currentStock += quantity;
      item.lastRestocked = new Date();
    } else if (operation === 'subtract') {
      item.currentStock = Math.max(0, item.currentStock - quantity);
    } else {
      item.currentStock = quantity;
    }

    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts/low-stock
// @access  Private/Admin
export const getLowStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $or: [
        { isLowStock: true },
        { isOutOfStock: true }
      ]
    }).sort({ currentStock: 1 });

    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auto-generate restock request
// @route   POST /api/inventory/:id/restock-request
// @access  Private/Admin
export const generateRestockRequest = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const restockQuantity = item.maxStockLevel - item.currentStock;

    // Create notification for admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'Restock Request',
        `${item.name} needs to be restocked. Current stock: ${item.currentStock} ${item.unit}. Recommended: ${restockQuantity} ${item.unit}`,
        'inventory',
        `/inventory/${item._id}`
      );
    }

    // Emit socket event
    const io = req.app.get('io');
    emitToRole(io, 'admin', 'restock-request', {
      item: item,
      restockQuantity
    });

    res.json({
      message: 'Restock request generated',
      item: item,
      restockQuantity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

