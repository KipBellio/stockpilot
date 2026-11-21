import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { validateEmail, validatePassword } from '../utils/validators';

function Landing() {
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

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

      if (profile?.role === 'admin') {
        navigate('/admin'); 
      } else {
        navigate('/staff');
      }
      
    } catch (err) {
      if (err.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#B0BCCD]">
      <div className="hidden lg:flex w-1/2 bg-primary-600 flex-col px-16 py-16">
        <h1 className="text-white text-6xl font-semibold mb-32">StockPilot</h1>
        <h2 className="text-white text-5xl font-semibold leading-tight mb-12">Manage stock <br /> with confidence.</h2>
        <p className="text-white text-2xl max-w-lg leading-snug">Track products, monitor stock <br /> levels, and keep your inventory in order.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-[420px] bg-white rounded-xl shadow-sm p-10">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Welcome back</h2>
          
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="new-password" 
                data-lpignore="true"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${error && !validateEmail(email) ? 'border-red-500' : 'border-neutral-200'}`}
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
                data-lpignore="true"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${error && password.length < 6 ? 'border-red-500' : 'border-neutral-200'}`}
                required 
              />
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2.5 rounded-md font-medium hover:bg-primary-700 transition disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-neutral-700">
            No account? Sign up Via Admin
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;