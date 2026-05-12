import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const WaiterReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    fetchReservations();
  }, [filterDate]);

  // Listen for new reservations via socket
  useEffect(() => {
    if (!socket) return;

    socket.on('new-reservation', (reservation) => {
      console.log('New reservation received:', reservation);
      // Check if reservation is for the current filter date
      const resDate = new Date(reservation.reservationDate).toISOString().split('T')[0];
      if (resDate === filterDate) {
        setReservations(prev => {
          // Check if reservation already exists
          if (prev.find(r => r._id === reservation._id)) {
            return prev;
          }
          return [...prev, reservation].sort((a, b) => {
            const dateA = new Date(`${a.reservationDate}T${a.reservationTime}`);
            const dateB = new Date(`${b.reservationDate}T${b.reservationTime}`);
            return dateA - dateB;
          });
        });
        toast.info(`New reservation: Table ${reservation.tableNumber}`);
      }
    });

    socket.on('reservation-update', (reservation) => {
      setReservations(prev => prev.map(r => r._id === reservation._id ? reservation : r));
    });

    return () => {
      socket.off('new-reservation');
      socket.off('reservation-update');
    };
  }, [socket, filterDate]);

  const fetchReservations = async () => {
    try {
      // Fetch reservations for the selected date
      const response = await api.get(`/reservations?date=${filterDate}`);
      setAllReservations(response.data);
      
      // Filter for the selected date (in case backend doesn't filter properly)
      const selectedDate = new Date(filterDate);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const filtered = response.data.filter(r => {
        const resDate = new Date(r.reservationDate);
        return resDate >= selectedDate && resDate < nextDay;
      });
      
      setReservations(filtered);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to fetch reservations');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/reservations/${id}/status`, { 
        status,
        assignedWaiter: user._id 
      });
      toast.success('Reservation status updated');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update reservation');
    }
  };

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    seated: reservations.filter(r => r.status === 'seated').length,
    completed: reservations.filter(r => r.status === 'completed').length
  };

  return (
    <div>
      {/* Date Filter */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label style={{ fontWeight: '600', color: '#333' }}>Filter by Date:</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
          className="btn btn-primary"
          style={{ padding: '8px 15px', fontSize: '12px' }}
        >
          Today
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{stats.total}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            {filterDate === new Date().toISOString().split('T')[0] ? "Today's Reservations" : 'Reservations'}
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#007bff' }}>{stats.confirmed}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Confirmed</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745' }}>{stats.seated}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Seated</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#6c757d' }}>{stats.completed}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>Completed</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px' }}>
        {filterDate === new Date().toISOString().split('T')[0] ? "Today's Reservations" : `Reservations for ${new Date(filterDate).toLocaleDateString()}`}
      </h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Time</th>
              <th>Guests</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  {filterDate === new Date().toISOString().split('T')[0] 
                    ? "No reservations for today" 
                    : `No reservations for ${new Date(filterDate).toLocaleDateString()}`}
                </td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res._id}>
                  <td style={{ fontWeight: '600' }}>
                    <span className="badge badge-info">#{res.tableNumber}</span>
                  </td>
                  <td>{res.reservationTime}</td>
                  <td>{res.numberOfGuests} guests</td>
                  <td>{res.customer?.name || 'N/A'}</td>
                  <td>{res.contactPhone}</td>
                  <td>
                    <span className={`badge ${res.status === 'confirmed' ? 'badge-success' : res.status === 'seated' ? 'badge-primary' : 'badge-warning'}`}>
                      {res.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {res.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(res._id, 'confirmed')}
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Confirm
                        </button>
                      )}
                      {res.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(res._id, 'seated')}
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Mark Seated
                        </button>
                      )}
                      {res.status === 'seated' && (
                        <button
                          onClick={() => updateStatus(res._id, 'completed')}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Complete
                        </button>
                      )}
                      {(res.status === 'pending' || res.status === 'confirmed') && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this reservation?')) {
                              updateStatus(res._id, 'cancelled');
                            }
                          }}
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Cancel
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

export default WaiterReservations;
