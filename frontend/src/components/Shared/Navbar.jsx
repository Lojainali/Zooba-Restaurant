import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'chef':
        return '/kitchen';
      case 'waiter':
        return '/waiter';
      default:
        return '/user';
    }
  };

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to={getDashboardPath()} style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
          Zooba Restaurant
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span>Welcome, {user?.name}</span>
        <span style={{ fontSize: '14px', opacity: 0.8 }}>({user?.role})</span>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

