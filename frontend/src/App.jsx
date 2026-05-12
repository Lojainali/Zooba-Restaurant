import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import WaiterDashboard from './pages/WaiterDashboard';

// Protected Route Component
import ProtectedRoute from './components/Shared/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/*"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchen/*"
              element={
                <ProtectedRoute allowedRoles={['chef']}>
                  <KitchenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiter/*"
              element={
                <ProtectedRoute allowedRoles={['waiter']}>
                  <WaiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

