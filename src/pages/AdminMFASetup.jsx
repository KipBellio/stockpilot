import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

function AdminMFASetup() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const enrollMFA = async () => {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin Authenticator',
      });
      if (error) return setError(error.message);
      
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    };
    enrollMFA();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) return setError(challenge.error.message);

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: verifyCode,
    });

    if (verify.error) setError(verify.error.message);
    else navigate('/admin'); // Success! Go to dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#B0BCCD]">
      <div className="bg-white p-10 rounded-xl shadow-sm max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-4">Secure Your Admin Account</h1>
        <p className="text-neutral-600 mb-6">Scan this QR code with Google Authenticator.</p>
        
        {error && <div className="p-3 bg-red-50 text-red-700 mb-4">{error}</div>}
        
        {qrCode && (
          <div className="flex justify-center mb-6 bg-neutral-50 p-4 rounded">
            <QRCodeSVG value={qrCode} size={200} />
          </div>
        )}
        
        <p className="text-xs text-center text-neutral-500 mb-4">
          Secret: <strong>{secret}</strong>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-center"
            maxLength="6"
            required
          />
          <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-md">
            Verify & Enable MFA
          </button>
        </form>
      </div>
    </div>
  );
}
export default AdminMFASetup;