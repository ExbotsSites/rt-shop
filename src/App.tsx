import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, CheckCircle2, X, Lock, 
  Users, BarChart3, Clock, Check, Power, CreditCard, Coins, AlertCircle, Wallet, Gift, ArrowRight, Trash2
} from "lucide-react";

// --- CONFIG ---
const PENDING_WEBHOOK = "https://discord.com/api/webhooks/1497985578795536476/fGZAQyjXuMqx1FCe4mmAIs5aIKH0u1lKFlQlKtux_MpDxQEcthdLoB9CNVFAfm8qF6kd";
const COMPLETED_WEBHOOK = "https://discord.com/api/webhooks/1497985702623969380/GF32KcBWTQNpSsa4zt767Vb3RMFmbzZKLwMPbBcell8FHZ-9P6CRLcUrJ5sEFZSbgnYb";
const DISCORD_SERVER = "https://discord.gg/HpPTb7aTCB";
const ADMIN_PASS = "rtshopad";
const DEV_PASS = "rtdev2026";

const tiers = [
  { id: 1, cash: "1M Cash", robux: 50 }, { id: 2, cash: "2M Cash", robux: 100 },
  { id: 3, cash: "3M Cash", robux: 150 }, { id: 4, cash: "4M Cash", robux: 200 },
  { id: 5, cash: "5M Cash", robux: 250 }, { id: 6, cash: "6M Cash", robux: 300 },
  { id: 7, cash: "7M Cash", robux: 350 }, { id: 8, cash: "8M Cash", robux: 400 },
  { id: 9, cash: "9M Cash", robux: 450 }, { id: 10, cash: "10M Cash", robux: 500 },
];

