import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Inventory item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'meat', 'dairy', 'beverages', 'spices', 'grains', 'other']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'L', 'mL', 'pieces', 'packets']
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  supplierContact: {
    type: String,
    trim: true
  },
  lastRestocked: {
    type: Date,
    default: null
  },
  autoRestock: {
    type: Boolean,
    default: false
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  isOutOfStock: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Check stock levels before saving
inventorySchema.pre('save', function(next) {
  this.isLowStock = this.currentStock <= this.minStockLevel;
  this.isOutOfStock = this.currentStock === 0;
  next();
});

export default mongoose.model('Inventory', inventorySchema);

