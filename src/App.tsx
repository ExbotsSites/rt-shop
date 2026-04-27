import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, CheckCircle, CreditCard, X } from 'lucide-react';

// --- Types ---
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState("");

  const products: Product[] = [
    { id: 1, name: "Premium Subscription", price: 10.00, category: "Services", image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400" },
    { id: 2, name: "Digital Asset Pack", price: 25.00, category: "Digital", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400" },
  ];

  // Auto-hide popup after 2 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const addToCart = (product: Product) => {
    setLastAddedItem(product.name);
    setShowPopup(true);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* --- ADDED TO CART POPUP --- */}
      {showPopup && (
        <div className="fixed top-5 right-5 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle size={20} />
          <span>Added <strong>{lastAddedItem}</strong> to cart!</span>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter text-blue-600">RT SHOP</h1>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow group">
              <div className="h-48 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-500">{product.category}</span>
                <h3 className="text-xl font-bold mt-1">{product.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-black">${product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- CLEANER SIDE CART --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- PAYMENT SECTION --- */}
            {cart.length > 0 && (
              <div className="p-6 border-t bg-gray-50 space-y-4">
                <div className="flex justify-between text-xl font-black">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="border-2 border-blue-600 bg-white p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-blue-50 transition">
                      <CreditCard size={18} className="text-blue-600"/> PayPal
                    </button>
                    <button className="border-2 border-gray-200 bg-white p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:border-blue-600 transition">
                      <span className="text-lg">₿</span> Crypto
                    </button>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition active:scale-[0.98]">
                  Checkout Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
