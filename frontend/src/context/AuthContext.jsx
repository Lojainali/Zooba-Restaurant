import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      
      // Set cart user ID if not already set
      const currentCartUserId = localStorage.getItem('cartUserId');
      const userId = userData._id || userData.id;
      if (!currentCartUserId || currentCartUserId !== userId) {
        // User changed, clear old cart
        if (currentCartUserId) {
          localStorage.removeItem(`cart_${currentCartUserId}`);
        }
        localStorage.removeItem('cart');
        localStorage.setItem('cartUserId', userId);
      }
    } catch (error) {
      // Clear cart on auth error
      const cartUserId = localStorage.getItem('cartUserId');
      if (cartUserId) {
        localStorage.removeItem(`cart_${cartUserId}`);
      }
      localStorage.removeItem('cart');
      localStorage.removeItem('cartUserId');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      // Clear previous user's cart
      const oldCartKey = localStorage.getItem('cartUserId');
      if (oldCartKey) {
        localStorage.removeItem(`cart_${oldCartKey}`);
        localStorage.removeItem('cart');
      }
      
      // Set new user's cart identifier
      localStorage.setItem('cartUserId', userData._id || userData.id);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...user } = response.data;
      
      // Clear any previous cart
      const oldCartKey = localStorage.getItem('cartUserId');
      if (oldCartKey) {
        localStorage.removeItem(`cart_${oldCartKey}`);
        localStorage.removeItem('cart');
      }
      
      // Set new user's cart identifier
      localStorage.setItem('cartUserId', user._id || user.id);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    // Clear user's cart
    const cartUserId = localStorage.getItem('cartUserId');
    if (cartUserId) {
      localStorage.removeItem(`cart_${cartUserId}`);
    }
    localStorage.removeItem('cart');
    localStorage.removeItem('cartUserId');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

