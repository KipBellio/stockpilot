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

      const { error: supabaseError } = await supabase
        .from('products')
        .insert([newProduct]);

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
      <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-[650px] overflow-hidden border border-neutral-300">
        
        {/* Teal Header */}
        <div className="bg-primary-600 px-6 py-3 flex items-center justify-between">
          <h2 className="text-3xl text-white font-normal tracking-wide">Add Product</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={32} strokeWidth={1.5} />
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
          <div className="mb-6">
            <label className="block text-lg text-neutral-900 mb-2 uppercase tracking-wide">Name</label>
            <input 
              name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-3 py-2 border border-neutral-400 rounded-none text-base focus:outline-none focus:border-primary-600" 
            />
          </div>

          {/* SKU & Category Row */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-lg text-neutral-900 mb-2 uppercase tracking-wide">SKU</label>
              <input 
                name="sku" value={formData.sku} onChange={handleChange} required
                className="w-full px-3 py-2 border border-neutral-400 rounded-none text-base focus:outline-none focus:border-primary-600" 
              />
            </div>
            <div>
              <label className="block text-lg text-neutral-900 mb-2 uppercase tracking-wide">Category</label>
              <select 
                name="category" value={formData.category} onChange={handleChange} required
                className="w-full px-3 py-2 border border-neutral-400 rounded-none text-base bg-white focus:outline-none focus:border-primary-600"
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
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-lg text-neutral-900 mb-2 uppercase tracking-wide">Price</label>
              <input 
                type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required
                className="w-full px-3 py-2 border border-neutral-400 rounded-none text-base focus:outline-none focus:border-primary-600" 
              />
            </div>
            <div>
              <label className="block text-lg text-neutral-900 mb-2 uppercase tracking-wide">Quantity</label>
              <input 
                type="number" name="quantity" value={formData.quantity} onChange={handleChange} required
                className="w-full px-3 py-2 border border-neutral-400 rounded-none text-base focus:outline-none focus:border-primary-600" 
              />
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="mb-6">
            <label className="block text-lg text-neutral-900 mb-2 uppercase tracking-wide">Low Stock Alert At</label>
            <input 
              type="number" name="reorder_level" value={formData.reorder_level} onChange={handleChange} required
              className="w-1/2 px-3 py-2 border border-neutral-400 rounded-none text-base focus:outline-none focus:border-primary-600" 
            />
            <p className="text-base text-neutral-800 mt-3">
              Notify me when quantity drops to or below this number.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-300 w-full mb-6"></div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4">
            <button 
              type="button" onClick={onClose}
              className="px-8 py-2 bg-[#138A7C] text-white text-xl font-normal rounded-sm hover:bg-[#0f6f64] transition"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="px-8 py-2 bg-[#138A7C] text-white text-xl font-normal rounded-sm hover:bg-[#0f6f64] transition disabled:opacity-50"
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