import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, CheckCircle, CreditCard, X, ShieldCheck, Zap } from 'lucide-react';

// --- Types ---
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
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
    { 
      id: 1, 
      name: "Premium Subscription", 
      price: 10.00, 
      category: "Services", 
      description: "Get full access to all premium features instantly.",
      image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400" 
    },
    { 
      id: 2, 
      name: "Digital Asset Pack", 
      price: 25.00, 
      category: "Digital", 
      description: "High-quality assets for your next big project.",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400" 
    },
    { 
      id: 3, 
      name: "Developer API Key", 
      price: 49.99, 
      category: "Tools", 
      description: "24/7 access to our high-speed global API.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400" 
    },
  ];

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
    <div className="min-h-screen bg-[#f8f9fb] font-sans text-slate-900">
      
      {/* --- NOTIFICATION POPUP --- */}
      {showPopup && (
        <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 border border-slate-700">
          <div className="bg-green-500 p-1 rounded-full">
            <CheckCircle size={16} className="text-white" />
          </div>
          <span className="font-medium">Added <span className="text-green-400">{lastAddedItem}</span> to cart</span>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">RT Shop</h1>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="group relative p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#f8f9fb]">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* --- PRODUCT GRID --- */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Featured Items</h2>
          <div className="h-1 w-20 bg-blue-600 mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="h-56 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600">
                  {product.category}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">{product.description}</p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-2xl font-black">${product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- MODERN SLIDE-OUT CART --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-8 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Your Cart</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{cart.length} Items Selected</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <ShoppingCart size={40} className="opacity-20" />
                  </div>
                  <p className="font-bold">Your cart is feeling light.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition">
                            <Trash2 size={18}/>
                          </button>
                        </div>
                        <p className="text-blue-600 font-black mt-1">${item.price.toFixed(2)}</p>
                        <div className="mt-2 flex items-center gap-3">
                           <span className="text-xs font-bold text-slate-400 uppercase">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- CHECKOUT SECTION --- */}
            {cart.length > 0 && (
              <div className="p-8 border-t bg-slate-50 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Payment Methods</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white border-2 border-slate-200 p-4 rounded-2xl flex flex-col items-center gap-1 hover:border-blue-600 transition group">
                      <CreditCard size={20} className="text-slate-400 group-hover:text-blue-600" />
                      <span className="text-[10px] font-black uppercase">PayPal</span>
                    </button>
                    <button className="bg-white border-2 border-slate-200 p-4 rounded-2xl flex flex-col items-center gap-1 hover:border-orange-500 transition group">
                      <span className="text-lg leading-none group-hover:scale-110 transition-transform">₿</span>
                      <span className="text-[10px] font-black uppercase">Crypto</span>
                    </button>
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <ShieldCheck size={20} />
                  Complete Order
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
