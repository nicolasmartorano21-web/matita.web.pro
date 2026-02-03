
import React from 'react';
import { Product } from '../types';
import { formatPrice } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isFavorite, onToggleFavorite }) => {
  const isOutOfStock = (product.stock || 0) <= 0;
  const isLowStock = !isOutOfStock && (product.stock || 0) <= 3;
  const hasOffer = product.oldPrice && product.oldPrice > product.price;

  // Helper para optimizar URL de Cloudinary
  const optimizeUrl = (url: string) => {
    if (!url || !url.includes('cloudinary')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  };

  return (
    <div className={`group relative bg-white rounded-[40px] md:rounded-[60px] overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 animate-fade-in ${isOutOfStock ? 'opacity-70' : ''} h-full flex flex-col`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f0e8]">
        
        {/* Favorito */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(product.id); }}
          className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 border border-black/5"
        >
          <span className={`text-xl transition-all ${isFavorite ? 'text-red-500 scale-110' : 'text-gray-300'}`}>
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>

        {/* Badges */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
          {product.isNew && !isOutOfStock && (
            <span className="bg-[#0a3d31] text-[#f9f7f2] text-[7px] font-bold px-4 py-1.5 rounded-full tracking-[0.25em] shadow-lg border border-[#c5a35d]/30">
              NUEVO
            </span>
          )}
          {hasOffer && !isOutOfStock && (
            <span className="bg-red-500 text-white text-[7px] font-bold px-4 py-1.5 rounded-full tracking-[0.25em] shadow-lg uppercase">
              Oferta
            </span>
          )}
        </div>

        {isLowStock && (
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-[#c5a35d] text-[8px] text-white font-bold px-6 py-2 rounded-full tracking-[0.2em] shadow-xl whitespace-nowrap border border-white/20">
            ÚLTIMAS {product.stock}
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-[#0a3d31]/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-[9px] font-bold px-8 py-3 rounded-full tracking-[0.4em] shadow-2xl rotate-[-3deg] border-2 border-white/30 uppercase">
              Agotado
            </span>
          </div>
        )}
        
        <div className={`w-full h-full transform group-hover:scale-105 transition-transform duration-[2s] ease-out ${isOutOfStock ? 'grayscale' : ''}`}>
          {product.isVideo ? (
            <video src={optimizeUrl(product.imageUrl)} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={optimizeUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          )}
        </div>
      </div>

      <div className="p-8 md:p-10 text-center relative flex-grow flex flex-col justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.4em] text-[#c5a35d] mb-3 font-bold opacity-80">{product.category}</p>
          <h3 className="serif text-2xl mb-4 text-[#0a3d31] group-hover:text-[#c5a35d] transition-colors line-clamp-2 uppercase tracking-tighter italic leading-tight">{product.name}</h3>
        </div>
        
        <div className="flex flex-col items-center mt-auto">
          <div className="relative mb-2">
            {hasOffer && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-red-400 line-through font-bold whitespace-nowrap opacity-60">
                {formatPrice(product.oldPrice!)}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="serif text-4xl font-bold text-[#0a3d31] tracking-tighter">
                <span className="text-xl align-top mr-1 text-[#c5a35d]">$</span>
                {product.price.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
          
          <div className="h-px w-10 bg-[#c5a35d]/40 mb-5"></div>
          
          <button 
            disabled={isOutOfStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className={`text-[9px] font-bold uppercase tracking-[0.3em] transition-all py-3.5 px-10 rounded-full border w-full max-w-[200px] ${
              isOutOfStock 
                ? 'text-gray-300 border-gray-100' 
                : 'text-[#0a3d31] border-[#0a3d31]/15 hover:bg-[#0a3d31] hover:text-white hover:shadow-xl active:scale-95'
            }`}
          >
            {isOutOfStock ? 'Sin Stock' : 'Adquirir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
