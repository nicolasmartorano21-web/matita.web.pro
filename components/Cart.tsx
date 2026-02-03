
import React, { useState, useEffect } from 'react';
import { CartItem, Coupon, Sale, User } from '../types';
import { CONTACT_INFO, formatPrice, PAYMENT_METHODS, ICONS } from '../constants';
import { database } from '../lib/database';

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSuccess?: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onClose, onUpdateQuantity, onRemove, onSuccess }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);

  const GIFT_WRAP_PRICE = 2000;
  const POINTS_CONVERSION = 0.5; // 1 punto = $0.50
  const MIN_PURCHASE_FOR_BIENVENIDA = 15000;

  useEffect(() => {
    database.getAllCoupons().then(setAvailableCoupons);
    database.getUser().then(u => {
      if (u && u.id !== 'local') setUser(u);
    });
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (code === 'BIENVENIDA') {
      if (subtotal < MIN_PURCHASE_FOR_BIENVENIDA) {
        alert(`¡Fiera! El cupón BIENVENIDA es para compras mayores a ${formatPrice(MIN_PURCHASE_FOR_BIENVENIDA)}.`);
        return;
      }
      setAppliedDiscount(0.15);
      alert('¡Bienvenido! 15% de descuento boutique aplicado.');
      return;
    }
    const found = availableCoupons.find(c => c.code === code);
    if (found) {
      setAppliedDiscount(found.discount);
      alert(`Descuento del ${found.discount * 100}% aplicado.`);
    } else alert('Cupón no válido o expirado.');
  };

  const couponReduction = subtotal * appliedDiscount;
  const maxPointsDiscount = subtotal * 0.5; // Hasta 50% con puntos
  const pointsDiscountValue = user && usePoints ? Math.min(user.points * POINTS_CONVERSION, maxPointsDiscount) : 0;
  const pointsUsed = pointsDiscountValue / POINTS_CONVERSION;

  const total = Math.max(0, subtotal - couponReduction - pointsDiscountValue + (isGift ? GIFT_WRAP_PRICE : 0));

  const handleCheckout = async () => {
    const selectedPay = PAYMENT_METHODS.find(p => p.id === paymentMethod);
    
    const newSale: Sale = {
      id: `s_${Date.now()}`,
      date: new Date().toLocaleString(),
      total: total,
      itemsCount: items.reduce((acc, item) => acc + item.quantity, 0),
      itemsDetail: items.map(i => `${i.name} (x${i.quantity})`).join(', ') + 
                   (isGift ? ' + Pack Regalo' : '') + 
                   (usePoints ? ` (✨-${pointsUsed} pts)` : '') +
                   ` [Pago: ${selectedPay?.label}]`
    };
    
    await database.addSale(newSale);
    if (user && usePoints) await database.updateProfilePoints(user.id, user.points - pointsUsed);

    const message = `*✨ RESERVA MATITA BOUTIQUE ✨*\n` +
      `--------------------------------\n` +
      `Socio: ${user ? user.name : 'Invitado'}\n\n` +
      items.map(i => `📦 *${i.name}* (x${i.quantity}) - ${formatPrice(i.price * i.quantity)}`).join('\n') +
      (isGift ? `\n\n🎁 *REGALO:* Pack Premium\n📜 *DEDICATORIA:* "${giftNote}"` : '') +
      (usePoints ? `\n\n✨ *CLUB MATITA:* -${formatPrice(pointsDiscountValue)}` : '') +
      (appliedDiscount > 0 ? `\n🎫 *DESCUENTO:* -${formatPrice(couponReduction)}` : '') +
      `\n\n💳 *MÉTODO DE PAGO:* ${selectedPay?.label}\n` +
      `💰 *TOTAL A ABONAR:* ${formatPrice(total)}\n\n` +
      `_Retiro en: Simón Bolivar 1206, La Calera._`;
    
    window.open(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-[#0a3d31]/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#f9f7f2] h-full shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-8 md:p-10 border-b bg-white flex justify-between items-center">
          <div className="text-center w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a3d31] serif italic leading-none mb-2">Tu Bolsa.</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-[#c5a35d]"></span>
              <p className="text-[9px] text-[#c5a35d] font-bold uppercase tracking-[0.4em]">Curaduría Matita</p>
              <span className="h-px w-8 bg-[#c5a35d]"></span>
            </div>
          </div>
          <button onClick={onClose} className="absolute right-6 text-[#0a3d31]/30 hover:text-[#0a3d31] transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-8 md:p-10 space-y-12 no-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-40 opacity-20 italic serif text-2xl">La bolsa espera ser llenada...</div>
          ) : (
            <>
              {/* Lista de Productos */}
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-6 items-center group">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden shadow-md border bg-white flex-shrink-0">
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-grow space-y-2">
                      <h3 className="font-bold text-[10px] text-[#0a3d31] uppercase tracking-widest">{item.name}</h3>
                      <p className="serif text-xl text-[#c5a35d] font-bold">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 bg-white rounded-full px-4 py-1.5 border shadow-sm">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-[#0a3d31] font-bold">-</button>
                          <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-[#0a3d31] font-bold">+</button>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-[8px] text-red-400 font-bold uppercase tracking-[0.2em] hover:text-red-600">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Club Matita */}
              {user && (
                <div className="bg-[#0a3d31] p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">✨</span>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-[#c5a35d] font-bold">Membresía Activa</p>
                        <p className="text-sm font-bold serif italic">Tenés {user.points.toLocaleString()} puntos</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUsePoints(!usePoints)}
                      className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${usePoints ? 'bg-[#c5a35d]' : 'bg-white/20'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${usePoints ? 'translate-x-7' : ''}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Cupones Boutique */}
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#0a3d31]/40 font-bold px-2">Código de Cortesía</p>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="INGRESÁ CÓDIGO"
                    className="flex-grow bg-white border border-black/5 rounded-full px-6 py-4 text-[10px] font-bold outline-none shadow-sm focus:border-[#c5a35d]"
                  />
                  <button onClick={handleApplyCoupon} className="bg-[#0a3d31] text-white px-8 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-[#c5a35d] transition-colors">Validar</button>
                </div>
              </div>

              {/* Métodos de Pago */}
              <div className="space-y-4 pt-6 border-t border-black/5">
                <h4 className="text-[10px] font-bold text-[#0a3d31] uppercase tracking-[0.3em] mb-4">Finalizar con</h4>
                <div className="grid grid-cols-1 gap-3">
                  {PAYMENT_METHODS.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => setPaymentMethod(p.id)}
                      className={`w-full p-5 rounded-[30px] border transition-all text-left flex items-center gap-5 ${paymentMethod === p.id ? 'bg-[#0a3d31] text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white border-black/5 text-[#0a3d31]/50 hover:bg-black/[0.02]'}`}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{p.label}</p>
                        <p className={`text-[9px] opacity-60 font-bold italic serif ${paymentMethod === p.id ? 'text-[#c5a35d]' : ''}`}>{p.detail}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Regalo */}
              <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#0a3d31] font-bold">¿Es un regalo?</p>
                      <p className="text-[8px] opacity-40 font-bold uppercase tracking-tighter">Pack Boutique Matita +$2.000</p>
                    </div>
                  </div>
                  <button onClick={() => setIsGift(!isGift)} className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${isGift ? 'bg-[#0a3d31]' : 'bg-black/10'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isGift ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
                {isGift && (
                  <textarea 
                    value={giftNote} 
                    onChange={e => setGiftNote(e.target.value)} 
                    placeholder="Dedicatoria personalizada..." 
                    className="w-full bg-[#f9f7f2] border-none rounded-3xl p-6 text-[11px] italic serif outline-none shadow-inner" 
                    rows={3} 
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="p-8 md:p-12 bg-white border-t rounded-t-[50px] shadow-2xl space-y-6">
            <div className="space-y-3 text-[11px] font-bold uppercase tracking-widest text-[#0a3d31]/50">
               <div className="flex justify-between px-2"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
               {appliedDiscount > 0 && <div className="flex justify-between px-2 text-[#c5a35d]"><span>Cortesía</span><span>-{formatPrice(couponReduction)}</span></div>}
               {usePoints && <div className="flex justify-between px-2 text-[#c5a35d]"><span>Beneficio Club</span><span>-{formatPrice(pointsDiscountValue)}</span></div>}
               {isGift && <div className="flex justify-between px-2"><span>Pack Regalo</span><span>+{formatPrice(GIFT_WRAP_PRICE)}</span></div>}
               
               <div className="pt-6 border-t border-black/5 flex justify-between items-end text-[#0a3d31]">
                  <div className="flex flex-col">
                    <span className="serif text-xl italic normal-case leading-none">Total</span>
                    <span className="text-[8px] opacity-30 mt-1">Precio sujeto a stock en boutique</span>
                  </div>
                  <span className="serif text-4xl font-bold tracking-tighter">{formatPrice(total)}</span>
               </div>
            </div>
            <button onClick={handleCheckout} className="w-full bg-[#0a3d31] text-white py-6 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-[#c5a35d] transition-all shadow-2xl active:scale-95">
              Confirmar Reserva vía WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
