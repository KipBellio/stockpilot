import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, X } from 'lucide-react';

function Sales() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for the Sale Detail Modal
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching sales:", error);
    } else {
      setSales(data || []);
    }
    setLoading(false);
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${month} ${day} - ${time}`;
  };

  const filteredSales = sales.filter((sale) => 
    sale.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl text-neutral-900 mb-1 font-normal">Sales</h1>
          <p className="text-lg text-neutral-800">All recorded transactions</p>
        </div>
        
        {user?.role === 'staff' && (
          <button 
            onClick={() => navigate('/sales/new')}
            className="bg-primary-600 text-white text-lg px-6 py-2 rounded-sm hover:bg-primary-700 transition"
          >
            + New sale
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-sm">
        <input 
          type="text" 
          placeholder="Search staff ..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-400 rounded-none text-lg focus:outline-none focus:border-primary-600"
        />
      </div>

      {/* Sales Table */}
      <div className="border border-neutral-400 rounded-none bg-white overflow-hidden">
        <table className="w-full text-left text-xl">
          <thead className="border-b border-neutral-400 text-neutral-900">
            <tr>
              <th className="px-4 py-3 font-normal border-r border-neutral-400">Date/Time</th>
              <th className="px-4 py-3 font-normal border-r border-neutral-400">Staff</th>
              <th className="px-4 py-3 font-normal text-center border-r border-neutral-400">Items</th>
              <th className="px-4 py-3 font-normal text-right border-r border-neutral-400">Total</th>
              <th className="px-4 py-3 font-normal text-center w-16">...</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-400">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-neutral-500 text-base">Loading sales...</td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-neutral-500 text-base">No sales found.</td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-neutral-50 transition">
                  <td className="px-4 py-2 border-r border-neutral-400">{formatDate(sale.created_at)}</td>
                  <td className="px-4 py-2 border-r border-neutral-400">{sale.staff_name}</td>
                  <td className="px-4 py-2 text-center border-r border-neutral-400">{sale.items?.length || 0}</td>
                  <td className="px-4 py-2 text-right border-r border-neutral-400">{Number(sale.total).toLocaleString()}</td>
                  <td 
                    onClick={() => setSelectedSale(sale)}
                    className="px-4 py-2 text-center cursor-pointer hover:bg-neutral-200 transition"
                  >
                    <ChevronRight size={20} className="mx-auto text-neutral-600" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedSale(null)}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl text-white font-normal">Sale Receipt</h2>
              <button onClick={() => setSelectedSale(null)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between text-sm mb-6 pb-4 border-b border-neutral-200">
                <div>
                  <p className="text-neutral-500 mb-1">Date</p>
                  <p className="font-medium text-neutral-900">{formatDate(selectedSale.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-neutral-500 mb-1">Recorded By</p>
                  <p className="font-medium text-neutral-900">{selectedSale.staff_name}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Items</p>
                {selectedSale.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-neutral-900">{item.name}</p>
                      <p className="text-neutral-500">{item.qty} x KES {Number(item.price).toLocaleString()}</p>
                    </div>
                    <p className="font-medium text-neutral-900">
                      KES {(item.qty * item.price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4 flex justify-between items-center">
                <p className="text-lg font-medium text-neutral-900">Total</p>
                <p className="text-2xl font-semibold text-primary-600">
                  KES {Number(selectedSale.total).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;