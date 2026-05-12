import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminMenu from '../components/Admin/AdminMenu';
import AdminOrders from '../components/Admin/AdminOrders';
import AdminReservations from '../components/Admin/AdminReservations';
import AdminInventory from '../components/Admin/AdminInventory';
import AdminAnalytics from '../components/Admin/AdminAnalytics';
import AdminUsers from '../components/Admin/AdminUsers';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">👨‍💼</div>
          <div className="sidebar-logo-text">ADMIN</div>
        </div>
        <nav className="sidebar-nav">
          <div 
            className={`sidebar-icon ${isActive('/admin') && !isActive('/admin/') ? 'active' : ''}`}
            title="Dashboard" 
            onClick={() => navigate('/admin')}
          >
            📊
          </div>
          <div 
            className={`sidebar-icon ${isActive('menu') ? 'active' : ''}`}
            title="Menu Management" 
            onClick={() => navigate('/admin/menu')}
          >
            🍽️
          </div>
          <div 
            className={`sidebar-icon ${isActive('orders') ? 'active' : ''}`}
            title="Orders" 
            onClick={() => navigate('/admin/orders')}
          >
            📦
          </div>
          <div 
            className={`sidebar-icon ${isActive('reservations') ? 'active' : ''}`}
            title="Reservations" 
            onClick={() => navigate('/admin/reservations')}
          >
            📅
          </div>
          <div 
            className={`sidebar-icon ${isActive('inventory') ? 'active' : ''}`}
            title="Inventory" 
            onClick={() => navigate('/admin/inventory')}
          >
            📦
          </div>
          <div 
            className={`sidebar-icon ${isActive('analytics') ? 'active' : ''}`}
            title="Analytics" 
            onClick={() => navigate('/admin/analytics')}
          >
            📈
          </div>
          <div 
            className={`sidebar-icon ${isActive('users') ? 'active' : ''}`}
            title="Users" 
            onClick={() => navigate('/admin/users')}
          >
            👥
          </div>
          <div className="sidebar-icon" title="Logout" onClick={() => { logout(); navigate('/login'); }}>
            🚪
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content no-sidebar">
        <div className="main-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <Routes>
          <Route path="menu" element={<AdminMenu />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="" element={<AdminAnalytics />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
