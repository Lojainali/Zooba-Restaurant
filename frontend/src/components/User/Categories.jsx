import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Categories = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    // Extract unique categories from menu items
    const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
    const categoryData = uniqueCategories.map(cat => ({
      id: cat,
      name: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: getCategoryIcon(cat),
      count: menuItems.filter(item => item.category === cat).length
    }));
    setCategories(categoryData);
  }, [menuItems]);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu?isAvailable=true');
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'appetizer': '🥗',
      'main_course': '🍽️',
      'dessert': '🍰',
      'beverage': '☕',
      'salad': '🥗',
      'soup': '🍲'
    };
    return icons[category] || '🍴';
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCartKey = () => {
    if (user) {
      const userId = user._id || user.id;
      return `cart_${userId}`;
    }
    return 'cart';
  };

  const addToCart = (item) => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey) || localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existingItem = cart.find(c => c.menuItem === item._id);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(c =>
        c.menuItem === item._id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      );
    } else {
      newCart = [...cart, {
        menuItem: item._id,
        name: item.name,
        price: item.discountedPrice || item.price,
        quantity: 1,
        image: item.image || null
      }];
    }
    
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    // Keep backward compatibility
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🍽️</div>
          <div className="sidebar-logo-text">MENU</div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-icon" title="Home" onClick={() => navigate('/user/menu')}>
            🏠
          </div>
          <div className="sidebar-icon active" title="Categories">
            ⬜
          </div>
          <div className="sidebar-icon" title="Reservations" onClick={() => navigate('/user/reservations')}>
            📅
          </div>
          <div className="sidebar-icon" title="History" onClick={() => navigate('/user/orders')}>
            🕐
          </div>
          <div className="sidebar-icon" title="Receipts" onClick={() => navigate('/user/receipts')}>
            📄
          </div>
          <div className="sidebar-icon" title="Cart" onClick={() => navigate('/user/cart')}>
            🛍️
          </div>
          <div className="sidebar-icon" title="Settings" onClick={() => navigate('/user/settings')}>
            ⚙️
          </div>
          <div className="sidebar-icon" title="Logout" onClick={() => navigate('/login')}>
            🚪
          </div>
        </nav>
      </aside>

      <main className="main-content no-sidebar">
        <div className="main-header">
          <h1>Categories</h1>
          <p>Browse our menu by category.</p>
        </div>

        <div className="search-filter-bar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div
            className={`card ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: !selectedCategory ? '2px solid #ff6b35' : '2px solid transparent',
              backgroundColor: !selectedCategory ? '#fff5f2' : 'white'
            }}
            onMouseEnter={(e) => {
              if (!selectedCategory) return;
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              if (!selectedCategory) return;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🍴</div>
            <h3 style={{ marginBottom: '10px', color: '#333' }}>All Items</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>{menuItems.length} items</p>
          </div>

          {categories.map((category) => (
            <div
              key={category.id}
              className="card"
              onClick={() => setSelectedCategory(category.id)}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: selectedCategory === category.id ? '2px solid #ff6b35' : '2px solid transparent',
                backgroundColor: selectedCategory === category.id ? '#fff5f2' : 'white'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory === category.id) return;
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                if (selectedCategory === category.id) return;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>{category.icon}</div>
              <h3 style={{ marginBottom: '10px', color: '#333' }}>{category.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>{category.count} items</p>
            </div>
          ))}
        </div>

        {/* Products in Selected Category */}
        {selectedCategory && (
          <div>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
              {categories.find(c => c.id === selectedCategory)?.name} Items
            </h2>
            <div className="product-grid">
              {filteredItems.map((item) => (
                <div key={item._id} className="product-card">
                  {item.image ? (
                    <img
                      src={`http://localhost:5000${item.image}`}
                      alt={item.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.nextElementSibling;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="product-image-placeholder"
                    style={{
                      display: item.image ? 'none' : 'flex',
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#f5f5f5',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '16px',
                      fontWeight: '500',
                      textAlign: 'center',
                      padding: '20px',
                      borderRadius: '8px 8px 0 0'
                    }}
                  >
                    {item.name}
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{item.name}</h3>
                    <p className="product-description">
                      {item.description || 'Delicious food item'}
                    </p>
                    <div className="product-footer">
                      <span className="product-price">
                        ${(item.discountedPrice || item.price).toFixed(2)}
                        {item.isDailyOffer && (
                          <span style={{ fontSize: '12px', color: '#999', marginLeft: '5px' }}>
                            / {item.discount}% OFF
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="add-to-cart-btn"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCategory && filteredItems.length === 0 && (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p>No items found in this category</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Categories;

