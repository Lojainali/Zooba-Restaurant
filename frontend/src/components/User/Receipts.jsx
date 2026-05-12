import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Receipts = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      // Filter orders that can have receipts: delivered, completed, or paid
      const receiptOrders = response.data.filter(
        order => order.status === 'delivered' || 
                 order.status === 'completed' || 
                 order.paymentStatus === 'paid'
      );
      setOrders(receiptOrders);
    } catch (error) {
      toast.error('Failed to fetch receipts');
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

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank');
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #ff6b35; }
            .info { margin-bottom: 15px; }
            .info strong { display: inline-block; width: 120px; }
            .items { border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 15px 0; margin: 20px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍽️ Zooba Restaurant</h1>
            <p>Thank you for your order!</p>
          </div>
          <div class="info">
            <strong>Order Number:</strong> ${order.orderNumber}<br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}<br>
            <strong>Customer:</strong> ${order.customer?.name || 'N/A'}<br>
            <strong>Type:</strong> ${order.orderType}
          </div>
          <div class="items">
            <h3>Items:</h3>
            ${order.items?.map(item => `
              <div class="item">
                <span>${item.quantity}x ${item.menuItem?.name || 'N/A'}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="total">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${order.totalAmount.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Payment Method:</span>
              <span>${order.paymentMethod}</span>
            </div>
            <div class="total-row" style="font-size: 18px; color: #ff6b35;">
              <span>Total:</span>
              <span>$${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Visit us again soon</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
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
          <div className="sidebar-icon active" title="Receipts">
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
          <h1>Receipts</h1>
          <p>View and print your order receipts.</p>
        </div>

        {orders.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧾</div>
              <h2 style={{ marginBottom: '10px' }}>No receipts yet</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>Completed orders will appear here</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 1fr' : '1fr', gap: '30px' }}>
            <div>
              <div className="card">
                <h2 style={{ marginBottom: '20px' }}>Order History</h2>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="card"
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        marginBottom: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: selectedOrder?._id === order._id ? '2px solid #ff6b35' : '1px solid #e0e0e0'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOrder?._id !== order._id) {
                          e.currentTarget.style.borderColor = '#ff6b35';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOrder?._id !== order._id) {
                          e.currentTarget.style.borderColor = '#e0e0e0';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ marginBottom: '5px', color: '#333' }}>{order.orderNumber}</h3>
                          <p style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          {order.items?.length || 0} items
                        </span>
                        <span style={{ fontWeight: '700', color: '#ff6b35', fontSize: '16px' }}>
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedOrder && (
              <div>
                <div className="card" style={{ position: 'sticky', top: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Receipt Details</h2>
                    <button
                      className="order-header-btn"
                      onClick={() => setSelectedOrder(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Order Number</p>
                    <p style={{ fontWeight: '600', fontSize: '18px' }}>{selectedOrder.orderNumber}</p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Date</p>
                    <p style={{ fontWeight: '600' }}>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Items</p>
                    <div style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '15px 0' }}>
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span>{item.quantity}x {item.menuItem?.name || 'N/A'}</span>
                          <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-summary" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span className="summary-value">${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Payment Method</span>
                      <span className="summary-value">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span className="summary-value total">${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="checkout-btn"
                    onClick={() => printReceipt(selectedOrder)}
                    style={{ marginTop: '20px' }}
                  >
                    🖨️ Print Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Receipts;

