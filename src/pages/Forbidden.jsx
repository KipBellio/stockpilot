import { useNavigate } from 'react-router-dom';

function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-300 p-10 max-w-md w-full text-center">
        
        {/* Red Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-red-600 flex items-center justify-center">
          <div className="w-8 h-1 bg-red-600 transform rotate-45"></div>
        </div>

        <h1 className="text-3xl text-neutral-900 mb-4 font-normal">Access denied</h1>
        
        <p className="text-xl text-neutral-800 mb-8 leading-relaxed">
          You don't have<br />permission to<br />view this page.
        </p>

        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#138A7C] text-white text-xl px-8 py-2 rounded-none hover:bg-[#0f6f64] transition"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export default Forbidden;