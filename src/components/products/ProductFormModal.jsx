import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { X } from 'lucide-react';

function ProductFormModal({ isOpen, onClose, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '',
    reorder_level: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const newProduct = {
        name: formData.name,
        sku: formData.sku.toUpperCase(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        reorder_level: parseInt(formData.reorder_level)
      };

      const { data, error: supabaseError } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (supabaseError) throw supabaseError;

      setFormData({ name: '', sku: '', category: '', price: '', quantity: '', reorder_level: '' });
      onProductAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to add product. Check if SKU is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-md shadow-2xl w-full max-w-[600px] overflow-hidden">
        
        {/* Teal Header */}
        <div className="bg-primary-600 px-6 py-3 flex items-center justify-between">
          <h2 className="text-2xl text-white font-normal">Add Product</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
              {error}
            </div>
          )}

          {/* Name (Full Width) */}
          <div className="mb-4">
            <label className="block text-sm text-neutral-800 mb-1 uppercase">Name</label>
            <input 
              name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-3 py-2 border border-neutral-400 rounded-none text-sm focus:outline-none focus:border-primary-600" 
            />
          </div>

          {/* SKU & Category Row */}
          <div className="flex gap-6 mb-4">
            <div className="w-1/2">
              <label className="block text-sm text-neutral-800 mb-1 uppercase">SKU</label>
              <input 
                name="sku" value={formData.sku} onChange={handleChange} required
                className="w-full px-3 py-2 border border-neutral-400 rounded-none text-sm focus:outline-none focus:border-primary-600" 
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm text-neutral-800 mb-1 uppercase">Category</label>
              <select 
                name="category" value={formData.category} onChange={handleChange} required
                className="w-full px-3 py-2 border border-neutral-400 rounded-none text-sm bg-white focus:outline-none focus:border-primary-600"
              >
                <option value="" disabled>Select</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Lighting">Lighting</option>
                <option value="Stationery">Stationery</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Price & Quantity Row */}
          <div className="flex gap-6 mb-4">
            <div className="w-1/2">
              <label className="block text-sm text-neutral-800 mb-1 uppercase">Price</label>
              <input 
                type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required
                className="w-full px-3 py-2 border border-neutral-400 rounded-none text-sm focus:outline-none focus:border-primary-600" 
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm text-neutral-800 mb-1 uppercase">Quantity</label>
              <input 
                type="number" name="quantity" value={formData.quantity} onChange={handleChange} required
                className="w-full px-3 py-2 border border-neutral-400 rounded-none text-sm focus:outline-none focus:border-primary-600" 
              />
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="mb-8">
            <label className="block text-sm text-neutral-800 mb-1 uppercase">Low Stock Alert At</label>
            <input 
              type="number" name="reorder_level" value={formData.reorder_level} onChange={handleChange} required
              className="w-1/2 px-3 py-2 border border-neutral-400 rounded-none text-sm focus:outline-none focus:border-primary-600" 
            />
            <p className="text-sm text-neutral-600 mt-2">
              Notify me when quantity drops to or below this number.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200 w-full mb-6"></div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4">
            <button 
              type="button" onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white text-lg font-medium rounded-sm hover:bg-primary-700 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="px-8 py-2 bg-primary-600 text-white text-lg font-medium rounded-sm hover:bg-primary-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;