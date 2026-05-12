import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  specialInstructions: {
    type: String,
    trim: true
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false // Will be set by pre-save hook
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  orderType: {
    type: String,
    enum: ['in-house', 'online', 'takeaway'],
    required: true
  },
  tableNumber: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  deliveryAddress: {
    type: String,
    default: null
  },
  deliveryDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  estimatedDeliveryTime: {
    type: Date,
    default: null
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  assignedChef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedWaiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  // Only generate order number for new documents
  if (!this.isNew) {
    return next();
  }
  
  // If orderNumber already exists, skip
  if (this.orderNumber) {
    return next();
  }
  
  try {
    // Import Order model to avoid circular dependency
    const OrderModel = this.constructor;
    const count = await OrderModel.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback: use timestamp + random string
    this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Validate orderNumber after save
orderSchema.post('save', function(doc) {
  if (!doc.orderNumber) {
    console.error('Warning: Order saved without orderNumber:', doc._id);
  }
});

export default mongoose.model('Order', orderSchema);

