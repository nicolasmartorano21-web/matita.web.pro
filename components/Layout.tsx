
import React, { useState } from 'react';
import { ICONS, CONTACT_INFO, LOGO_URL } from '../constants';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  onLoginClick: () => void;
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  cartCount, 
  onCartClick, 
  onAdminClick, 
  onLoginClick, 
  onNavigate,
  currentView,
  isLoggedIn,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'catalog', label: 'Catálogo' },
    { id: 'news', label: 'Novedades' },
    { id: 'favorites', label: 'Deseados' },
    { id: 'club', label: 'Mi Club' },
    { id: 'suggestions', label: 'Ideas' },
    { id: 'about', label: 'Boutique' }
  ];

  const handleNav = (id: ViewType) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#f9f7f2]">
      {/* WhatsApp / IG Buttons */}
      <div className="fixed bottom-6 right-4 md:bottom-10 md:right-8 z-[140] flex flex-col gap-4 md:gap-6 items-center">
        <a href={`https://instagram.com/${CONTACT_INFO.instagram}`} target="_blank" className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-all border-2 border-white/40">
           <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058-1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all border-2 border-white/40">
           <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-9 md:h-9"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.196 1.608 6.03L0 24l6.117-1.605a11.847 11.847 0 005.933 1.598h.005c6.635 0 12.045-5.407 12.049-12.044a11.821 11.821 0 00-3.535-8.503z"/></svg>
        </a>
      </div>

      <header className="sticky top-0 z-[100] bg-[#f9f7f2]/95 backdrop-blur-md border-b border-black/5 px-4 md:px-10 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-[#0a3d31] hover:bg-black/5 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={()=>handleNav('catalog')}>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#c5a35d] bg-white p-1 shadow-md group-hover:rotate-3 transition-transform">
                 <img src={LOGO_URL} className="w-full h-full object-contain" alt="Matita Logo" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-lg md:text-2xl font-bold text-[#0a3d31] tracking-tighter uppercase italic serif leading-tight">MATITA</h1>
                <p className="text-[6px] md:text-[8px] text-[#c5a35d] font-bold tracking-[0.4em] uppercase">Boutique Literaria</p>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-10 text-[#0a3d31]/50 font-bold uppercase tracking-[0.2em] text-[10px]">
            {navItems.map(item => (
              <button key={item.id} onClick={()=>handleNav(item.id as ViewType)} className={`hover:text-[#c5a35d] relative py-1 transition-colors ${currentView === item.id ? 'text-[#0a3d31]' : ''}`}>
                {item.label}
                {currentView === item.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#c5a35d]"></span>}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onAdminClick} className="p-2 opacity-30 hover:opacity-100 transition-all" title="Admin"><ICONS.Admin className="w-5 h-5 md:w-6 md:h-6" /></button>
            <button onClick={() => handleNav('favorites')} className={`p-2 transition-colors ${currentView === 'favorites' ? 'text-red-500' : 'text-[#0a3d31]/40 hover:text-red-400'}`} title="Favoritos">
              <svg xmlns="http://www.w3.org/2000/svg" fill={currentView === 'favorites' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>
            <button onClick={onLoginClick} className={`p-2 transition-colors ${isLoggedIn ? 'text-[#c5a35d]' : 'text-[#0a3d31]/40 hover:text-[#0a3d31]'}`} title="Usuario"><ICONS.User className="w-5 h-5 md:w-6 md:h-6" /></button>
            <button onClick={onCartClick} className="relative p-2.5 md:p-3 bg-[#0a3d31] text-white rounded-full shadow-lg hover:bg-[#c5a35d] transition-all transform active:scale-95" title="Carrito">
              <ICONS.Cart className="w-5 h-5 md:w-6 md:h-6" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#c5a35d] text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#f9f7f2] animate-bounce">{cartCount}</span>}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#f9f7f2] border-b border-black/10 lg:hidden animate-fade-in shadow-2xl z-[110]">
            <nav className="flex flex-col p-8 gap-3 text-center">
              {navItems.map(item => (
                <button key={item.id} onClick={()=>handleNav(item.id as ViewType)} className={`text-[12px] font-bold uppercase tracking-[0.3em] py-4 rounded-2xl transition-all ${currentView === item.id ? 'bg-[#0a3d31] text-white shadow-lg' : 'text-[#0a3d31]/60 hover:bg-black/5'}`}>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-10 py-6 md:py-12 animate-fade-in">
        {children}
      </main>

      <footer className="bg-[#0a3d31] text-[#f9f7f2] pt-20 pb-10 px-6 border-t-[5px] border-[#c5a35d]">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="space-y-6 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white p-2 border border-[#c5a35d] shadow-xl">
                  <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
                </div>
                <h2 className="text-2xl font-bold tracking-tighter uppercase italic serif">MATITA</h2>
              </div>
              <p className="text-xs italic opacity-60 max-w-sm serif">"Curaduría analógica para mentes creativas en las sierras cordobesas."</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#c5a35d] mb-6">Explorar Boutique</h3>
              <nav className="flex flex-col gap-4 text-[10px] opacity-50 font-bold uppercase tracking-widest">
                <button onClick={()=>handleNav('catalog')} className="hover:text-[#c5a35d] transition-colors">Catálogo Completo</button>
                <button onClick={()=>handleNav('favorites')} className="hover:text-[#c5a35d] transition-colors">Deseados ❤️</button>
                <button onClick={()=>handleNav('club')} className="hover:text-[#c5a35d] transition-colors">Club de Socios</button>
              </nav>
            </div>
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 text-center md:text-left">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#c5a35d] mb-3">Local Calera</p>
              <p className="text-xs opacity-60 mb-6 italic serif leading-relaxed">Simón Bolivar 1206, Local 2 y 3<br />Altos de La Calera, Córdoba</p>
              <a href={CONTACT_INFO.mapLink} target="_blank" className="text-[9px] font-bold uppercase tracking-widest border-b border-[#c5a35d]/30 pb-1 inline-block">Ver Mapa</a>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 text-center text-[8px] font-bold uppercase tracking-[0.5em] text-white/20">
            MATITA BOUTIQUE LITERARIA • CÓRDOBA, ARGENTINA © 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
