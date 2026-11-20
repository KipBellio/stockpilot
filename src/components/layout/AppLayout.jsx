import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, ChevronDown, LogOut, User as UserIcon, Search } from 'lucide-react';

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Products', path: '/products' },
    { name: 'Sales', path: '/sales' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Staff', path: '/staff' });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Navbar */}
      <header className="bg-primary-600 h-14 flex items-center justify-between px-6 shrink-0 z-20">
        
        {/* Logo */}
        <div className="text-white text-xl font-semibold tracking-tight">
          StockPilot
        </div>
        
        {/* Search Bar */}
        <div className="flex-grow flex justify-center max-w-md mx-auto relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-9 pr-4 py-1.5 bg-white/10 border border-white/20 rounded-md text-sm text-white placeholder:text-white/70 focus:outline-none focus:bg-white focus:text-neutral-900 focus:placeholder:text-neutral-400 transition-colors"
          />
        </div>

        {/* Right Side: Bell & Profile */}
        <div className="flex items-center gap-5">
          
          {/* Notification Bell */}
          <button className="relative text-white/90 hover:text-white transition">
            <Bell size={20} />
            <span className="absolute top-0 right-0.5 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-primary-600"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition focus:outline-none"
            >
              <span className="text-sm font-medium">{user?.full_name || 'User'}</span>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 border border-neutral-200">
                  <div className="px-4 py-2.5 border-b border-neutral-100 mb-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">{user?.full_name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                    <UserIcon size={14} /> Profile
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-neutral-50 border-r border-neutral-200 flex flex-col justify-between shrink-0 py-6">
          <div>
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-6 mb-4">Menu</h2>
            <nav className="flex flex-col gap-1 px-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700 font-medium' 
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-6">
            <div className="h-px bg-neutral-200 w-full mb-4"></div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-900 truncate">{user?.full_name || 'User'}</h3>
              <p className="text-xs text-neutral-500 capitalize">{user?.role || 'Staff'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> Sign out
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