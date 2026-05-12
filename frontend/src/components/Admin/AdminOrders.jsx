import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
    
    if (socket) {
      socket.on('new-order', (order) => {
        setOrders(prev => [order, ...prev]);
        toast.info(`New order: ${order.orderNumber}`);
      });
      socket.on('order-update', (order) => {
        setOrders(prev => prev.map(o => o._id === order._id ? order : o));
      });
    }

    return () => {
      if (socket) {
        socket.off('new-order');
        socket.off('order-update');
      }
    };
  }, [socket, filter]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      preparing: 'badge-primary',
      ready: 'badge-success',
      delivered: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return <span className={`badge ${badges[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Orders Management</h2>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{stats.total}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Orders</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffc107' }}>{stats.pending}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Pending</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#007bff' }}>{stats.preparing}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Preparing</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745' }}>{stats.ready}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Ready</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745' }}>{stats.completed}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Completed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="category-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`category-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        <button
          className={`category-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`category-tab ${filter === 'preparing' ? 'active' : ''}`}
          onClick={() => setFilter('preparing')}
        >
          Preparing
        </button>
        <button
          className={`category-tab ${filter === 'ready' ? 'active' : ''}`}
          onClick={() => setFilter('ready')}
        >
          Ready
        </button>
        <button
          className={`category-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: '600' }}>{order.orderNumber}</td>
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>
                    <span className="badge badge-info">{order.orderType}</span>
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td style={{ fontWeight: '700', color: '#ff6b35' }}>${order.totalAmount}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="btn"
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