export default function App() {
  const [maintenance, setMaintenance] = useState(() => localStorage.getItem('rt_maint') === 'true');
  const [allOrders, setAllOrders] = useState<any[]>(() => JSON.parse(localStorage.getItem('rt_all_orders') || '[]'));

  useEffect(() => {
    localStorage.setItem('rt_maint', maintenance.toString());
    localStorage.setItem('rt_all_orders', JSON.stringify(allOrders));
    
    const handleStorage = () => {
      setMaintenance(localStorage.getItem('rt_maint') === 'true');
      setAllOrders(JSON.parse(localStorage.getItem('rt_all_orders') || '[]'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [maintenance, allOrders]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={maintenance ? <Navigate to="/maintenance" replace /> : <ShopContent onOrder={setAllOrders} />} />
        <Route path="/admin" element={<AdminDashboard orders={allOrders} setOrders={setAllOrders} />} />
        <Route path="/dev" element={<DevDashboard maintenance={maintenance} setMaintenance={setMaintenance} setOrders={setAllOrders} />} />
        <Route path="/maintenance" element={<MaintenancePage maintenance={maintenance} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// --- DEV DASHBOARD ---
const DevDashboard = ({ maintenance, setMaintenance, setOrders }: any) => {
  const [pass, setPass] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
          <h2 className="text-white font-black uppercase italic mb-6">Dev Access</h2>
          <input type="password" title="p" className="w-full bg-black border border-zinc-800 p-5 rounded-2xl mb-4 text-white outline-none" placeholder="Dev Key" onChange={e => setPass(e.target.value)} />
          <button onClick={() => pass === DEV_PASS ? setIsAuth(true) : alert("Unauthorized")} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs">Authorize</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 md:p-12 font-sans text-white">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-black uppercase italic mb-12">Developer Settings</h1>
        <div className="space-y-4">
          <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-black uppercase italic text-sm">System Status</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{maintenance ? 'Currently Closed' : 'Currently Open'}</div>
            </div>
            <button onClick={() => setMaintenance(!maintenance)} className={`px-8 py-4 rounded-full font-black uppercase text-[10px] ${maintenance ? 'bg-green-600' : 'bg-red-600'}`}>
              <Power size={14} className="inline mr-2"/> {maintenance ? 'Set Open' : 'Set Closed'}
            </button>
          </div>

          <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex justify-between items-center">
            <div>
              <div className="font-black uppercase italic text-sm">Revenue Control</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Wipe all order history</div>
            </div>
            <button onClick={() => { if(confirm("Reset everything?")) setOrders([]); }} className="bg-white text-black px-8 py-4 rounded-full font-black uppercase text-[10px] flex items-center gap-2">
              <Trash2 size={14}/> Wipe Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ orders, setOrders }: any) => {
  const [pass, setPass] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  const pendingOrders = orders.filter((o: any) => o.status === 'pending');
  const completedOrders = orders.filter((o: any) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((acc: number, curr: any) => acc + curr.total, 0);

  const handleComplete = async (order: any) => {
    try {
      await fetch(COMPLETED_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: `✅️ \`Order: #${order.id}\` • \`Item: ${order.items}\` • \`User: ${order.discord}/${order.user}\` Completed` 
        })
      });
      setOrders(orders.map((o: any) => o.id === order.id ? { ...o, status: 'completed' } : o));
    } catch (e) { alert("Webhook Error"); }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        <div className="w-full max-sm bg-zinc-900 p-8 rounded-[2.5rem] text-center border border-zinc-800">
          <Lock className="mx-auto mb-6 text-white" size={24} />
          <input type="password" title="p" className="w-full bg-black border border-zinc-800 p-5 rounded-2xl mb-4 text-white outline-none" placeholder="Admin Pass" onChange={e => setPass(e.target.value)} />
          <button onClick={() => pass === ADMIN_PASS ? setIsAuth(true) : alert("Wrong Password")} className="w-full bg-[#facc15] text-black py-5 rounded-2xl font-black uppercase text-xs">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 md:p-12 font-sans text-zinc-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic uppercase leading-none tracking-tighter">Admin</h1>
          <button onClick={() => setIsAuth(false)} className="bg-white p-4 rounded-full border border-zinc-100 shadow-sm"><X size={18}/></button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-50 shadow-sm">
            <Clock size={24} className="mb-4 text-[#facc15]" />
            <div className="text-3xl font-black">{pendingOrders.length}</div>
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Pending</div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-50 shadow-sm">
            <BarChart3 size={24} className="mb-4 text-green-500" />
            <div className="text-3xl font-black">{completedOrders.length}</div>
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Finished</div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-50 shadow-sm">
            <Coins size={24} className="mb-4 text-blue-500" />
            <div className="text-3xl font-black">{totalRevenue} RBX</div>
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Revenue</div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-50 shadow-sm">
            <Users size={24} className="mb-4 text-black" />
            <div className="text-3xl font-black">{orders.length}</div>
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total</div>
          </div>
        </div>

        <div className="space-y-3">
          {pendingOrders.map((o: any) => (
            <div key={o.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-zinc-50 rounded-2xl flex items-center justify-center font-black text-zinc-300">#{o.id}</div>
                <div><div className="font-black text-xl mb-1">{o.user}</div><div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{o.items}</div></div>
              </div>
              <button onClick={() => handleComplete(o)} className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2">Finish Order <Check size={14}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SHOP ---
const ShopContent = ({ onOrder }: any) => {
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [form, setForm] = useState({ roblox: '', discord: '' });
  const [popup, setPopup] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Robux');

  const totalRobux = cart.reduce((acc, item) => acc + item.robux, 0);

  const triggerPopup = (name: string) => {
    setPopup(name);
    setTimeout(() => setPopup(null), 2000);
  };

  const submitOrder = async () => {
    if (!form.roblox || !form.discord) return alert("Fill all fields");
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const prodNames = cart.map(i => i.cash).join(", ");
    
    await fetch(PENDING_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: `📦 **NEW ORDER PENDING**\n**Order ID:** \`#${orderId}\`\n**User:** ${form.roblox}\n**Discord:** ${form.discord}\n**Items:** ${prodNames}\n**Payment:** ${paymentMethod}\n**Total:** ${totalRobux} RBX` 
      })
    });
    
    onOrder((prev: any) => [{ id: orderId, user: form.roblox, discord: form.discord, items: prodNames, total: totalRobux, status: 'pending' }, ...prev]);
    setOrderSent(true);
    setCart([]);
    setShowCart(false);
  };

  const paymentButtons = [
    { id: 'Robux', icon: Coins, label: 'Robux', desc: 'Auto-transfer' },
    { id: 'Bank', icon: Wallet, label: 'Bank Transfer', desc: 'IBAN or Revolut' },
    { id: 'PSC', icon: CreditCard, label: 'Paysafecard', desc: 'Min 5$' },
    { id: 'PayPal', icon: CreditCard, label: 'PayPal', desc: 'Friends & Family' },
    { id: 'Gift Card', icon: Gift, label: 'Gift Cards', desc: 'Steam/Epic/Rbx' },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans pb-20 overflow-x-hidden">
      {popup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-black text-[#facc15] px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="font-black uppercase italic text-xs tracking-widest tracking-tighter">Added {popup} To Cart</span>
        </div>
      )}

      <nav className="p-6 flex justify-between max-w-5xl mx-auto items-center">
        <div className="font-black italic text-xl uppercase tracking-tighter">RT SHOP</div>
        <button onClick={() => setShowCart(true)} className="relative p-3 bg-zinc-50 rounded-full active:scale-90 transition-transform">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#facc15] text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
        </button>
      </nav>

      <section className="text-center py-10 px-6">
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-10 italic">RT<br/><span className="text-[#facc15]">SHOP.</span></h1>
        <div className="rounded-[3rem] overflow-hidden max-w-4xl mx-auto border shadow-sm"><img src="https://i.imgur.com/IZ4GaOi.jpeg" alt="RT Hero" className="w-full h-auto block" /></div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 max-w-6xl mx-auto mt-12">
        {tiers.map(t => (
          <div key={t.id} onClick={() => { setCart([...cart, {...t, cartId: Math.random()}]); triggerPopup(t.cash); }} className="bg-zinc-50 p-8 rounded-[2.5rem] cursor-pointer hover:bg-zinc-100 flex flex-col justify-between min-h-[170px] active:scale-95 transition-all group">
            <div className="text-5xl font-black italic tracking-tighter group-hover:text-[#facc15] transition-colors">{t.cash}</div>
            <div className="font-black text-xl italic">{t.robux} <span className="text-[9px] text-zinc-400 not-italic">RBX</span></div>
          </div>
        ))}
      </div>

      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowCart(false)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Checkout</h2>
                  <button onClick={() => setShowCart(false)} className="p-3 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors"><X size={20}/></button>
              </div>

              {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-zinc-300 font-black uppercase italic">Empty Cart</div>
              ) : (
                  <>
                      <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-2">Order Items</p>
                          {cart.map((item) => (
                              <div key={item.cartId} className="flex justify-between items-center bg-zinc-50 p-5 rounded-2xl">
                                  <span className="font-black italic text-xl uppercase tracking-tighter">{item.cash}</span>
                                  <button onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))} className="text-zinc-300 hover:text-red-500 transition-colors"><X size={16}/></button>
                              </div>
                          ))}
                      </div>

                      <div className="mt-8 space-y-6">
                          <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] px-2">Payment Methods</p>
                              <div className="grid grid-cols-1 gap-2">
                                  {paymentButtons.map((method) => (
                                    <button 
                                      key={method.id} 
                                      onClick={() => setPaymentMethod(method.id)} 
                                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${paymentMethod === method.id ? 'border-[#facc15] bg-zinc-50' : 'border-zinc-100 text-zinc-400'}`}
                                    >
                                      <div className={`p-3 rounded-xl ${paymentMethod === method.id ? 'bg-[#facc15] text-black' : 'bg-zinc-100'}`}>
                                        <method.icon size={18}/>
                                      </div>
                                      <div>
                                        <div className={`font-black uppercase text-[10px] italic ${paymentMethod === method.id ? 'text-black' : 'text-zinc-500'}`}>{method.label}</div>
                                        <div className="text-[8px] font-bold opacity-60 tracking-wider">{method.desc}</div>
                                      </div>
                                    </button>
                                  ))}
                              </div>
                          </div>

                          <div className="bg-zinc-950 p-6 rounded-[2rem] text-white">
                             <a href="https://discord.com/channels/1458223351930814503/1492131727362232361" target="_blank" className="bg-[#facc15] text-black p-4 rounded-xl flex items-center justify-between">
                                <span className="uppercase font-black italic text-[10px]">How to Buy? Open Ticket</span>
                                <ArrowRight size={14}/>
                             </a>
                          </div>

                          <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-2">Roblox Credentials</p>
                              <input className="w-full bg-zinc-50 p-6 rounded-2xl outline-none font-bold text-xs border border-transparent focus:border-[#facc15] transition-all" placeholder="Roblox Username" onChange={e => setForm({...form, roblox: e.target.value})} />
                              <input className="w-full bg-zinc-50 p-6 rounded-2xl outline-none font-bold text-xs border border-transparent focus:border-[#facc15] transition-all" placeholder="Discord Tag" onChange={e => setForm({...form, discord: e.target.value})} />
                          </div>

                          <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                             <p className="text-[8px] font-black text-red-800 leading-tight flex items-start gap-2">
                               <AlertCircle size={12} className="shrink-0"/>
                               <span>IF YOU PLAY WHILE WE WORK, ORDER IS CANCELED (NO REFUND). NO CHANCE OF BAN IF RULES FOLLOWED.</span>
                             </p>
                          </div>

                          <div className="flex justify-between items-center px-2">
                              <span className="text-zinc-400 font-black uppercase text-[10px] tracking-widest italic">Total</span>
                              <span className="text-4xl font-black italic tracking-tighter">{totalRobux} RBX</span>
                          </div>

                          <button onClick={submitOrder} className="w-full bg-[#facc15] text-black py-7 rounded-[2rem] font-black uppercase text-sm shadow-xl active:scale-95 transition-all">Submit Order</button>
                      </div>
                  </>
              )}
            </div>
          </div>
        </div>
      )}

      {orderSent && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 text-center">
          <CheckCircle2 size={100} className="text-[#facc15] mb-8" />
          <h2 className="text-6xl font-black italic mb-2 uppercase leading-none tracking-tighter">Logged</h2>
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-6 italic">Stay off account to avoid cancellation!</p>
          <a href={DISCORD_SERVER} target="_blank" className="bg-black text-[#facc15] px-16 py-7 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl mt-4">Discord Server</a>
          <button onClick={() => setOrderSent(false)} className="mt-12 text-zinc-300 uppercase font-black text-[10px] tracking-widest underline">Return Home</button>
        </div>
      )}
    </div>
  );
};

const MaintenancePage = ({ maintenance }: { maintenance: boolean }) => {
  const navigate = useNavigate();
  useEffect(() => { if (!maintenance) navigate('/'); }, [maintenance, navigate]);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center text-zinc-900 font-sans">
      <div className="max-w-sm">
        <div className="text-8xl font-black italic text-[#facc15] mb-4">!</div>
        <h1 className="text-6xl font-black italic tracking-tighter mb-4 uppercase leading-none">Closed.</h1>
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-12">Updating. Check Discord.</p>
        <a href={DISCORD_SERVER} target="_blank" className="text-black font-black uppercase text-[10px] border-b-2 border-[#facc15] pb-1">Discord Server</a>
      </div>
    </div>
  );
};
