import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
    loadCart();
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu?isAvailable=true');
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch menu');
    }
  };

  const getCartKey = () => {
    if (user) {
      const userId = user._id || user.id;
      return `cart_${userId}`;
    }
    return 'cart';
  };

  const loadCart = () => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey) || localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
      // Migrate old cart to user-specific key if needed
      if (user && !localStorage.getItem(cartKey)) {
        localStorage.setItem(cartKey, savedCart);
      }
    } else {
      setCart([]);
    }
  };

  const addToCart = (item) => {
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
    
    setCart(newCart);
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    // Keep backward compatibility
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (menuItemId, change) => {
    const newCart = cart.map(item => {
      if (item.menuItem === menuItemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean);
    
    setCart(newCart);
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = (menuItemId) => {
    const newCart = cart.filter(item => item.menuItem !== menuItemId);
    setCart(newCart);
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const getTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = 5.00; // You can make this dynamic
    const tax = subtotal * 0.06; // 6% tax
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal - discount + tax).toFixed(2)
    };
  };

  const categories = [
    { id: 'all', name: 'All', icon: '⭐' },
    { id: 'appetizer', name: 'Appetizer', icon: '🥗' },
    { id: 'main_course', name: 'Main Course', icon: '🍽️' },
    { id: 'dessert', name: 'Dessert', icon: '🍰' },
    { id: 'beverage', name: 'Beverage', icon: '☕' },
    { id: 'salad', name: 'Salad', icon: '🥗' },
    { id: 'soup', name: 'Soup', icon: '🍲' }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totals = getTotal();

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🍽️</div>
          <div className="sidebar-logo-text">MENU</div>
        </div>
        <nav className="sidebar-nav">
          <div className={`sidebar-icon active`} title="Home">
            🏠
          </div>
          <div className="sidebar-icon" title="Categories" onClick={() => navigate('/user/categories')}>
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

      {/* Main Content */}
      <main className="main-content">
        <div className="main-header">
          <h1>Welcome, {user?.name || 'Menu'}</h1>
          <p>Discover whatever you need easily.</p>
        </div>

        <div className="search-filter-bar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-btn">
            🔽
          </div>
        </div>

        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${filter === cat.id ? 'active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredItems.map((item) => (
            <div key={item._id} className="product-card">
              {item.image ? (
                <img
                  src={`http://localhost:5000${item.image}`}
                  alt={item.name}
                  className="product-image"
                  onError={(e) => {
                    // Use a simple colored placeholder div instead of external service
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

        {filteredItems.length === 0 && (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666' }}>No items found</p>
          </div>
        )}
      </main>

      {/* Right Order Sidebar */}
      <aside className="order-sidebar">
        <div className="order-header">
          <h2>Current Order</h2>
          <div className="order-header-actions">
            <button className="order-header-btn">⚙️</button>
            <button className="order-header-btn" onClick={() => navigate('/user/cart')}>✕</button>
          </div>
        </div>

        <div className="order-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p>Your cart is empty</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>Add items to get started</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItem} className="order-item">
                {item.image ? (
                  <img
                    src={`http://localhost:5000${item.image}`}
                    alt={item.name}
                    className="order-item-image"
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
                  style={{
                    display: item.image ? 'none' : 'flex',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '10px',
                    fontWeight: '500',
                    textAlign: 'center',
                    padding: '5px'
                  }}
                >
                  {item.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="order-item-info">
                  <div className="order-item-name">{item.name}</div>
                  <div className="order-item-price">${item.price.toFixed(2)}</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => updateQuantity(item.menuItem, -1)}
                      style={{
                        width: '25px',
                        height: '25px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '5px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem, 1)}
                      style={{
                        width: '25px',
                        height: '25px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '5px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.menuItem)}
                      style={{
                        marginLeft: 'auto',
                        padding: '5px 10px',
                        border: 'none',
                        background: '#fee',
                        color: '#dc3545',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="summary-value">${totals.subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Discount sales</span>
              <span className="summary-value" style={{ color: '#28a745' }}>-${totals.discount}</span>
            </div>
            <div className="summary-row">
              <span>Total sales tax</span>
              <span className="summary-value">${totals.tax}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="summary-value total">${totals.total}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={() => navigate('/user/cart')}
            >
              Continue to Payment
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default UserMenu;
