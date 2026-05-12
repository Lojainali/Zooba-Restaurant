import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const updateUser = async (id, updates) => {
    try {
      await api.put(`/users/${id}`, updates);
      toast.success('User updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(user._id, { role: e.target.value })}
                    className="btn"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="chef">Chef</option>
                    <option value="waiter">Waiter</option>
                    <option value="cashier">Cashier</option>
                    <option value="delivery_driver">Delivery Driver</option>
                  </select>
                </td>
                <td>{user.phone || 'N/A'}</td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => updateUser(user._id, { isActive: !user.isActive })}
                    className="btn btn-secondary"
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

