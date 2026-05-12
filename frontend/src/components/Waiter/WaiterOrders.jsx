import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const WaiterOrders = () => {
  const [orders, setOrders] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
    
    if (socket) {
      socket.on('new-order', (order) => {
        if (order.orderType === 'in-house') {
          setOrders(prev => [order, ...prev]);
          toast.info(`New in-house order: ${order.orderNumber}`);
        }
      });
      socket.on('order-update', (order) => {
        if (order.orderType === 'in-house') {
          setOrders(prev => prev.map(o => o._id === order._id ? order : o));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new-order');
        socket.off('order-update');
      }
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.filter(o => o.orderType === 'in-house'));
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

  const assignToMe = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/assign`, { waiterId: user._id });
      toast.success('Order assigned to you');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to assign order');
    }
  };

  const inHouseOrders = orders.filter(o => o.orderType === 'in-house');
  const readyOrders = inHouseOrders.filter(o => o.status === 'ready');
  const activeOrders = inHouseOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{inHouseOrders.length}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Orders</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffc107' }}>{activeOrders.length}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Active</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745' }}>{readyOrders.length}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Ready to Serve</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px' }}>In-House Orders</h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Table</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inHouseOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No in-house orders
                </td>
              </tr>
            ) : (
              inHouseOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: '600' }}>{order.orderNumber}</td>
                  <td>
                    <span className="badge badge-info">#{order.tableNumber || 'N/A'}</span>
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td style={{ fontWeight: '700', color: '#ff6b35' }}>${order.totalAmount}</td>
                  <td>
                    <span className={`badge ${order.status === 'ready' ? 'badge-success' : 'badge-warning'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {!order.assignedWaiter && (
                        <button 
                          onClick={() => assignToMe(order._id)} 
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Assign
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateStatus(order._id, 'completed')}
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Serve
                        </button>
                      )}
                    </div>
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

export default WaiterOrders;
