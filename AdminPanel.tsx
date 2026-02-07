
import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, Sale, Coupon, User } from '../types';
import { ADMIN_PASSWORD, LOGO_URL, formatPrice } from '../constants';
import { database } from '../lib/database';

interface AdminPanelProps {
  onClose: () => void;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  products: Product[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onAddProduct, onUpdateProduct, onDeleteProduct, products }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sales' | 'members' | 'coupons' | 'suggestions'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sincronización robusta con la vitrina global
  const [localInventory, setLocalInventory] = useState<Product[]>(products);
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<string | number>('');
  const [editingPoints, setEditingPoints] = useState<{[key: string]: number}>({});

  useEffect(() => {
    setLocalInventory(products);
  }, [products]);

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [s, sug, c, m] = await Promise.all([
        database.getAllSales(),
        database.getAllSuggestions(),
        database.getAllCoupons(),
        database.getAllProfiles()
      ]);
      setSales(s);
      setSuggestions(sug);
      setCoupons(c);
      setMembers(m);
    } catch (err) {
      console.error("Error al refrescar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthenticated(true);
    else alert('Clave incorrecta, fiera.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Matita_web');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dllm8ggob/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.secure_url) {
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
        setEditingProduct(prev => ({ 
          ...prev, 
          imageUrl: optimizedUrl,
          isVideo: file.type.startsWith('video/')
        }));
      }
    } catch (err) {
      alert("Error en la subida.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || editingProduct.price === undefined) return alert('Faltan datos.');
    setIsLoading(true);
    try {
      const productData: Product = {
        id: editingProduct.id || `prod_${Date.now()}`,
        name: editingProduct.name,
        description: editingProduct.description || '',
        curatorNote: editingProduct.curatorNote || '',
        price: Number(editingProduct.price),
        oldPrice: editingProduct.oldPrice ? Number(editingProduct.oldPrice) : undefined,
        category: editingProduct.category || Category.ESCOLAR,
        imageUrl: editingProduct.imageUrl || '',
        gallery: editingProduct.gallery || [],
        stock: Number(editingProduct.stock || 0),
        isNew: editingProduct.isNew ?? true,
        isVideo: editingProduct.isVideo || false,
        reviews: editingProduct.reviews || []
      };
      
      if (editingProduct.id) { 
        await database.updateProduct(productData); 
        onUpdateProduct(productData);
        setLocalInventory(prev => prev.map(p => p.id === productData.id ? productData : p));
      } else { 
        await database.addProduct(productData); 
        onAddProduct(productData);
        setLocalInventory(prev => [productData, ...prev]);
      }
      setEditingProduct(null);
    } catch (e: any) { alert(`Error: ${e.message}`); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('¿Borrar esta pieza?')) return;
    // Eliminación reactiva inmediata (Optimistic UI)
    setLocalInventory(prev => prev.filter(p => p.id !== id));
    try {
      await database.deleteProduct(id);
      onDeleteProduct(id);
    } catch (e) {
      alert("Error al borrar en base de datos");
      refreshData(); // Revertir si falla
    }
  };

  const optimizeUrl = (url: string) => {
    if (!url || !url.includes('cloudinary') || url.includes('f_auto')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  };

  const stats = {
    totalSales: sales.reduce((a, b) => a + b.total, 0),
    membersCount: members.length,
    stockCount: products.reduce((a, b) => a + b.stock, 0),
    salesCount: sales.length
  };

  if (!isAuthenticated) return (
    <div className="fixed inset-0 z-[300] bg-[#0a3d31] flex items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-[#f9f7f2] p-10 rounded-[40px] shadow-2xl w-full max-w-sm border-t-[10px] border-[#c5a35d]">
        <img src={LOGO_URL} className="w-16 h-16 mx-auto mb-8 object-contain" alt="Logo" />
        <h2 className="serif text-2xl mb-10 text-[#0a3d31] font-bold uppercase italic tracking-tighter leading-none">Staff Matita</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="PIN ACCESO" className="w-full px-8 py-5 rounded-full border border-black/5 outline-none text-center font-bold tracking-[0.3em] bg-white shadow-inner" autoFocus />
          <button className="w-full bg-[#0a3d31] text-white py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#c5a35d] shadow-xl transition-all">Ingresar</button>
        </form>
        <button onClick={onClose} className="mt-10 text-[9px] opacity-30 uppercase font-bold tracking-[0.4em]">Cerrar Panel</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] bg-[#f9f7f2] flex flex-col overflow-hidden animate-fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />

      <header className="bg-[#0a3d31] text-white p-4 md:p-6 flex justify-between items-center shadow-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full p-1 shadow-lg">
            <img src={LOGO_URL} className="w-full h-full object-contain" />
          </div>
          <p className="font-bold text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-[#c5a35d]">CONTROL PANEL</p>
        </div>
        <button onClick={onClose} className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">SALIR</button>
      </header>

      <nav className="bg-[#0a3d31] border-t border-white/5 flex overflow-x-auto no-scrollbar shrink-0 px-2 py-2 gap-2 md:justify-center">
        {[
          { id: 'dashboard', label: 'Métricas', icon: '📊' },
          { id: 'inventory', label: 'Vitrina', icon: '📦' },
          { id: 'sales', label: 'Ventas', icon: '💰' },
          { id: 'members', label: 'Socios', icon: '✨' },
          { id: 'coupons', label: 'Tickets', icon: '🎫' },
          { id: 'suggestions', label: 'Ideas', icon: '💡' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-3 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#c5a35d] text-[#0a3d31] shadow-lg scale-105' : 'opacity-40 hover:opacity-100'}`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-grow overflow-y-auto p-4 md:p-12 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in space-y-10">
              <h2 className="serif text-4xl md:text-6xl text-[#0a3d31] italic">Estado Boutique.</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {[
                  { label: 'Ingresos Totales', value: formatPrice(stats.totalSales), icon: '💰' },
                  { label: 'Socios Club', value: stats.membersCount, icon: '✨' },
                  { label: 'Stock en Vitrina', value: stats.stockCount, icon: '📦' },
                  { label: 'Pedidos Realizados', value: stats.salesCount, icon: '🎫' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-[40px] border shadow-sm text-center space-y-2">
                    <span className="text-3xl block mb-2">{s.icon}</span>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#0a3d31]/40">{s.label}</p>
                    <p className="serif text-xl md:text-3xl text-[#0a3d31] font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
               <div className="flex flex-col md:flex-row justify-between items-center bg-[#f3f0e8] p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm border border-black/5 gap-6">
                <div>
                  <h2 className="serif text-4xl md:text-6xl text-[#0a3d31] italic leading-none mb-2">Vitrina.</h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#0a3d31]/40">CURADURÍA DE STOCK</p>
                </div>
                <button onClick={() => setEditingProduct({ category: Category.ESCOLAR, stock: 10, price: 0, isNew: true, isVideo: false })} className="w-full md:w-auto bg-[#0a3d31] text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-[#c5a35d] transition-all">+ NUEVA PIEZA</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localInventory.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-[40px] border shadow-sm flex flex-col gap-4 relative animate-fade-in">
                    <div className="w-full aspect-video rounded-[30px] overflow-hidden bg-[#f9f7f2] border relative group">
                      {p.isNew && <span className="absolute top-4 left-4 z-10 bg-[#0a3d31] text-white text-[7px] px-3 py-1 rounded-full font-bold">NOVEDAD</span>}
                      {p.isVideo ? <video src={optimizeUrl(p.imageUrl)} className="w-full h-full object-cover" /> : <img src={optimizeUrl(p.imageUrl)} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0a3d31] text-sm uppercase mb-1 truncate">{p.name}</h4>
                      <div className="flex justify-between items-end">
                        <p className="text-lg font-bold text-[#c5a35d]">${p.price.toLocaleString()}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="p-3 bg-blue-50 text-blue-500 rounded-full text-xs hover:bg-blue-500 hover:text-white transition-all">✏️</button>
                          <button 
                            onClick={() => handleDelete(p.id)} 
                            className="p-3 bg-red-50 text-red-400 rounded-full text-xs hover:bg-red-500 hover:text-white transition-all"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="serif text-4xl md:text-6xl text-[#0a3d31] italic">Ventas.</h2>
              <div className="space-y-4">
                {sales.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-[40px] border shadow-sm flex justify-between items-center group animate-fade-in">
                    <div className="flex-grow">
                      <p className="font-bold text-[10px] uppercase text-[#c5a35d] mb-1">{s.date}</p>
                      <p className="font-bold text-sm text-[#0a3d31] uppercase">{s.itemsDetail}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-2xl font-bold text-[#0a3d31]">${s.total.toLocaleString()}</p>
                      <button onClick={async () => { if(confirm('¿Borrar historial?')) { await database.deleteSale(s.id); refreshData(); } }} className="p-4 bg-red-50 text-red-400 rounded-full opacity-20 group-hover:opacity-100 transition-all">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="serif text-4xl md:text-6xl text-[#0a3d31] italic">Club Socios.</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {members.map(m => (
                  <div key={m.id} className="bg-white p-10 rounded-[40px] border shadow-sm flex flex-col gap-6 group animate-fade-in">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg uppercase text-[#0a3d31] mb-1">{m.name}</p>
                        <p className="text-[10px] opacity-40 font-mono">{m.email}</p>
                      </div>
                      <button onClick={async () => { if(confirm('¿Eliminar socio?')) { await database.deleteProfile(m.id); refreshData(); } }} className="p-3 bg-red-50 text-red-400 rounded-full opacity-20 group-hover:opacity-100 transition-all">🗑️</button>
                    </div>
                    <div className="flex items-center gap-4 bg-[#f9f7f2] p-6 rounded-[30px] border">
                      <div className="flex-grow">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[#0a3d31]/40 mb-2">PUNTOS</p>
                        <input 
                          type="number" 
                          value={editingPoints[m.id] !== undefined ? editingPoints[m.id] : m.points}
                          onChange={e => setEditingPoints({...editingPoints, [m.id]: Number(e.target.value)})}
                          className="bg-transparent text-xl font-bold text-[#0a3d31] outline-none w-full"
                        />
                      </div>
                      <button onClick={async () => { await database.updateProfilePoints(m.id, editingPoints[m.id]); alert('Puntos actualizados'); refreshData(); }} className="bg-[#0a3d31] text-white p-4 rounded-full text-xs">💾</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
             <div className="animate-fade-in space-y-8">
                <div className="bg-[#0a3d31] p-10 rounded-[40px] text-white shadow-2xl border-b-4 border-[#c5a35d]">
                   <h3 className="serif text-2xl italic mb-6">Crear Cupón</h3>
                   <div className="flex flex-col md:flex-row gap-4">
                     <input type="text" placeholder="CÓDIGO" value={newCouponCode} onChange={e=>setNewCouponCode(e.target.value.toUpperCase())} className="flex-grow bg-white/10 px-8 py-4 rounded-full font-bold uppercase text-[10px] outline-none border border-white/10" />
                     <input type="number" placeholder="% DESC" value={newCouponDiscount} onChange={e=>setNewCouponDiscount(e.target.value)} className="md:w-32 bg-white/10 px-8 py-4 rounded-full font-bold text-[10px] outline-none border border-white/10" />
                     <button onClick={async () => { await database.addCoupon({ code: newCouponCode, discount: Number(newCouponDiscount)/100 }); setNewCouponCode(''); setNewCouponDiscount(''); refreshData(); }} className="bg-[#c5a35d] text-[#0a3d31] px-10 py-4 rounded-full font-bold text-[10px] uppercase shadow-xl transition-all hover:scale-105">Crear</button>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {coupons.map(c => (
                    <div key={c.code} className="bg-white p-8 rounded-[40px] border shadow-sm flex justify-between items-center group animate-fade-in">
                      <div>
                        <p className="font-bold text-[#0a3d31] text-sm uppercase">{c.code}</p>
                        <p className="text-2xl font-bold text-[#c5a35d]">{c.discount * 100}% OFF</p>
                      </div>
                      <button onClick={async () => { await database.deleteCoupon(c.code); refreshData(); }} className="p-3 text-red-400 opacity-20 group-hover:opacity-100 transition-all">🗑️</button>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'suggestions' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="serif text-4xl md:text-6xl text-[#0a3d31] italic">Ideas.</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {suggestions.map(s => (
                    <div key={s.id} className="bg-white p-10 rounded-[40px] border shadow-sm relative group animate-fade-in">
                      <button onClick={async () => { if(confirm('¿Eliminar?')) { await database.deleteSuggestion(s.id); refreshData(); } }} className="absolute top-4 right-4 p-3 bg-red-50 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                      <p className="serif text-xl italic text-[#0a3d31]">"{s.text}"</p>
                      <p className="text-[8px] opacity-20 mt-4 font-bold uppercase">{s.type} • {s.date}</p>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>

        {/* Modal de Edición */}
        {editingProduct && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0a3d31]/95 backdrop-blur-xl animate-fade-in">
            <div className="bg-white p-8 md:p-14 rounded-[50px] md:rounded-[70px] max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative">
              <div className="flex justify-between items-center mb-10">
                <h3 className="serif text-3xl md:text-5xl text-[#0a3d31] italic">Curaduría de Pieza.</h3>
                <button onClick={() => setEditingProduct(null)} className="p-4 text-red-500 text-2xl hover:scale-110 transition-transform">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase opacity-40 px-4">Nombre de la Pieza</label>
                    <input type="text" value={editingProduct.name || ''} onChange={e=>setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-8 py-5 rounded-full bg-[#f9f7f2] font-bold text-xs outline-none shadow-inner border border-black/5" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase opacity-40 px-4">Precio (ARS)</label>
                      <input type="number" value={editingProduct.price || ''} onChange={e=>setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full px-8 py-5 rounded-full bg-[#f9f7f2] font-bold text-xs outline-none shadow-inner border border-black/5" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase opacity-40 px-4">Stock Local</label>
                      <input type="number" value={editingProduct.stock || ''} onChange={e=>setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full px-8 py-5 rounded-full bg-[#f9f7f2] font-bold text-xs outline-none shadow-inner border border-black/5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase opacity-40 px-4">Descripción Corta</label>
                    <textarea value={editingProduct.description || ''} onChange={e=>setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-8 py-5 rounded-[30px] bg-[#f9f7f2] text-xs outline-none shadow-inner border border-black/5 resize-none" rows={3} />
                  </div>

                  <div className="flex gap-4 p-4 bg-[#f9f7f2] rounded-[30px] border border-black/5">
                    <button 
                      onClick={() => setEditingProduct({...editingProduct, isNew: !editingProduct.isNew})}
                      className={`flex-1 py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all ${editingProduct.isNew ? 'bg-[#0a3d31] text-white shadow-lg' : 'bg-white text-[#0a3d31]/30'}`}
                    >
                      ✨ Novedad
                    </button>
                    <button 
                      onClick={() => setEditingProduct({...editingProduct, isVideo: !editingProduct.isVideo})}
                      className={`flex-1 py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all ${editingProduct.isVideo ? 'bg-[#c5a35d] text-[#0a3d31] shadow-lg' : 'bg-white text-[#0a3d31]/30'}`}
                    >
                      🎬 Es Video
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-bold uppercase opacity-40 px-4">Multimedia Boutique</label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-12 rounded-[40px] border-2 border-dashed border-[#c5a35d]/40 bg-[#f9f7f2] flex flex-col items-center gap-3 hover:border-[#c5a35d] transition-all group"
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">{isLoading ? '⏳' : '📸'}</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest">{isLoading ? 'Subiendo...' : 'Abrir Galería'}</p>
                  </button>
                  
                  {editingProduct.imageUrl && (
                    <div className="p-4 bg-white rounded-3xl border border-black/5 flex items-center gap-4 animate-fade-in shadow-sm">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-md">
                         {editingProduct.isVideo ? <video src={optimizeUrl(editingProduct.imageUrl)} className="w-full h-full object-cover" /> : <img src={optimizeUrl(editingProduct.imageUrl)} className="w-full h-full object-cover" />}
                      </div>
                      <div className="truncate flex-grow">
                        <p className="text-[7px] font-bold text-[#c5a35d] uppercase">Vínculo Seguro Generado</p>
                        <p className="text-[8px] opacity-30 truncate font-mono">{editingProduct.imageUrl}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-10 mt-10 border-t border-black/5">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-6 border-2 border-black/5 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-black/5 transition-all">Cancelar</button>
                <button onClick={handleSaveProduct} disabled={isLoading} className="flex-1 py-6 rounded-full font-bold uppercase text-[10px] tracking-widest text-white bg-[#0a3d31] hover:bg-[#c5a35d] shadow-xl transition-all disabled:opacity-50">
                  {isLoading ? 'GUARDANDO...' : 'Guardar en Vitrina'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
