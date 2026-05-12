import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);

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

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/reservations/${id}/status`, { status });
      toast.success('Reservation status updated');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update reservation');
    }
  };

  return (
    <div>
      <h2>Reservations Management</h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
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
                <td>{res.customer?.name || 'N/A'}</td>
                <td>{res.tableNumber}</td>
                <td>{new Date(res.reservationDate).toLocaleDateString()}</td>
                <td>{res.reservationTime}</td>
                <td>{res.numberOfGuests}</td>
                <td>
                  <span className={`badge badge-${res.status === 'confirmed' ? 'success' : 'warning'}`}>
                    {res.status}
                  </span>
                </td>
                <td>
                  <select
                    value={res.status}
                    onChange={(e) => updateStatus(res._id, e.target.value)}
                    className="btn"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="seated">Seated</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReservations;

