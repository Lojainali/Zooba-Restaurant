import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WaiterOrders from '../components/Waiter/WaiterOrders';
import WaiterReservations from '../components/Waiter/WaiterReservations';
import { useAuth } from '../context/AuthContext';

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">👨‍💼</div>
          <div className="sidebar-logo-text">WAITER</div>
        </div>
        <nav className="sidebar-nav">
          <div 
            className={`sidebar-icon ${activeTab === 'orders' ? 'active' : ''}`}
            title="Orders" 
            onClick={() => setActiveTab('orders')}
          >
            📦
          </div>
          <div 
            className={`sidebar-icon ${activeTab === 'reservations' ? 'active' : ''}`}
            title="Reservations" 
            onClick={() => setActiveTab('reservations')}
          >
            📅
          </div>
          <div className="sidebar-icon" title="Logout" onClick={() => { logout(); navigate('/login'); }}>
            🚪
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content no-sidebar">
        <div className="main-header">
          <h1>Waiter Dashboard</h1>
          <p>Manage in-house orders and reservations, {user?.name || 'Waiter'}</p>
        </div>
        {activeTab === 'orders' ? <WaiterOrders /> : <WaiterReservations />}
      </main>
    </div>
  );
};

export default WaiterDashboard;
