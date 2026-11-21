import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

function NewSale() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  
  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('name');
    setProducts(data || []);
  }

  const addToCart = (product) => {
    if (product.quantity === 0) return;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQty >= product.quantity) return prev; 
        return prev.map((item) => 
          item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item
        );
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
  };

  const updateCartQty = (productId, amount) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          const newQty = item.cartQty + amount;
          if (newQty <= 0) return null;
          if (newQty > item.quantity) return item;
          return { ...item, cartQty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQty), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const saleData = {
        staff_id: user.id,
        staff_name: user.full_name || user.email,
        total: calculateTotal(),
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          qty: item.cartQty
        }))
      };

      // 1. Create the sale
      const { error: saleError } = await supabase.from('sales').insert([saleData]);
      if (saleError) throw saleError;

      // 2. Deduct stock
      for (const item of cart) {
        const newQty = item.quantity - item.cartQty;
        await supabase.from('products').update({ quantity: newQty }).eq('id', item.id);
      }

      // 3. Success
      alert("Sale completed successfully!");
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      alert("Failed to complete sale: " + error.message);
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
    }
  };

  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl text-neutral-900 mb-1 font-normal">New Sale</h1>
        <p className="text-lg text-neutral-800">Add products to the cart, then complete payment</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Side: Product Search */}
        <div className="w-2/3">
          <div className="mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search product..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-400 rounded-none text-base focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-neutral-400 rounded-none p-4 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-lg text-neutral-900">{product.name}</h3>
                    <span className="text-sm text-neutral-600">Stock: {product.quantity}</span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">{product.sku} · {product.category}</p>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                    className="px-4 py-1.5 text-sm font-medium bg-[#138A7C] text-white rounded-none hover:bg-[#0f6f64] disabled:opacity-50 transition"
                  >
                    {product.quantity === 0 ? 'Out of Stock' : '+ Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Cart */}
        <div className="w-1/3 border border-neutral-400 rounded-none bg-white flex flex-col h-[600px]">
          <div className="p-4 border-b border-neutral-400">
            <h2 className="font-normal text-xl text-neutral-900">Cart ({cart.reduce((a, b) => a + b.cartQty, 0)} items)</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center text-neutral-500 mt-10 text-sm">Your cart is empty.</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-4 border-b border-neutral-400">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-base text-neutral-900">{item.name}</h4>
                      <p className="text-sm text-neutral-600">{item.sku}</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-900 mb-3">KES {item.price} × {item.cartQty} = {(item.price * item.cartQty).toLocaleString()}</p>
                  
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => updateCartQty(item.id, -1)} className="px-2 py-0.5 border border-neutral-400 rounded-sm text-neutral-600 hover:bg-neutral-50 text-sm">[-]</button>
                    <span className="text-sm font-medium w-6 text-center">{item.cartQty}</span>
                    <button onClick={() => updateCartQty(item.id, 1)} className="px-2 py-0.5 border border-neutral-400 rounded-sm text-neutral-600 hover:bg-neutral-50 text-sm">[+]</button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-2 text-neutral-500 hover:text-red-500 text-sm font-medium">X</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-neutral-400 bg-white mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-normal text-neutral-900">Subtotal</span>
              <span className="text-lg font-medium text-neutral-900">KES {calculateTotal().toLocaleString()}</span>
            </div>
            
            {/* Complete Payment Button */}
            <button 
              onClick={() => setIsConfirmOpen(true)}
              disabled={cart.length === 0 || isProcessing}
              className="w-full bg-[#138A7C] text-white py-2 rounded-none font-normal text-lg hover:bg-[#0f6f64] transition disabled:opacity-50 mb-3"
            >
              Complete Payment
            </button>
            
            {/* Clear Cart Button */}
            <button 
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-full bg-[#138A7C] text-white py-2 rounded-none font-normal text-lg hover:bg-[#0f6f64] transition disabled:opacity-50"
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Solid Teal Background Overlay */}
          <div className="absolute inset-0 bg-[#138A7C]"></div>
          
          {/* White Modal Box */}
          <div className="relative bg-white shadow-2xl w-full max-w-[600px] p-10">
            
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl text-neutral-900 font-normal">Complete this sale?</h2>
              <button onClick={() => setIsConfirmOpen(false)} className="text-neutral-900 hover:text-neutral-600 mt-1">
                <X size={32} strokeWidth={1.5} />
              </button>
            </div>
            
            <p className="text-2xl text-neutral-900 mb-6">
              {cart.reduce((a, b) => a + b.cartQty, 0)} items · Total KES {calculateTotal().toLocaleString()}
            </p>
            
            <p className="text-2xl text-neutral-900 mb-12 leading-snug">
              This will record the sale under<br />your name and deduct stock.
            </p>
            
            <div className="flex justify-start gap-6">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="px-6 py-2 bg-[#138A7C] text-white text-2xl font-normal hover:bg-[#0f6f64] transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="px-6 py-2 bg-[#138A7C] text-white text-2xl font-normal hover:bg-[#0f6f64] transition disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default NewSale;