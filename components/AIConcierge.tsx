
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { getGeminiConcierge } from '../services/geminiService';
import { LOGO_URL } from '../constants';

interface AIConciergeProps {
  products: Product[];
}

const AIConcierge: React.FC<AIConciergeProps> = ({ products }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const reply = await getGeminiConcierge(userText, products);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Che fiera, se me chispoteó el sistema. Probá en un ratito." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {isOpen ? (
        <div className="bg-[#f9f7f2] w-[320px] sm:w-[380px] h-[550px] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-[#c5a35d]/20 animate-fade-in">
          {/* Header */}
          <div className="bg-[#0a3d31] p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c5a35d] bg-white p-1">
                <img src={LOGO_URL} className="w-full h-full object-contain" alt="Matita" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs tracking-widest uppercase">Concierge Matita</h3>
                <p className="text-[7px] text-[#c5a35d] font-bold tracking-[0.2em] uppercase">Boutique Literaria</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] scroll-smooth">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-[#0a3d31]/5 text-xs text-[#0a3d31] shadow-sm italic serif">
              "¡Hola fiera! ¿Buscás algo especial hoy? Soy el asistente de la boutique. Preguntame por stock o cómo llegar, viste."
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-[#c5a35d] text-[#0a3d31] rounded-tr-none font-bold' 
                    : 'bg-white border border-[#0a3d31]/5 rounded-tl-none text-[#0a3d31]'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 p-2">
                <div className="w-1 h-1 bg-[#c5a35d] rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-[#c5a35d] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-[#c5a35d] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-4 bg-white border-t border-[#0a3d31]/5">
            {/* Fixed: Changed handleSend to onSubmit to ensure the form submits correctly */}
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribí aquí, fiera..."
                className="w-full pl-5 pr-12 py-3 bg-[#f9f7f2] rounded-full text-xs outline-none focus:ring-1 focus:ring-[#c5a35d] text-[#0a3d31]"
              />
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-1.5 top-1.5 bg-[#0a3d31] text-white p-2 rounded-full hover:bg-[#c5a35d] transition-all disabled:opacity-10"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-[#0a3d31] text-white p-2 pr-6 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-[#c5a35d]/30"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#c5a35d] bg-white p-1 flex items-center justify-center">
            <img src={LOGO_URL} className="w-full h-full object-contain" alt="Matita" />
          </div>
          <div className="text-left">
            <p className="text-[7px] font-bold text-[#c5a35d] tracking-widest uppercase">Concierge</p>
            <p className="font-bold text-[10px]">Chatear</p>
          </div>
        </button>
      )}
    </div>
  );
};

export default AIConcierge;
