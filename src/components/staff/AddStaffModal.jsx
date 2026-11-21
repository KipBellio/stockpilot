import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { X } from 'lucide-react';

function AddStaffModal({ isOpen, onClose, onStaffAdded }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // THIS IS THE MISSING FUNCTION
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call the custom database function instead of supabase.auth.signUp
      const { error: rpcError } = await supabase.rpc('create_staff_account', {
        staff_email: formData.email,
        staff_password: formData.password,
        staff_name: formData.full_name
      });

      if (rpcError) throw rpcError;

      setFormData({ full_name: '', email: '', password: '' });
      onStaffAdded();
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-md shadow-2xl w-full max-w-[500px] overflow-hidden">
        
        {/* Teal Header */}
        <div className="bg-primary-600 px-6 py-3 flex items-center justify-between">
          <h2 className="text-2xl text-white font-normal">Add staff</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-xl text-neutral-900 mb-1">Add a staff member,</h3>
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
            <button onClick={onClose} className="text-lg text-neutral-900 hover:text-primary-600">
              ← Back to staff list
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStaffModal;