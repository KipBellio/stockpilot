import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, AlertTriangle, PlusCircle } from 'lucide-react';
import ProductFormModal from '../components/products/ProductFormModal';

function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productToDelete.id);

    if (error) {
      alert("Error deleting product: " + error.message);
    } else {
      setProductToDelete(null);
      fetchProducts(); // Refresh list
    }
    setIsDeleting(false);
  };

  const handleRestock = async (product) => {
    const amountStr = prompt(`How many ${product.name} are you adding to stock?`);
    if (!amountStr) return;
    
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    const newQty = product.quantity + amount;

    const { error } = await supabase
      .from('products')
      .update({ quantity: newQty })
      .eq('id', product.id);

    if (error) {
      alert("Error updating stock: " + error.message);
    } else {
      fetchProducts(); // Refresh list to show new number
    }
  };

  const getStatus = (qty, reorderLevel) => {
    if (qty === 0) return { label: 'Out of stock', color: 'bg-red-100 text-red-700' };
    if (qty <= reorderLevel) return { label: 'Low stock', color: 'bg-amber-100 text-amber-700' };
    return { label: 'In stock', color: 'bg-green-100 text-green-700' };
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(searchLower) || 
      product.sku.toLowerCase().includes(searchLower);
    
    const status = getStatus(product.quantity, product.reorder_level).label.toLowerCase();
    
    let matchesStatus = true;
    if (statusFilter === 'in') matchesStatus = status.includes('in stock');
    if (statusFilter === 'low') matchesStatus = status.includes('low');
    if (statusFilter === 'out') matchesStatus = status.includes('out');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Products</h1>
          <p className="text-sm text-neutral-500">Manage your catalog and stock levels</p>
        </div>
        
        {user?.role === 'admin' ? (
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="bg-primary-600 text-white text-sm px-4 py-2 rounded-md hover:bg-primary-700 transition"
          >
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
                  {user?.role === 'admin' && <th className="px-6 py-3 font-medium text-center w-28">Actions</th>}
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
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleRestock(product)}
                              title="Restock"
                              className="p-1.5 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded transition"
                            >
                              <PlusCircle size={16} />
                            </button>
                            <button 
                              onClick={() => setProductToDelete(product)}
                              title="Delete"
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
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
                    {user?.role === 'admin' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleRestock(product)} className="p-1.5 text-neutral-400 hover:text-green-600 bg-neutral-50 rounded"><PlusCircle size={16} /></button>
                        <button onClick={() => setProductToDelete(product)} className="p-1.5 text-neutral-400 hover:text-red-600 bg-neutral-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ProductFormModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onProductAdded={fetchProducts} 
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProductToDelete(null)}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Are you sure you want to delete <strong className="text-neutral-900">{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;