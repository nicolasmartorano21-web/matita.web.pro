
import React from 'react';
import { User } from '../types';
import { LOGO_URL } from '../constants';

interface ClubViewProps {
  user: User | null;
  onLogout?: () => void;
}

const ClubView: React.FC<ClubViewProps> = ({ user, onLogout }) => {
  if (!user) return (
    <div className="max-w-xl mx-auto text-center py-20 animate-fade-in bg-white rounded-[40px] md:rounded-[60px] shadow-2xl p-8 md:p-12 mt-10 border border-[#c5a35d]/10 mx-4">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-[#c5a35d]/10 rounded-full flex items-center justify-center mx-auto mb-10">
        <span className="text-4xl animate-pulse">✨</span>
      </div>
      <h3 className="serif text-3xl md:text-4xl text-[#0a3d31] mb-6 leading-tight italic">Club Matita.</h3>
      <p className="text-xs md:text-sm opacity-60 mb-10 leading-relaxed italic px-4">
        Sumate a la comunidad literaria más exclusiva de La Calera. Registrate para acumular puntos por tus compras en el local y canjearlos por piezas únicas.
      </p>
      <p className="text-[9px] md:text-[10px] font-bold text-[#c5a35d] uppercase tracking-[0.4em] bg-[#f9f7f2] py-4 rounded-full inline-block px-10">
        Ingresá para acceder a tus beneficios
      </p>
    </div>
  );

  const getLevelColor = (points: number) => {
    if (points >= 5000) return 'from-[#c5a35d] to-[#0a3d31] text-white border-[#c5a35d]/50';
    if (points >= 2000) return 'from-[#f3f0e8] to-white text-[#0a3d31] border-[#0a3d31]/10';
    return 'from-[#0a3d31] to-[#0d5a49] text-[#c5a35d] border-[#c5a35d]/30';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20 px-4">
      <div className="text-center mb-8 md:mb-16">
        <h2 className="serif text-5xl md:text-7xl text-[#0a3d31] mb-4 italic">Mi Club.</h2>
        <p className="text-[#c5a35d] uppercase tracking-[0.4em] font-bold text-[9px] md:text-[10px]">Membresía Digital Activa</p>
      </div>

      <div className={`relative w-full aspect-auto md:aspect-[1.6/1] min-h-[250px] md:min-h-0 rounded-[40px] md:rounded-[60px] p-8 md:p-16 shadow-2xl border bg-gradient-to-br ${getLevelColor(user.points)} mb-12 md:mb-20 overflow-hidden group flex flex-col justify-between`}>
        <div className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 md:-mr-40 md:-mt-40 transition-transform group-hover:scale-110"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full p-2 flex items-center justify-center shadow-lg">
            <img 
              src={LOGO_URL} 
              className="w-full h-full object-contain" 
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/100?text=M")}
            />
          </div>
          <div className="text-right">
             <p className="text-[7px] md:text-[8px] font-bold tracking-[0.4em] uppercase opacity-40">Boutique Matita</p>
             <p className="text-[10px] md:text-[11px] font-bold uppercase serif italic text-[#c5a35d]">Socio Elite</p>
          </div>
        </div>

        <div className="mt-8 md:mt-12 relative z-10">
          <p className="text-[8px] md:text-[9px] font-bold tracking-[0.5em] uppercase opacity-40 mb-2 md:mb-3">Socio Titular</p>
          <h3 className="text-2xl md:text-5xl font-bold tracking-tighter uppercase serif leading-none truncate max-w-full">{user.name}</h3>
        </div>

        <div className="mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-6">
          <div>
            <p className="text-[8px] md:text-[9px] font-bold tracking-[0.5em] uppercase opacity-40 mb-2">Puntos Disponibles</p>
            <p className="text-4xl md:text-5xl font-light tracking-tighter">✨ {user.points.toLocaleString()}</p>
          </div>
          <div className="hidden md:block bg-white/10 p-5 rounded-[30px] backdrop-blur-md border border-white/20">
             <div className="grid grid-cols-5 gap-1.5 opacity-40">
                {[...Array(10)].map((_, i) => <div key={i} className="w-2 h-2 bg-current rounded-full"></div>)}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-12">
        <div className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm border border-[#0a3d31]/5 text-center">
           <h4 className="font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#c5a35d] mb-6">Nivel de Lealtad</h4>
           <div className="w-full h-2.5 bg-[#f9f7f2] rounded-full overflow-hidden mb-6 border shadow-inner">
              <div className="h-full bg-[#0a3d31] transition-all duration-1000 shadow-[0_0_10px_rgba(10,61,49,0.3)]" style={{ width: `${Math.min((user.points / 5000) * 100, 100)}%` }}></div>
           </div>
           <p className="text-[9px] md:text-[10px] opacity-40 font-bold uppercase tracking-widest italic">Beneficios acumulados</p>
        </div>
        <div className="bg-[#0a3d31] p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-2xl text-center text-white relative overflow-hidden group">
           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <h4 className="font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#c5a35d] mb-6">Canjes Directos</h4>
           <p className="text-xs md:text-sm italic serif opacity-70 leading-relaxed mb-6">Presentá tu credencial en local para descontar tus puntos del total de tu compra.</p>
           <p className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">Altos de La Calera</p>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={onLogout}
          className="px-12 py-5 bg-[#0a3d31] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95"
        >
          Cerrar Sesión Socio
        </button>
      </div>
    </div>
  );
};

export default ClubView;
