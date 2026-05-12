import { Routes, Route } from 'react-router-dom';
import UserMenu from '../components/User/UserMenu';
import UserOrders from '../components/User/UserOrders';
import UserReservations from '../components/User/UserReservations';
import UserCart from '../components/User/UserCart';
import Categories from '../components/User/Categories';
import Settings from '../components/User/Settings';
import Receipts from '../components/User/Receipts';

const UserDashboard = () => {
  return (
    <Routes>
      <Route path="menu" element={<UserMenu />} />
      <Route path="categories" element={<Categories />} />
      <Route path="orders" element={<UserOrders />} />
      <Route path="receipts" element={<Receipts />} />
      <Route path="reservations" element={<UserReservations />} />
      <Route path="cart" element={<UserCart />} />
      <Route path="settings" element={<Settings />} />
      <Route path="" element={<UserMenu />} />
    </Routes>
  );
};

export default UserDashboard;
