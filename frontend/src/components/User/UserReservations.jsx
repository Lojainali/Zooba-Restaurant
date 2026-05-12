import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    reservationDate: '',
    reservationTime: '',
    numberOfGuests: 1,
    contactPhone: '',
    specialRequests: ''
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      toast.error('Failed to fetch reservations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      toast.success('Reservation created successfully');
      setShowForm(false);
      setFormData({
        tableNumber: '',
        reservationDate: '',
        reservationTime: '',
        numberOfGuests: 1,
        contactPhone: '',
        specialRequests: ''
      });
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    }
  };

  const cancelReservation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.delete(`/reservations/${id}`);
        toast.success('Reservation cancelled');
        fetchReservations();
      } catch (error) {
        toast.error('Failed to cancel reservation');
      }
    }
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
          <div className="sidebar-icon" title="History" onClick={() => navigate('/user/orders')}>
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
          <h1>My Reservations</h1>
          <p>Manage your table reservations.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ New Reservation'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Create Reservation</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Table Number</label>
                  <input
                    type="number"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Number of Guests</label>
                  <input
                    type="number"
                    value={formData.numberOfGuests}
                    onChange={(e) => setFormData({ ...formData, numberOfGuests: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.reservationDate}
                    onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={formData.reservationTime}
                    onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Special Requests</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Create Reservation
              </button>
            </form>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📅</div>
              <h2 style={{ marginBottom: '10px' }}>No reservations yet</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>Book a table to get started</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res._id}>
                    <td style={{ fontWeight: '600' }}>#{res.tableNumber}</td>
                    <td>{new Date(res.reservationDate).toLocaleDateString()}</td>
                    <td>{res.reservationTime}</td>
                    <td>{res.numberOfGuests}</td>
                    <td>
                      <span className={`badge ${res.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                        {res.status}
                      </span>
                    </td>
                    <td>
                      {res.status !== 'cancelled' && res.status !== 'completed' && (
                        <button
                          onClick={() => cancelReservation(res._id)}
                          className="btn btn-danger"
                          style={{ padding: '8px 15px', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
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

export default UserReservations;
