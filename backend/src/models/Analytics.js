import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalCustomers: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  popularItems: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    quantity: {
      type: Number,
      default: 0
    }
  }],
  orderStatusBreakdown: {
    pending: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    preparing: { type: Number, default: 0 },
    ready: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },
  reservationStats: {
    total: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export default mongoose.model('Analytics', analyticsSchema);

