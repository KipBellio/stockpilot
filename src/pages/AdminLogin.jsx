import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setIsLoading(false);
  }, []);

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

      if (profile?.role === 'admin') {
        // Check MFA status
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const hasVerifiedFactor = factors?.totp.some(f => f.status === 'verified');

        if (hasVerifiedFactor) {
          navigate('/admin/mfa-verify'); // They have MFA, ask for code
        } else {
          navigate('/admin/mfa-setup'); // No MFA yet, force setup
        }
      } else {
        await supabase.auth.signOut();
        throw new Error("Access Denied. You are not an administrator.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#B0BCCD]">
      
      {/* LEFT PANEL - Teal Section */}
      <div className="hidden lg:flex w-1/2 bg-primary-600 flex-col px-16 py-16">
        <h1 className="text-white text-6xl font-semibold mb-32">StockPilot</h1>
        
        <h2 className="text-white text-5xl font-semibold leading-tight mb-12">
          Administrator <br /> Portal.
        </h2>
        
        <p className="text-white text-2xl max-w-lg leading-snug">
          Restricted access. Manage inventory, staff, and view financial reports.
        </p>
      </div>

      {/* RIGHT PANEL - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm p-10">
          
          {/* Admin Badge */}
          <div className="mb-6">
            <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              Admin Access
            </span>
          </div>

          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Sign in to Admin Panel</h2>
          
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                required 
              />
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2.5 rounded-md font-medium hover:bg-primary-700 transition disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
              </button>
            </div>
          </form>

          {/* Link back to Staff Login */}
          <div className="mt-8 text-center text-sm text-neutral-500">
            Not an admin? <Link to="/" className="font-medium text-primary-600 hover:text-primary-500 transition">Return to Staff Login</Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminLogin;