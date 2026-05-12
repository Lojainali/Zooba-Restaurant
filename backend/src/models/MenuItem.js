import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'salad', 'soup']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  image: {
    type: String,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isDailyOffer: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountStartDate: {
    type: Date,
    default: null
  },
  discountEndDate: {
    type: Date,
    default: null
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true
  }],
  preparationTime: {
    type: Number,
    default: 15,
    min: 0
  },
  calories: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Calculate discounted price
menuItemSchema.virtual('discountedPrice').get(function() {
  if (this.isDailyOffer && this.discount > 0) {
    const now = new Date();
    if (!this.discountStartDate || !this.discountEndDate || 
        (now >= this.discountStartDate && now <= this.discountEndDate)) {
      return this.price * (1 - this.discount / 100);
    }
  }
  return this.price;
});

menuItemSchema.set('toJSON', { virtuals: true });

export default mongoose.model('MenuItem', menuItemSchema);

