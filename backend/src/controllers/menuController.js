import MenuItem from '../models/MenuItem.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req, res) => {
  try {
    // Check database connection
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.default.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please try again later.' 
      });
    }

    const { category, isAvailable, isDailyOffer } = req.query;
    const query = {};

    if (category) query.category = category;
    if (isAvailable !== undefined) {
      // Handle string 'true'/'false' or boolean
      query.isAvailable = isAvailable === 'true' || isAvailable === true;
    }
    if (isDailyOffer !== undefined) {
      query.isDailyOffer = isDailyOffer === 'true' || isDailyOffer === true;
    }

    const menuItems = await MenuItem.find(query)
      .sort({ createdAt: -1 });

    // Convert to JSON to include virtuals (discountedPrice)
    const menuItemsJSON = menuItems.map(item => item.toJSON());

    res.json(menuItemsJSON || []);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    console.error('Error stack:', error.stack);
    console.error('Query params:', req.query);
    
    // Handle specific error types
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      return res.status(503).json({ 
        message: 'Database error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to fetch menu items',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = async (req, res) => {
  try {
    // Validate required fields
    const { name, category, price } = req.body;
    
    if (!name || !category || price === undefined) {
      return res.status(400).json({ 
        message: 'Name, category, and price are required' 
      });
    }

    // Check database connection
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.default.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please try again later.' 
      });
    }

    // Create menu item
    const menuItem = await MenuItem.create(req.body);
    
    // Verify it was saved
    const savedItem = await MenuItem.findById(menuItem._id);
    if (!savedItem) {
      console.error('Menu item created but not found in database!');
      return res.status(500).json({ 
        message: 'Menu item created but could not be verified. Please refresh and check.' 
      });
    }

    console.log(`✅ Menu item created: ${savedItem.name} (ID: ${savedItem._id})`);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Menu item with this name already exists' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to create menu item',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily offers
// @route   GET /api/menu/offers/daily
// @access  Public
export const getDailyOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await MenuItem.find({
      isDailyOffer: true,
      isAvailable: true,
      $or: [
        { discountStartDate: null, discountEndDate: null },
        {
          discountStartDate: { $lte: now },
          discountEndDate: { $gte: now }
        }
      ]
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

