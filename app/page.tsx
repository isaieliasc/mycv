import { ArrowRight, QrCode, Layout, Share2, Sparkles, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020817] flex flex-col font-sans overflow-x-hidden">

      {/* Fondo animado con gradientes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-[100px]" />
        {/* Grid de puntos */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* NAVBAR */}
      <header className="relative z-10 w-full px-6 py-5 flex justify-between items-center border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <QrCode size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">My<span className="text-emerald-400">CV</span></span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-slate-400 text-sm font-medium hover:text-white transition-colors duration-200">
            Iniciar sesión
          </a>
          <a href="/login" className="bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center gap-1.5">
            Empezar gratis <ChevronRight size={14} />
          </a>
        </div>
      </header>

      {/* HERO */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 py-24">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
          <Sparkles size={12} />
          La forma más inteligente de compartir tu CV
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 max-w-4xl tracking-tight leading-tight">
          Tu CV que se comparte en{' '}
          <span className="relative inline-block">
            <span className="text-emerald-400">segundos</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 8.5C60 3 140 1 298 8.5" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
          Crea tu perfil profesional, obtén un código QR único y destaca ante las mejores empresas al instante.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <a href="/login" className="group bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-emerald-400 transition-all duration-300 shadow-2xl shadow-emerald-500/30 flex items-center gap-2 hover:scale-105 hover:shadow-emerald-500/50">
            Crear perfil gratis
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        
    
        </div>

        {/* Tarjeta de ejemplo */}
        <div className="mt-20 relative max-w-sm w-full">
          {/* Glow detrás */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-3xl scale-90" />
          <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md text-left hover:-translate-y-2 transition-transform duration-500 group">
            {/* Header tarjeta */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex-shrink-0 shadow-lg" />
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Especialista Financiero</h3>
                <p className="text-emerald-400 text-sm font-medium mt-0.5">Experto en Impuestos & SAT</p>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  ))}
                  <span className="text-slate-500 text-xs ml-1">5.0</span>
                </div>
              </div>
            </div>
            {/* Tags */}
            <div className="flex gap-2 flex-wrap mb-5">
              {['Auditoría', 'NIF', 'CONTPAQi', 'SAT'].map(tag => (
                <span key={tag} className="bg-white/5 border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-lg font-medium">
                  {tag}
                </span>
              ))}
            </div>
            {/* QR mini */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-slate-500 text-xs">mycv.app/juanperez</span>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <QrCode size={22} className="text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 flex gap-12 text-center">
          {[['2,400+', 'Perfiles creados'], ['98%', 'Satisfacción'], ['3 seg', 'Para compartir']].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-white">{num}</p>
              <p className="text-slate-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* CÓMO FUNCIONA */}
      <section className="relative z-10 py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3">Proceso simple</p>
            <h2 className="text-4xl font-bold text-white">¿Cómo funciona?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Layout, color: 'blue', num: '01', title: 'Crea tu perfil', desc: 'Llena tus datos, experiencia y habilidades en nuestro editor visual premium.', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', text: 'text-blue-400' },
              { icon: QrCode, color: 'emerald', num: '02', title: 'Obtén tu QR', desc: 'Generamos automáticamente un código único y permanente para tu perfil.', bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
              { icon: Share2, color: 'violet', num: '03', title: 'Comparte y destaca', desc: 'Las empresas escanean tu QR y ven tu perfil optimizado para móviles.', bg: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/20', text: 'text-violet-400' },
            ].map(({ icon: Icon, num, title, desc, bg, border, text }) => (
              <div key={num} className={`relative bg-gradient-to-br ${bg} border ${border} rounded-2xl p-7 group hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 border ${border} flex items-center justify-center`}>
                    <Icon size={22} className={text} />
                  </div>
                  <span className={`text-4xl font-black ${text} opacity-20`}>{num}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-emerald-500/10 to-blue-600/10 border border-white/10 rounded-3xl p-12">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl blur-xl" />
            <div className="relative">
              <h2 className="text-4xl font-extrabold text-white mb-4">Empieza hoy, gratis</h2>
              <p className="text-slate-400 mb-8">Sin tarjeta de crédito. Sin complicaciones.</p>
              <a href="/login" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:scale-105">
                Crear mi perfil gratis <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <QrCode size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">My<span className="text-emerald-400">CV</span></span>
          </div>
          <div className="flex gap-6">
            {['LinkedIn', 'Twitter', 'Soporte'].map(link => (
              <a key={link} href="#" className="text-slate-500 text-sm hover:text-white transition-colors">{link}</a>
            ))}
          </div>
          <p className="text-slate-600 text-xs">© 2026 MyCV. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}