import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

function AddStaff() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.full_name,
              email: formData.email,
              role: 'staff'
            }
          ]);

        if (profileError) throw profileError;
      }

      navigate('/staff');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#B0BCCD] flex flex-col">
      {/* Teal Header Bar */}
      <header className="bg-primary-600 h-20 flex items-center px-10 shrink-0">
        <h1 className="text-white text-3xl font-normal tracking-wide">StockPilot</h1>
        <h2 className="text-white text-3xl font-normal ml-10">Add staff</h2>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-start justify-center pt-12">
        
        {/* White Card */}
        <div className="w-full max-w-[500px] bg-white p-8">
          
          <div className="mb-8">
            <h2 className="text-xl text-neutral-900 mb-1">Add a staff member,</h2>
            <p className="text-xl text-neutral-900">They'll be able to sign in...</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-xl text-center text-neutral-900 mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-neutral-400 rounded-md focus:outline-none focus:border-primary-600 text-lg"
              />
            </div>

            <div>
              <label className="block text-xl text-center text-neutral-900 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-neutral-400 rounded-md focus:outline-none focus:border-primary-600 text-lg"
              />
            </div>

            <div>
              <label className="block text-xl text-center text-neutral-900 mb-2 uppercase tracking-wide">
                Temporary Password
              </label>
              <input 
                type="text" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-neutral-400 rounded-md focus:outline-none focus:border-primary-600 text-lg"
              />
              <p className="text-center text-neutral-800 mt-2">At least 8 characters</p>
            </div>

            <div className="pt-2 flex justify-center">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#138A7C] text-white text-xl px-8 py-2 hover:bg-[#0f6f64] transition disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => navigate('/staff')} className="text-lg text-neutral-900 hover:text-primary-600">
              ← Back to staff list
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AddStaff;