"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, QrCode, Layout, Share2, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  // Función para navegación dinámica sin botones estáticos
  const navigateToLogin = () => router.push('/login');

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col font-sans overflow-x-hidden text-slate-100">

      {/* Fondo animado */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <header className="relative z-20 w-full px-6 py-5 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <QrCode size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">My<span className="text-emerald-400">CV</span></span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={navigateToLogin}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
        >
          Acceso profesional
        </motion.button>
      </header>

      {/* HERO */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <Sparkles size={12} /> Avalado por profesionales de TI y Finanzas
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 max-w-4xl tracking-tight leading-tight">
          Destaca ante las empresas <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">con una identidad digital única</span>
        </h1>

        <p className="text-lg text-slate-400 mb-12 max-w-xl">
          Transforma tu trayectoria en una experiencia interactiva que los reclutadores no podrán ignorar.
        </p>

        {/* BOTÓN DINÁMICO (Sin estática) */}
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 25px rgba(16, 185, 129, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={navigateToLogin}
          className="relative group bg-emerald-500 text-white px-10 py-5 rounded-full font-bold text-lg transition-all"
        >
          <span className="flex items-center gap-2">
            Empezar a destacar ahora <ArrowRight size={20} />
          </span>
        </motion.button>

        {/* NUEVA SECCIÓN: CONFIANZA */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
           {['Reclutadores Senior', 'Empresas Fortune 500', 'Agencias de Reclutamiento', 'Headhunters'].map(trust => (
             <div key={trust} className="flex flex-col items-center gap-2">
               <CheckCircle2 size={24} className="text-emerald-500" />
               <span className="text-xs font-bold uppercase tracking-widest">{trust}</span>
             </div>
           ))}
        </div>
      </main>

      {/* Sección de "Confianza Técnica" */}
      <section className="relative z-10 py-24 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-900/50 border border-white/10 p-10 rounded-3xl backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-8 text-center">¿Por qué las grandes empresas prefieren este formato?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: 'Velocidad de Lectura', desc: 'Tu información clave es capturada en menos de 10 segundos.' },
                { title: 'Verificación Instantánea', desc: 'La integración de QR elimina la duda sobre la autenticidad.' },
                { title: 'Estética Profesional', desc: 'Diseño limpio que refleja orden y capacidad de síntesis.' },
                { title: 'Acceso Universal', desc: 'Optimizado para cualquier dispositivo, desde móvil hasta escritorio.' }
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-400">✓</div>
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ... (Tu sección de "Cómo funciona" y footer se mantienen igual) ... */}
    </div>
  );
}