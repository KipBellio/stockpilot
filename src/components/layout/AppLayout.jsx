import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { Search, ChevronDown, LogOut, User as UserIcon, X } from 'lucide-react';

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Dropdown & Modal states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Handle clicking outside the search to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch products as you type (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const fetchSearch = async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from('products')
        .select('id, name, sku, quantity, reorder_level')
        .or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`)
        .limit(5);
      
      setSearchResults(data || []);
      setIsSearching(false);
      setShowResults(true);
    };

    // Debounce: wait 300ms after typing before hitting the DB
    const timeoutId = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    // If we are on a product page, go back to the main dashboard
    if (location.pathname === '/products') {
      navigate(user?.role === 'admin' ? '/admin' : '/staff');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: user?.role === 'admin' ? '/admin' : '/staff' },
    { name: 'Products', path: '/products' },
    { name: 'Sales', path: '/sales' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Staff', path: '/staff/manage' });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Navbar */}
      <header className="bg-primary-600 h-14 flex items-center justify-between px-6 shrink-0 z-50">
        
        <div className="text-white text-xl font-semibold tracking-tight w-48">
          StockPilot
        </div>
        
        {/* Search Bar with Dropdown */}
        <div className="flex-grow flex justify-center max-w-md mx-auto relative" ref={searchRef}>
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowResults(true)}
              className="w-full pl-9 pr-8 py-1.5 bg-white/10 border border-white/20 rounded-md text-sm text-white placeholder:text-white/70 focus:outline-none focus:bg-white focus:text-neutral-900 focus:placeholder:text-neutral-400 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-12 left-0 w-full bg-white rounded-md shadow-lg border border-neutral-200 overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-neutral-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-neutral-500">No products found.</div>
              ) : (
                <div className="flex flex-col">
                  {searchResults.map(product => (
                    <button 
                      key={product.id}
                      onClick={() => {
                        navigate(`/products?edit=${product.id}`); // Navigate to products and trigger edit modal
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      className="flex justify-between items-center px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.sku}</p>
                      </div>
                      <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                        Qty: {product.quantity}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Profile */}
        <div className="flex items-center gap-5 w-48 justify-end">
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
                  
                  <button 
                    onClick={() => { setIsDropdownOpen(false); setIsProfileModalOpen(true); }}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
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

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsProfileModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">My Profile</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-neutral-500 hover:text-black">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-sm font-medium text-neutral-900">{user?.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sm font-medium text-neutral-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Role</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsProfileModalOpen(false)}
              className="mt-6 w-full bg-neutral-100 text-neutral-900 py-2 rounded-md text-sm font-medium hover:bg-neutral-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;