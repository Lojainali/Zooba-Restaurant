import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
    
    if (socket) {
      socket.on('order-update', (order) => {
        setOrders(prev => prev.map(o => o._id === order._id ? order : o));
        toast.info(`Order ${order.orderNumber} status updated to ${order.status}`);
      });
      socket.on('delivery-update', (order) => {
        setOrders(prev => prev.map(o => o._id === order._id ? order : o));
        toast.info(`Your order is ${order.status}`);
      });
    }

    return () => {
      if (socket) {
        socket.off('order-update');
        socket.off('delivery-update');
      }
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      preparing: 'badge-primary',
      ready: 'badge-success',
      out_for_delivery: 'badge-info',
      delivered: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return <span className={`badge ${badges[status] || 'badge-secondary'}`}>{status}</span>;
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
          <div className="sidebar-icon active" title="History">
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
          <h1>My Orders</h1>
          <p>Track your order history and status.</p>
        </div>

        {orders.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
              <h2 style={{ marginBottom: '10px' }}>No orders yet</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>Start ordering from our menu</p>
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
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: '600' }}>{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td style={{ fontWeight: '700', color: '#ff6b35' }}>${order.totalAmount}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{order.orderType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserOrders;
