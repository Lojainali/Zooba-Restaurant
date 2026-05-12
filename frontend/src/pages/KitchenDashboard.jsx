import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KitchenOrders from '../components/Kitchen/KitchenOrders';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const KitchenDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  // Fetch menu items when menu tab is active
  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    }
  };

  // Fetch inventory items when inventory tab is active
  const fetchInventoryItems = async () => {
    try {
      const response = await api.get('/inventory');
      setInventoryItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory items');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'menu') {
      fetchMenuItems();
    } else if (tab === 'inventory') {
      fetchInventoryItems();
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">👨‍🍳</div>
          <div className="sidebar-logo-text">KITCHEN</div>
        </div>
        <nav className="sidebar-nav">
          <div 
            className={`sidebar-icon ${activeTab === 'orders' ? 'active' : ''}`}
            title="Orders" 
            onClick={() => handleTabChange('orders')}
          >
            📦
          </div>
          <div 
            className={`sidebar-icon ${activeTab === 'menu' ? 'active' : ''}`}
            title="Menu" 
            onClick={() => handleTabChange('menu')}
          >
            🍽️
          </div>
          <div 
            className={`sidebar-icon ${activeTab === 'inventory' ? 'active' : ''}`}
            title="Inventory" 
            onClick={() => handleTabChange('inventory')}
          >
            📦
          </div>
          <div className="sidebar-icon" title="Logout" onClick={() => { logout(); navigate('/login'); }}>
            🚪
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content no-sidebar">
        <div className="main-header">
          <h1>Kitchen Dashboard</h1>
          <p>Manage kitchen orders and preparation, {user?.name || 'Chef'}</p>
        </div>
        
        {activeTab === 'orders' && <KitchenOrders />}
        
        {activeTab === 'menu' && (
          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>Menu Items</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th>Preparation Time</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No menu items found
                      </td>
                    </tr>
                  ) : (
                    menuItems.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: '600' }}>{item.name}</td>
                        <td>
                          <span className="badge badge-primary">
                            {item.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700', color: '#ff6b35' }}>${item.price}</td>
                        <td>
                          <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                            {item.isAvailable ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>{item.preparationTime || 15} min</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'inventory' && (
          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>Inventory</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No inventory items found
                      </td>
                    </tr>
                  ) : (
                    inventoryItems.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: '600' }}>{item.name}</td>
                        <td>
                          <span className="badge badge-primary">
                            {item.category}
                          </span>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>
                          <span className={`badge ${item.quantity > item.minimumLevel ? 'badge-success' : 'badge-danger'}`}>
                            {item.quantity > item.minimumLevel ? 'In Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenDashboard;
