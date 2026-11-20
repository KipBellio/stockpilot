import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Products', path: '/products' },
    { name: 'Sales', path: '/sales' },
  ];

  // Admin only gets the Staff link
  if (user?.role === 'admin') {
    navItems.push({ name: 'Staff', path: '/staff' });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Navbar */}
      <header className="bg-primary-600 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="text-white text-3xl font-normal tracking-wide">
          StockPilot
        </div>
        
        <div className="flex-grow flex justify-center">
          <input 
            type="text" 
            placeholder="Search products" 
            className="w-64 px-3 py-1 bg-neutral-200 rounded-sm text-sm text-neutral-900 placeholder:text-neutral-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-white">
          <Bell size={24} className="text-yellow-500 fill-yellow-500" />
          <span className="text-2xl font-light">{user?.full_name || 'User'}</span>
          <span className="text-xl">∨</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#9CAABF] flex flex-col justify-between shrink-0 py-6 px-4">
          <div>
            <h2 className="text-2xl text-neutral-900 mb-6 px-2">Sidebar</h2>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-2 py-1 text-xl rounded-sm flex items-center gap-2 ${
                      isActive ? 'text-neutral-900 font-medium' : 'text-neutral-900/80 hover:text-neutral-900'
                    }`}
                  >
                    <span className="text-2xl leading-none">•</span> {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="h-px bg-neutral-500/50 w-full mb-6"></div>
            <div className="px-2 mb-4">
              <h3 className="text-3xl text-neutral-900">{user?.full_name || 'User'}</h3>
              <p className="text-lg text-neutral-800 capitalize">{user?.role || 'Staff'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-[#E5E7EB] text-neutral-900 text-xl px-4 py-1 rounded-md hover:bg-neutral-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;