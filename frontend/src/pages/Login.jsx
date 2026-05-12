import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      const result = await register({ name, email, password, phone });
      if (result.success) {
        toast.success('Registration successful!');
        navigateToDashboard();
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login successful!');
        navigateToDashboard();
      } else {
        toast.error(result.message);
      }
    }
  };

  const navigateToDashboard = () => {
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        api.get('/auth/me')
          .then(response => {
            const user = response.data;
            switch (user.role) {
              case 'admin':
                navigate('/admin');
                break;
              case 'chef':
                navigate('/kitchen');
                break;
              case 'waiter':
                navigate('/waiter');
                break;
              default:
                navigate('/user');
            }
          })
          .catch(() => navigate('/user'));
      }
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🍽️</div>
          <h2 style={{ 
            fontSize: '28px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '5px'
          }}>
            Zooba Restaurant
          </h2>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {isRegister ? 'Create your account' : 'Welcome back!'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {isRegister && (
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone (optional)"
              />
            </div>
          )}
          <button 
            type="submit" 
            className="checkout-btn"
            style={{ width: '100%', marginTop: '10px' }}
          >
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          color: '#666',
          fontSize: '14px'
        }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b35',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
