import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../src/models/MenuItem.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zooba';

const sampleMenuItems = [
  {
    name: 'Hummus',
    description: 'Creamy chickpea dip with tahini, lemon, and garlic',
    category: 'appetizer',
    price: 8.99,
    isAvailable: true,
    preparationTime: 10,
    ingredients: ['chickpeas', 'tahini', 'lemon', 'garlic', 'olive oil'],
    allergens: ['sesame']
  },
  {
    name: 'Baba Ganoush',
    description: 'Smoky roasted eggplant dip',
    category: 'appetizer',
    price: 9.99,
    isAvailable: true,
    preparationTime: 15,
    ingredients: ['eggplant', 'tahini', 'lemon', 'garlic'],
    allergens: ['sesame']
  },
  {
    name: 'Fattah',
    description: 'Layers of crispy bread, rice, and meat with yogurt sauce',
    category: 'main_course',
    price: 15.99,
    isAvailable: true,
    preparationTime: 25,
    ingredients: ['bread', 'rice', 'beef', 'yogurt', 'garlic'],
    allergens: ['gluten', 'dairy']
  },
  {
    name: 'Koshary',
    description: 'Traditional Egyptian dish with rice, lentils, pasta, and chickpeas',
    category: 'main_course',
    price: 12.99,
    isAvailable: true,
    preparationTime: 20,
    ingredients: ['rice', 'lentils', 'pasta', 'chickpeas', 'tomato sauce'],
    allergens: ['gluten']
  },
  {
    name: 'Grilled Chicken',
    description: 'Tender grilled chicken breast with herbs and spices',
    category: 'main_course',
    price: 16.99,
    isAvailable: true,
    preparationTime: 20,
    ingredients: ['chicken breast', 'olive oil', 'herbs', 'spices']
  },
  {
    name: 'Kofta',
    description: 'Spiced ground meat grilled on skewers',
    category: 'main_course',
    price: 17.99,
    isAvailable: true,
    preparationTime: 25,
    ingredients: ['ground beef', 'onions', 'parsley', 'spices']
  },
  {
    name: 'Greek Salad',
    description: 'Fresh vegetables with feta cheese and olive oil dressing',
    category: 'salad',
    price: 10.99,
    isAvailable: true,
    preparationTime: 10,
    ingredients: ['tomatoes', 'cucumbers', 'onions', 'feta cheese', 'olive oil'],
    allergens: ['dairy']
  },
  {
    name: 'Lentil Soup',
    description: 'Hearty lentil soup with vegetables',
    category: 'soup',
    price: 7.99,
    isAvailable: true,
    preparationTime: 15,
    ingredients: ['lentils', 'onions', 'carrots', 'celery', 'spices']
  },
  {
    name: 'Baklava',
    description: 'Sweet pastry with nuts and honey syrup',
    category: 'dessert',
    price: 6.99,
    isAvailable: true,
    preparationTime: 5,
    ingredients: ['phyllo dough', 'nuts', 'honey', 'butter'],
    allergens: ['gluten', 'nuts']
  },
  {
    name: 'Umm Ali',
    description: 'Traditional Egyptian bread pudding',
    category: 'dessert',
    price: 5.99,
    isAvailable: true,
    preparationTime: 10,
    ingredients: ['bread', 'milk', 'sugar', 'nuts', 'coconut'],
    allergens: ['gluten', 'dairy', 'nuts']
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    category: 'beverage',
    price: 4.99,
    isAvailable: true,
    preparationTime: 5,
    ingredients: ['oranges']
  },
  {
    name: 'Mint Tea',
    description: 'Traditional mint tea',
    category: 'beverage',
    price: 3.99,
    isAvailable: true,
    preparationTime: 5,
    ingredients: ['tea', 'mint', 'sugar']
  }
];

async function seedMenuItems() {
  try {
    console.log('🌱 Starting menu items seed...');
    console.log('📍 Connecting to:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing items (optional - comment out if you want to keep existing)
    // const deleted = await MenuItem.deleteMany({});
    // console.log(`🗑️  Deleted ${deleted.deletedCount} existing menu items\n`);

    // Insert sample items
    console.log('📝 Inserting menu items...');
    const inserted = await MenuItem.insertMany(sampleMenuItems);
    console.log(`✅ Successfully inserted ${inserted.length} menu items!\n`);

    // Display inserted items
    console.log('📋 Inserted Items:');
    inserted.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - $${item.price} (${item.category})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding menu items:', error.message);
    
    if (error.code === 11000) {
      console.error('\n⚠️  Some items already exist. To replace them, uncomment the deleteMany line in the script.');
    }
    
    process.exit(1);
  }
}

seedMenuItems();

