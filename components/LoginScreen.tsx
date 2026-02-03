
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ICONS, LOGO_URL } from '../constants';

interface LoginScreenProps {
  onLogin: () => void;
  onGuest: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGuest }) => {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorInfo, setErrorInfo] = useState<{message: string, type: 'error' | 'info' | 'unconfirmed'} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorInfo(null);

    try {
      if (!supabase || !isSupabaseConfigured) {
        onLogin();
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() }
          }
        });
        if (error) throw error;
        
        setErrorInfo({
          type: 'info',
          message: "¡Casi listo! Enviamos un mail a tu casilla. Revisá SPAM o Promociones si no lo ves en un minuto."
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setErrorInfo({
              type: 'unconfirmed',
              message: "Tu email aún no fue confirmado. Revisá tu correo (y la carpeta de SPAM)."
            });
            return;
          }
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Credenciales inválidas. Revisá el mail y la contraseña.");
          }
          throw error;
        }
        onLogin();
      }
    } catch (error: any) {
      setErrorInfo({
        type: 'error',
        message: error.message || "Algo falló, fiera. Probá de nuevo."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) throw error;
      setErrorInfo({
        type: 'info',
        message: "¡Correo de confirmación reenviado! Revisá tu SPAM ahora."
      });
    } catch (err: any) {
      alert("Error al reenvíar: " + err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a3d31] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-[450px] animate-fade-in py-8">
        <div className="mb-6 md:mb-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[#c5a35d] shadow-2xl mb-4 md:mb-6 bg-white p-2 flex items-center justify-center">
            <img 
              src={LOGO_URL} 
              className="w-full h-full object-contain" 
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/100?text=M")}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#c5a35d] tracking-tighter uppercase mb-1 italic serif">Matita v3</h1>
          <p className="text-[#f9f7f2]/40 uppercase tracking-[0.5em] text-[7px] md:text-[8px] font-bold">Membresía Boutique</p>
        </div>
        
        <div className="bg-[#f9f7f2] p-6 md:p-10 rounded-[40px] md:rounded-[60px] shadow-2xl border border-[#c5a35d]/10">
          <h2 className="serif text-2xl md:text-3xl text-[#0a3d31] mb-2 italic text-center">
            {isSignUp ? 'Sumate al Club.' : 'Hola de nuevo.'}
          </h2>
          <p className="text-[9px] md:text-[10px] text-[#0a3d31]/40 uppercase tracking-widest font-bold mb-6 md:mb-8 text-center">
            {isSignUp ? 'Creá tu credencial para sumar puntos.' : 'Ingresá tus datos de socio.'}
          </p>
          
          {errorInfo && (
            <div className={`mb-6 p-5 rounded-3xl text-[10px] font-bold uppercase tracking-widest border flex flex-col items-center gap-3 text-center ${
              errorInfo.type === 'error' ? 'bg-red-50 text-red-500 border-red-100' : 
              errorInfo.type === 'unconfirmed' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-[#0a3d31]/5 text-[#0a3d31] border-[#0a3d31]/10'
            }`}>
              <p>{errorInfo.message}</p>
              {errorInfo.type === 'unconfirmed' && (
                <button 
                  onClick={handleResend}
                  disabled={resending}
                  className="bg-[#0a3d31] text-white px-6 py-2.5 rounded-full text-[8px] hover:bg-[#c5a35d] transition-all disabled:opacity-50"
                >
                  {resending ? 'Enviando...' : 'Reenviar mail de confirmación'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {isSignUp && (
              <input 
                type="text" 
                placeholder="NOMBRE COMPLETO"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-[#0a3d31]/5 rounded-full px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs outline-none focus:border-[#c5a35d] transition-all font-bold uppercase tracking-widest shadow-inner"
              />
            )}
            <input 
              type="email" 
              placeholder="EMAIL"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white border border-[#0a3d31]/5 rounded-full px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs outline-none focus:border-[#c5a35d] transition-all font-bold uppercase tracking-widest shadow-inner"
            />
            
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="CONTRASEÑA"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white border border-[#0a3d31]/5 rounded-full px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs outline-none focus:border-[#c5a35d] transition-all font-bold uppercase tracking-widest shadow-inner pr-14"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-[#0a3d31]/30 hover:text-[#c5a35d] transition-colors p-2"
              >
                {showPassword ? <ICONS.EyeSlash className="w-4 h-4 md:w-5 md:h-5" /> : <ICONS.Eye className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a3d31] text-white py-4 md:py-5 rounded-full font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-[#c5a35d] transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? 'Procesando...' : (isSignUp ? 'Crear Cuenta' : 'Ingresar')}
            </button>
          </form>

          <div className="mt-6 md:mt-8 text-center space-y-3 md:space-y-4">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorInfo(null);
              }}
              className="text-[8px] md:text-[9px] text-[#0a3d31]/40 font-bold uppercase tracking-[0.2em] hover:text-[#c5a35d] transition-colors"
            >
              {isSignUp ? '¿Ya tenés cuenta? Entrá acá' : '¿No sos socio? Registrate'}
            </button>
            <div className="h-px bg-[#0a3d31]/5 w-10 md:w-12 mx-auto"></div>
            <button 
              onClick={onGuest}
              className="text-[8px] text-[#0a3d31]/20 font-bold uppercase tracking-[0.3em] hover:text-[#0a3d31] transition-colors py-2"
            >
              Entrar como invitado
            </button>
          </div>
        </div>
        
        <p className="mt-8 md:mt-10 text-center text-[#f9f7f2]/20 text-[7px] uppercase tracking-[0.4em] font-bold">
          Matita HQ • La Calera, Córdoba
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
