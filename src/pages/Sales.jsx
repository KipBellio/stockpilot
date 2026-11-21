import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import ProductFormModal from '../components/products/ProductFormModal'; // Import the modal

function Sales() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for the Add Product Modal (for Admin)
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        
        {/* CONDITIONAL BUTTON: Admin sees Add Product, Staff sees New Sale */}
        {user?.role === 'admin' ? (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white text-lg px-6 py-2 rounded-sm hover:bg-primary-700 transition"
          >
            + Add product
          </button>
        ) : (
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
                  <td className="px-4 py-2 text-center cursor-pointer hover:bg-neutral-100">
                    <ChevronRight size={20} className="mx-auto text-neutral-600" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal (Admin Only) */}
      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProductAdded={() => {
          setIsModalOpen(false);
          // Optionally refresh sales data if needed, though sales won't change from adding a product
        }} 
      />
    </div>
  );
}

export default Sales;