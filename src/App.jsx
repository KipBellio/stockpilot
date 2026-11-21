import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
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

// Redirects logged-in users away from the public login page
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

// Decides whether to show the Admin Dashboard or Staff Dashboard
function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  return <StaffDashboard />;
}

// Blocks Staff from accessing Admin-only pages (like /staff)
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
        {/* Public Route (Landing/Login) */}
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          
          {/* 403 Forbidden page (no sidebar) */}
          <Route path="/403" element={<Forbidden />} />

          {/* All other pages share the App Shell (Sidebar + Navbar) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/sales/new" element={<NewSale />} />
            
            {/* Admin-only route */}
            <Route path="/staff" element={
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