import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserCart = () => {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('online');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, [user]);

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

  const removeItem = (menuItemId) => {
    const newCart = cart.filter(item => item.menuItem !== menuItemId);
    setCart(newCart);
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
    toast.success('Item removed from cart');
  };

  const getTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = 5.00;
    const tax = subtotal * 0.06;
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal - discount + tax).toFixed(2)
    };
  };

  const handleCheckout = async (e) => {
    // Prevent double submission
    if (e) {
      e.preventDefault();
    }
    
    if (isSubmitting) {
      toast.warning('Order is being processed, please wait...');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (orderType === 'online' && !deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate cart items
      const validItems = cart.filter(item => item.menuItem && item.quantity > 0);
      if (validItems.length === 0) {
        toast.error('Cart contains invalid items. Please refresh and try again.');
        setIsSubmitting(false);
        return;
      }

      const items = validItems.map(item => ({
        menuItem: item.menuItem,
        quantity: item.quantity
      }));

      const orderData = {
        items,
        orderType,
        ...(orderType === 'online' && { deliveryAddress }),
        paymentMethod: 'online'
      };

      console.log('Placing order:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('Order created:', response.data);
      
      toast.success('Order placed successfully!');
      const cartKey = getCartKey();
      localStorage.removeItem(cartKey);
      localStorage.removeItem('cart'); // Also remove old cart for backward compatibility
      setCart([]);
      
      // Navigate after a short delay to ensure state is updated
      setTimeout(() => {
        navigate('/user/orders');
      }, 500);
    } catch (error) {
      console.error('Order creation error:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to place order. Please try again.';
      
      toast.error(errorMessage);
      
      // If it's a validation error, show more details
      if (error.response?.status === 400) {
        console.error('Validation error details:', error.response.data);
      }
      
      setIsSubmitting(false);
    }
  };

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
          <div className="sidebar-icon" title="Home" onClick={() => navigate('/user/menu')}>
            🏠
          </div>
          <div className="sidebar-icon" title="Categories" onClick={() => navigate('/user/categories')}>
            ⬜
          </div>
          <div className="sidebar-icon" title="Reservations" onClick={() => navigate('/user/reservations')}>
            📅
          </div>
          <div className="sidebar-icon active" title="History" onClick={() => navigate('/user/orders')}>
            🕐
          </div>
          <div className="sidebar-icon" title="Receipts" onClick={() => navigate('/user/receipts')}>
            📄
          </div>
          <div className="sidebar-icon active" title="Cart">
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
      <main className="main-content no-sidebar">
        <div className="main-header">
          <h1>Your Cart</h1>
          <p>Review your order before checkout.</p>
        </div>

        {cart.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
              <h2 style={{ marginBottom: '10px' }}>Your cart is empty</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>Add items to get started</p>
              <button
                onClick={() => navigate('/user/menu')}
                className="btn btn-primary"
                style={{ padding: '12px 30px' }}
              >
                Browse Menu
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            <div>
              <div className="card">
                <h2 style={{ marginBottom: '20px' }}>Order Items</h2>
                {cart.map((item) => (
                  <div key={item.menuItem} className="order-item" style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 0' }}>
                    {item.image ? (
                      <img
                        src={`http://localhost:5000${item.image}`}
                        alt={item.name}
                        className="order-item-image"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
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
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center',
                        padding: '5px'
                      }}
                    >
                      {item.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="order-item-info" style={{ flex: 1 }}>
                      <div className="order-item-name" style={{ fontSize: '16px', marginBottom: '8px' }}>
                        {item.name}
                      </div>
                      <div className="order-item-price" style={{ fontSize: '18px', marginBottom: '15px' }}>
                        ${item.price.toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button
                          onClick={() => updateQuantity(item.menuItem, -1)}
                          style={{
                            width: '35px',
                            height: '35px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItem, 1)}
                          style={{
                            width: '35px',
                            height: '35px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          +
                        </button>
                        <div style={{ marginLeft: 'auto', fontSize: '16px', fontWeight: '700', color: '#ff6b35' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeItem(item.menuItem)}
                          className="btn btn-danger"
                          style={{ padding: '8px 15px', fontSize: '12px' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginTop: '20px' }}>
                <h2 style={{ marginBottom: '20px' }}>Delivery Information</h2>
                <div className="form-group">
                  <label>Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                  >
                    <option value="online">Online Delivery</option>
                    <option value="takeaway">Takeaway</option>
                  </select>
                </div>
                {orderType === 'online' && (
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      rows="3"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="card" style={{ position: 'sticky', top: '20px' }}>
                <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>
                <div className="order-summary" style={{ padding: 0, background: 'transparent', border: 'none' }}>
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
                    onClick={handleCheckout}
                    disabled={isSubmitting || cart.length === 0}
                    style={{
                      opacity: (isSubmitting || cart.length === 0) ? 0.6 : 1,
                      cursor: (isSubmitting || cart.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserCart;
