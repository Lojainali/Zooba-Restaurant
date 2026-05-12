import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', formData);
      toast.success('Profile updated successfully');
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
          <div className="sidebar-icon active" title="Settings">
            ⚙️
          </div>
          <div className="sidebar-icon" title="Logout" onClick={() => navigate('/login')}>
            🚪
          </div>
        </nav>
      </aside>

      <main className="main-content no-sidebar">
        <div className="main-header">
          <h1>Settings</h1>
          <p>Manage your account settings and preferences.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Profile Settings */}
          <div className="card">
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Profile Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                className="checkout-btn"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Account Information */}
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <h2 style={{ marginBottom: '20px', color: '#333' }}>Account Information</h2>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Account Type</p>
                <p style={{ fontWeight: '600', color: '#333' }}>
                  {user?.role === 'user' ? 'Customer' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Member Since</p>
                <p style={{ fontWeight: '600', color: '#333' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Account Status</p>
                <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '20px', color: '#333' }}>Preferences</h2>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ marginRight: '10px', width: '18px', height: '18px' }}
                    defaultChecked
                  />
                  <span>Email notifications</span>
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ marginRight: '10px', width: '18px', height: '18px' }}
                    defaultChecked
                  />
                  <span>SMS notifications</span>
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ marginRight: '10px', width: '18px', height: '18px' }}
                  />
                  <span>Push notifications</span>
                </label>
              </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h2 style={{ marginBottom: '20px', color: '#333' }}>Actions</h2>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '10px' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    if (user) {
                      const userId = user._id || user.id;
                      localStorage.removeItem(`cart_${userId}`);
                    }
                    localStorage.removeItem('cart');
                    toast.success('Cart cleared');
                  }
                }}
              >
                Clear Cart
              </button>
              <button
                className="btn btn-danger"
                style={{ width: '100%' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

