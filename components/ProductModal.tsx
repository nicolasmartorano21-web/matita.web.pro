
import React, { useState, useRef } from 'react';
import { Product, Review } from '../types';
import { database } from '../lib/database';
import { formatPrice } from '../constants';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [activeMedia, setActiveMedia] = useState(product.imageUrl);
  const [comment, setComment] = useState('');
  const actionSectionRef = useRef<HTMLDivElement>(null);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const newReview: Review = {
      id: Date.now().toString(),
      userName: 'Socio Matita',
      rating: 5,
      comment: comment,
      date: new Date().toISOString().split('T')[0]
    };
    await database.addReview(product.id, newReview);
    alert('¡Gracias, fiera! Tu opinión es oro.');
    setComment('');
  };

  const scrollToReserve = () => {
    actionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const isOutOfStock = (product.stock || 0) <= 0;
  const gallery = product.gallery || [product.imageUrl];

  // Helper para optimizar URL de Cloudinary
  const optimizeUrl = (url: string) => {
    if (!url || !url.includes('cloudinary')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a3d31]/95 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#f9f7f2] h-[94vh] md:h-auto md:max-h-[88vh] rounded-t-[40px] md:rounded-[60px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-fade-in border-t border-white/20">
        
        {/* Botón Cerrar Flotante */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-[180] bg-white/10 hover:bg-[#c5a35d] p-3 rounded-full text-white transition-all backdrop-blur-xl border border-white/10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Galería Multimedia - Jump to Action */}
        <div className="w-full md:w-1/2 flex flex-col h-[32vh] md:h-auto bg-white flex-shrink-0 relative group">
          <div 
            className="flex-grow relative overflow-hidden cursor-s-resize"
            onClick={scrollToReserve}
          >
            {product.isVideo ? (
               <video src={optimizeUrl(activeMedia)} autoPlay muted loop playsInline className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`} />
            ) : (
               <img 
                src={optimizeUrl(activeMedia)} 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`} 
                alt={product.name}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none md:hidden" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/30 md:hidden animate-bounce">
              <span className="text-[9px] text-white font-bold uppercase tracking-widest">Tocar para Reservar ↓</span>
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="h-14 flex gap-2 p-2 overflow-x-auto no-scrollbar bg-white border-t border-black/5">
               {gallery.map((media, i) => (
                 <button key={i} onClick={() => setActiveMedia(media)} className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeMedia === media ? 'border-[#c5a35d]' : 'border-transparent opacity-40'}`}>
                    <img src={optimizeUrl(media)} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Detalles - UX Mobile Rediseñada */}
        <div className="w-full md:w-1/2 p-5 md:p-12 overflow-y-auto no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
          <div className="max-w-md mx-auto flex flex-col">
            
            <header className="text-center mb-6 md:mb-10">
              <p className="text-[7px] uppercase tracking-[0.4em] text-[#c5a35d] font-bold mb-2">Boutique Literaria / {product.category}</p>
              <h2 className="serif text-3xl md:text-6xl text-[#0a3d31] leading-[1] uppercase italic tracking-tighter mb-4">{product.name}</h2>
            </header>
            
            {/* SECCIÓN DE ACCIÓN CENTRADA (Foco del Modal) */}
            <div 
              ref={actionSectionRef}
              className="bg-white p-7 md:p-10 rounded-[35px] md:rounded-[45px] shadow-xl border border-[#c5a35d]/10 mb-8 flex flex-col items-center text-center space-y-5"
            >
              <div className="space-y-1">
                <p className="text-[8px] font-bold text-[#c5a35d] uppercase tracking-[0.4em] mb-1">Inversión Boutique</p>
                <span className="serif text-5xl md:text-7xl font-bold text-[#0a3d31] tracking-tighter leading-none">
                  <span className="text-xl align-top mr-1 opacity-20">$</span>
                  {product.price.toLocaleString('es-AR')}
                </span>
                <div className="pt-2">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-4 py-1 rounded-full ${isOutOfStock ? 'bg-red-50 text-red-400' : 'bg-[#0a3d31]/5 text-[#0a3d31]'}`}>
                    {isOutOfStock ? 'Agotado temporalmente' : `${product.stock} piezas en vitrina`}
                  </span>
                </div>
              </div>

              <button 
                disabled={isOutOfStock}
                onClick={() => { onAddToCart(product); onClose(); }}
                className={`w-full py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 ${
                  isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#0a3d31] text-white hover:bg-[#c5a35d]'
                }`}
              >
                {!isOutOfStock && <span className="text-lg">🛒</span>}
                {isOutOfStock ? 'Sin disponibilidad' : 'Reservar para Retiro'}
              </button>
              
              <p className="text-[7px] opacity-30 font-bold uppercase tracking-widest italic">Simón Bolivar 1206, La Calera</p>
            </div>

            {/* Contenido Descriptivo Compacto */}
            <div className="space-y-6">
              <p className="text-[#0a3d31]/80 leading-relaxed text-sm italic serif text-center px-4 md:px-0">
                "{product.description}"
              </p>

              {product.curatorNote && (
                <div className="p-5 bg-white rounded-3xl border border-black/5 text-center shadow-sm">
                   <p className="text-[7px] font-bold uppercase tracking-widest text-[#c5a35d] mb-1">Nota del Curador</p>
                   <p className="serif text-xs text-[#0a3d31]/70 leading-relaxed italic">"{product.curatorNote}"</p>
                </div>
              )}

              {/* Testimonios */}
              <div className="pt-6 border-t border-black/5">
                <h3 className="serif text-xl mb-4 italic text-[#0a3d31] text-center">Reseñas.</h3>
                <div className="space-y-4 mb-6">
                  {product.reviews.slice(0, 1).map(r => (
                    <div key={r.id} className="text-center">
                      <p className="text-[11px] serif italic opacity-60">"{r.comment}"</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-[#c5a35d] mt-2">— {r.userName}</p>
                    </div>
                  ))}
                  {product.reviews.length === 0 && <p className="text-[9px] opacity-20 italic text-center uppercase tracking-widest">Pieza sin reseñas</p>}
                </div>

                <form onSubmit={handleReview} className="flex flex-col gap-3">
                   <input 
                    type="text" 
                    value={comment} 
                    onChange={e=>setComment(e.target.value)} 
                    placeholder="Contanos qué te pareció..." 
                    className="bg-white rounded-full px-6 py-4 text-[10px] outline-none border border-black/5 focus:border-[#c5a35d] text-center shadow-sm" 
                   />
                   <button className="text-[8px] font-bold uppercase tracking-widest text-[#0a3d31]/40 hover:text-[#c5a35d] transition-colors">Publicar opinión</button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
