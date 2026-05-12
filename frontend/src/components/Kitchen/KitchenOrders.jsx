import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const KitchenOrders = () => {
  const [orders, setOrders] = useState([]);
  const socket = useSocket(); // Can be null if not connected yet
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return; // Socket not connected yet
    
    socket.on('new-order', (order) => {
      setOrders(prev => [order, ...prev]);
      toast.info(`New order: ${order.orderNumber}`);
    });
    
    socket.on('order-update', (order) => {
      setOrders(prev => prev.map(o => o._id === order._id ? order : o));
    });

    return () => {
      socket.off('new-order');
      socket.off('order-update');
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
      await api.put(`/orders/${orderId}/assign`, { chefId: user._id });
      toast.success('Order assigned to you');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to assign order');
    }
  };

  const kitchenOrders = orders.filter(o => 
    ['pending', 'confirmed', 'preparing'].includes(o.status)
  );

  const stats = {
    pending: kitchenOrders.filter(o => o.status === 'pending').length,
    preparing: kitchenOrders.filter(o => o.status === 'preparing').length,
    assigned: kitchenOrders.filter(o => o.assignedChef?.toString() === user?._id).length
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffc107' }}>{stats.pending}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Pending Orders</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#007bff' }}>{stats.preparing}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Preparing</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745' }}>{stats.assigned}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>My Orders</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px' }}>Kitchen Orders</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {kitchenOrders.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>👨‍🍳</div>
              <p>No orders in kitchen</p>
            </div>
          </div>
        ) : (
          kitchenOrders.map((order) => (
            <div key={order._id} className="card" style={{ 
              borderLeft: order.assignedChef?.toString() === user?._id ? '4px solid #28a745' : '4px solid #ff6b35'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ marginBottom: '5px', color: '#333' }}>Order #{order.orderNumber}</h3>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`badge ${order.status === 'preparing' ? 'badge-primary' : 'badge-warning'}`}>
                  {order.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                  <strong>Type:</strong> {order.orderType}
                </p>
                {order.tableNumber && (
                  <p style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    <strong>Table:</strong> #{order.tableNumber}
                  </p>
                )}
                {order.assignedChef && (
                  <p style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    <strong>Chef:</strong> {order.assignedChef.name}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Items:</strong>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {order.items?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '5px', fontSize: '14px' }}>
                      {item.quantity}x {item.menuItem?.name || 'N/A'} - ${item.price}
                      {item.specialInstructions && (
                        <span style={{ color: '#ff6b35', fontSize: '12px', display: 'block', marginLeft: '15px' }}>
                          Note: {item.specialInstructions}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px',
                backgroundColor: '#fff5f2',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <strong>Total:</strong>
                <span style={{ fontWeight: '700', color: '#ff6b35', fontSize: '18px' }}>
                  ${order.totalAmount}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {!order.assignedChef && (
                  <button 
                    onClick={() => assignToMe(order._id)} 
                    className="btn btn-primary"
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    Assign to Me
                  </button>
                )}
                {order.status === 'pending' || order.status === 'confirmed' ? (
                  <button
                    onClick={() => updateStatus(order._id, 'preparing')}
                    className="btn btn-success"
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    Start Preparing
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(order._id, 'ready')}
                    className="btn btn-success"
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenOrders;
