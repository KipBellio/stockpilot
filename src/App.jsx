import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Staff from './pages/Staff'; 
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// 1. Public Route Wrapper
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

// 2. Dashboard Router: Sends to Admin or Staff view
function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <StaffDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            
            {/* The Dashboard route uses the Router we made above */}
            <Route path="/dashboard" element={<DashboardRouter />} />
            
            <Route path="/products" element={<Products />} />
            <Route path="/staff" element={<Staff />} />
             <Route path="/sales" element={<Sales />} />
            
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;