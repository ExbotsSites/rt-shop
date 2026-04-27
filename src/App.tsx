import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, CheckCircle2, Banknote, AlertTriangle, X, Lock, 
  Users, BarChart3, Clock, Check, Power
} from "lucide-react";

// --- CONFIG ---
const PENDING_WEBHOOK = "https://discord.com/api/webhooks/1497985578795536476/fGZAQyjXuMqx1FCe4mmAIs5aIKH0u1lKFlQlKtux_MpDxQEcthdLoB9CNVFAfm8qF6kd";
const COMPLETED_WEBHOOK = "https://discord.com/api/webhooks/1497985702623969380/GF32KcBWTQNpSsa4zt767Vb3RMFmbzZKLwMPbBcell8FHZ-9P6CRLcUrJ5sEFZSbgnYb";
const DISCORD_SERVER = "https://discord.gg/HpPTb7aTCB";
const ADMIN_PASS = "rtshopad";

const tiers = [
  { id: 1, cash: "1M", robux: 50 }, { id: 2, cash: "2M", robux: 100 },
  { id: 3, cash: "3M", robux: 150 }, { id: 4, cash: "5M", robux: 250 },
  { id: 5, cash: "10M", robux: 500 }, { id: 6, cash: "20M", robux: 1000 },
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
        <Route path="/admin" element={<AdminDashboard maintenance={maintenance} setMaintenance={setMaintenance} orders={allOrders} setOrders={setAllOrders} />} />
        <Route path="/maintenance" element={<MaintenancePage maintenance={maintenance} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ maintenance, setMaintenance, orders, setOrders }: any) => {
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
          content: `✅ \`Order #${order.id}\` • \`Product: ${order.items}\` • \`User: @${order.user}\` Completed` 
        })
      });
      const updated = orders.map((o: any) => o.id === order.id ? { ...o, status: 'completed' } : o);
      setOrders(updated);
    } catch (e) { alert("Webhook Error"); }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-[2.5rem] text-center border border-zinc-800">
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
          <h1 className="text-4xl font-black italic uppercase leading-none">Admin</h1>
          <div className="flex gap-3">
            <button onClick={() => setMaintenance(!maintenance)} className={`px-8 py-4 rounded-full font-black uppercase text-[10px] ${maintenance ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              <Power size={14} className="inline mr-2"/> {maintenance ? 'Closed' : 'Open'}
            </button>
            <button onClick={() => setIsAuth(false)} className="bg-white p-4 rounded-full border border-zinc-100 shadow-sm"><X size={18}/></button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard label="Pending" val={pendingOrders.length} icon={Clock} color="#facc15" />
          <StatCard label="Finished" val={completedOrders.length} icon={BarChart3} color="#10b981" />
          <StatCard label="Revenue" val={`${totalRevenue} RBX`} icon={Banknote} color="#3b82f6" />
          <StatCard label="Total" val={orders.length} icon={Users} color="#000" />
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

const StatCard = ({ label, val, icon: Icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-50 shadow-sm">
    <Icon size={24} className="mb-4" style={{ color }} />
    <div className="text-3xl font-black">{val}</div>
    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{label}</div>
  </div>
);

// --- SHOP CONTENT ---
const ShopContent = ({ onOrder }: any) => {
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [form, setForm] = useState({ roblox: '', discord: '' });

  const totalRobux = cart.reduce((acc, item) => acc + item.robux, 0);

  const submitOrder = async () => {
    if (!form.roblox || !form.discord) return alert("Fill all fields");
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const prodNames = cart.map(i => i.cash).join(", ");
    
    await fetch(PENDING_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: `📦 **NEW ORDER PENDING**\n**Order ID:** \`#${orderId}\`\n**User:** ${form.roblox}\n**Discord:** ${form.discord}\n**Items:** ${prodNames}\n**Total:** ${totalRobux} RBX` 
      })
    });
    
    onOrder((prev: any) => [{ id: orderId, user: form.roblox, items: prodNames, total: totalRobux, status: 'pending' }, ...prev]);
    setOrderSent(true);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans pb-20">
      <nav className="p-6 flex justify-between max-w-5xl mx-auto items-center">
        <div className="font-black italic text-xl uppercase italic">RT SHOP</div>
        <button onClick={() => setShowCart(true)} className="relative p-3 bg-zinc-50 rounded-full"><ShoppingCart size={24} />{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#facc15] text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}</button>
      </nav>

      <section className="text-center py-10 px-6">
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-10 italic">RT<br/><span className="text-[#facc15]">SHOP.</span></h1>
        <div className="rounded-[3rem] overflow-hidden max-w-4xl mx-auto border shadow-sm"><img src="https://i.imgur.com/IZ4GaOi.jpeg" alt="RT Hero" className="w-full h-auto block" /></div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 max-w-5xl mx-auto mt-12">
        {tiers.map(t => (
          <div key={t.id} onClick={() => setCart([...cart, {...t, cartId: Math.random()}])} className="bg-zinc-50 p-8 rounded-[2.5rem] cursor-pointer hover:bg-zinc-100 flex flex-col justify-between min-h-[170px] active:scale-95 transition-all">
            <div className="text-5xl font-black italic tracking-tighter">{t.cash}</div>
            <div className="font-black text-xl">{t.robux} <span className="text-[9px] text-zinc-400">RBX</span></div>
          </div>
        ))}
      </div>

      {showCart && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative bg-white w-full rounded-t-[3rem] p-10 max-w-lg mx-auto shadow-2xl">
            <h2 className="text-3xl font-black uppercase mb-8 italic">Checkout</h2>
            <div className="space-y-3">
              <input className="w-full bg-zinc-50 p-6 rounded-2xl outline-none font-bold text-sm" placeholder="Roblox User" onChange={e => setForm({...form, roblox: e.target.value})} />
              <input className="w-full bg-zinc-50 p-6 rounded-2xl outline-none font-bold text-sm" placeholder="Discord Tag" onChange={e => setForm({...form, discord: e.target.value})} />
              <button onClick={submitOrder} className="w-full bg-[#facc15] text-black py-7 rounded-2xl font-black uppercase text-sm shadow-xl active:scale-95 transition-all">Log Order • {totalRobux} RBX</button>
            </div>
          </div>
        </div>
      )}

      {orderSent && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 text-center">
          <CheckCircle2 size={100} className="text-[#facc15] mb-8" />
          <h2 className="text-6xl font-black italic mb-2 uppercase leading-none">Logged</h2>
          <a href={DISCORD_SERVER} target="_blank" className="bg-black text-[#facc15] px-16 py-7 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl mt-10">Discord Server</a>
          <button onClick={() => setOrderSent(false)} className="mt-12 text-zinc-300 uppercase font-black text-[10px]">Return</button>
        </div>
      )}
    </div>
  );
};

// --- MAINTENANCE ---
const MaintenancePage = ({ maintenance }: { maintenance: boolean }) => {
  const navigate = useNavigate();
  useEffect(() => { if (!maintenance) navigate('/'); }, [maintenance, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center text-zinc-900 font-sans">
      <div className="max-w-sm">
        <AlertTriangle className="text-[#facc15] mx-auto mb-8 animate-pulse" size={60} />
        <h1 className="text-6xl font-black italic tracking-tighter mb-4 uppercase leading-none">Closed.</h1>
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-12">Updating system. Check Discord.</p>
        <a href={DISCORD_SERVER} target="_blank" className="text-black font-black uppercase text-[10px] border-b-2 border-[#facc15] pb-1">Discord Server</a>
        <div className="mt-20"><a href="/admin" className="text-zinc-50 text-[8px]">System Login</a></div>
      </div>
    </div>
  );
};
