import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin'; // <-- Ensure this is exactly here
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Staff from './pages/Staff';
import NewSale from './pages/NewSale';
import Forbidden from './pages/Forbidden';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Redirects logged-in users away from public login pages
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  
  // If logged in, send them to their dashboard
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/staff'} replace />;
  }
  return children;
}

// Blocks Staff from accessing Admin-only pages
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user?.role !== 'admin') return <Navigate to="/403" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
        
        {/* SECRET ADMIN LOGIN ROUTE */}
        <Route path="/adminlogin" element={
          <PublicOnlyRoute>
            <AdminLogin />
          </PublicOnlyRoute>
        } />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          
          <Route path="/403" element={<Forbidden />} />

          <Route element={<AppLayout />}>
            
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            <Route path="/staff" element={<StaffDashboard />} />
          
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/sales/new" element={<NewSale />} />
            
            <Route path="/staff/manage" element={
              <AdminRoute>
                <Staff />
              </AdminRoute>
            } />
          </Route>
        </Route>

        {/* Catch-all: Redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;