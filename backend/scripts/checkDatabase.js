import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../src/models/MenuItem.js';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zooba';

async function checkDatabase() {
  try {
    console.log('🔍 Connecting to database...');
    console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide password
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database Name: ${dbName}\n`);

    // Check Menu Items
    const menuItemCount = await MenuItem.countDocuments();
    console.log(`🍽️  Menu Items: ${menuItemCount}`);
    
    if (menuItemCount > 0) {
      const recentItems = await MenuItem.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category price createdAt');
      console.log('\n📋 Recent Menu Items:');
      recentItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} (${item.category}) - $${item.price} - Created: ${item.createdAt}`);
      });
    } else {
      console.log('   ⚠️  No menu items found in database!');
    }

    // Check Users
    const userCount = await User.countDocuments();
    console.log(`\n👥 Users: ${userCount}`);

    // Check Orders
    const orderCount = await Order.countDocuments();
    console.log(`\n📦 Orders: ${orderCount}`);

    // List all collections
    console.log('\n📚 Collections in database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();

