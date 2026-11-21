import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

function AdminMFAVerify() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [factorId, setFactorId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getFactor = async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp.find(f => f.status === 'verified');
      if (factor) setFactorId(factor.id);
      else navigate('/admin'); // No MFA set up, let them in
    };
    getFactor();
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) return setError(challenge.error.message);

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });

    if (verify.error) setError(verify.error.message);
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#B0BCCD]">
      <div className="bg-white p-10 rounded-xl shadow-sm max-w-sm w-full">
        <h1 className="text-xl font-semibold mb-4 text-center">Admin Verification</h1>
        <p className="text-sm text-neutral-500 text-center mb-6">Enter code from Google Authenticator.</p>
        {error && <div className="p-2 bg-red-50 text-red-700 text-sm mb-4">{error}</div>}
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="w-full px-3 py-2 border rounded-md text-center text-lg tracking-widest"
            maxLength="6"
            required
          />
          <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-md">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
export default AdminMFAVerify;