import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import AdminRoute from './routes/AdminRoute';
import RootLayout from './layouts/RootLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Users from './pages/Users';
import Carts from './pages/Carts';
import Coupons from './pages/Coupons';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<AdminRoute />}>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/products" element={<Products />} />
              <Route path="/dashboard/products/new" element={<AddProduct />} />
              <Route path="/dashboard/products/:id/edit" element={<EditProduct />} />
              <Route path="/dashboard/orders" element={<Orders />} />
              <Route path="/dashboard/orders/:id" element={<OrderDetails />} />
              <Route path="/dashboard/users" element={<Users />} />
              <Route path="/dashboard/carts" element={<Carts />} />
              <Route path="/dashboard/coupons" element={<Coupons />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}
