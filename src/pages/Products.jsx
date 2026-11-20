import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductFormModal from '../components/products/ProductFormModal';

function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, in, low, out

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  // Helper to determine status badge
  const getStatus = (qty, reorderLevel) => {
    if (qty === 0) return { label: 'Out of stock', color: 'bg-red-100 text-red-700' };
    if (qty <= reorderLevel) return { label: 'Low stock', color: 'bg-amber-100 text-amber-700' };
    return { label: 'In stock', color: 'bg-green-100 text-green-700' };
  };

  // Filter products based on search and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getStatus(product.quantity, product.reorder_level).label.toLowerCase();
    
    let matchesStatus = true;
    if (statusFilter === 'in') matchesStatus = status.includes('in stock');
    if (statusFilter === 'low') matchesStatus = status.includes('low');
    if (statusFilter === 'out') matchesStatus = status.includes('out');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl">
      {/* Header section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Products</h1>
          <p className="text-sm text-neutral-500">Manage your catalog and stock levels</p>
        </div>
        
        {/* CONDITIONAL BUTTON: Admin vs Staff */}
        {user?.role === 'admin' ? (
          <button className="bg-primary-600 text-white text-sm px-4 py-2 rounded-md hover:bg-primary-700 transition">
            + Add product
          </button>
        ) : (
          <button 
            onClick={() => navigate('/sales/new')}
            className="bg-primary-600 text-white text-sm px-4 py-2 rounded-md hover:bg-primary-700 transition"
          >
            + New Sale
          </button>
        )}
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Products Table (Desktop) / Cards (Mobile) */}
      {loading ? (
        <div className="p-8 text-center text-neutral-500">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="border border-neutral-200 rounded-lg p-12 text-center bg-white">
          <p className="text-neutral-500 mb-2">No products found.</p>
          <p className="text-sm text-neutral-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium text-right">Qty</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((product) => {
                  const status = getStatus(product.quantity, product.reorder_level);
                  return (
                    <tr key={product.id} className="hover:bg-neutral-50 transition">
                      <td className="px-6 py-4 font-medium text-neutral-900">{product.name}</td>
                      <td className="px-6 py-4 text-neutral-500">{product.sku}</td>
                      <td className="px-6 py-4 text-neutral-500">{product.category || '-'}</td>
                      <td className="px-6 py-4 text-right font-medium text-neutral-900">{product.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredProducts.map((product) => {
              const status = getStatus(product.quantity, product.reorder_level);
              return (
                <div key={product.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-neutral-900">{product.name}</h3>
                      <p className="text-xs text-neutral-500">{product.sku} · {product.category}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-neutral-100">
                    <span className="text-sm text-neutral-500">Qty: <strong className="text-neutral-900">{product.quantity}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Products;