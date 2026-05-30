"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Phone, Briefcase, Award, Zap, Calendar, ExternalLink, User, Globe, ArrowLeft, MessageCircle, FileText, Languages } from 'lucide-react';

const GithubIcon = ({ size = 16, className = '' }) => (<svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>);
const LinkedinIcon = ({ size = 16, className = '' }) => (<svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);

// Función para mapear el nivel de texto a un porcentaje de barra
const getLanguagePercentage = (level: string) => {
  if (level.includes('Básico') || level.includes('A1')) return 35;
  if (level.includes('Intermedio') || level.includes('B1')) return 65;
  if (level.includes('Avanzado') || level.includes('C1')) return 85;
  if (level.includes('Nativo') || level.includes('C2')) return 100;
  return 50;
};

export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]); // Estado de idiomas
  const [waForm, setWaForm] = useState({ name: '', subject: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('slug', username).single();
        if (profileData) {
          setProfile(profileData);
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id === profileData.id) setIsOwner(true);

          const [expRes, certRes, skillsRes, langRes] = await Promise.all([
            supabase.from('experiences').select('*').eq('user_id', profileData.id).order('start_year', { ascending: false }),
            supabase.from('certificates').select('*').eq('user_id', profileData.id).order('created_at', { ascending: false }),
            supabase.from('skills').select('*').eq('user_id', profileData.id),
            supabase.from('languages').select('*').eq('user_id', profileData.id),
          ]);
          if (expRes.data)    setExperiences(expRes.data);
          if (certRes.data)   setCertificates(certRes.data);
          if (skillsRes.data) setSkills(skillsRes.data);
          if (langRes.data)   setLanguages(langRes.data);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold animate-pulse">Cargando perfil profesional...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 text-xl font-bold">Perfil no encontrado</div>;

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const fullPhone = profile.phone ? `${profile.country_code || ''}${profile.phone}`.replace(/\s+/g, '') : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {isOwner && (
        <div className="fixed top-4 left-4 z-50">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-full shadow-lg border border-slate-200 transition">
            <ArrowLeft size={16} className="text-emerald-500" /> Volver al panel
          </button>
        </div>
      )}

      {/* ── HERO Y PORTADA SE MANTIENEN INTACTOS ── */}
      <section className="relative">
        <div className="w-full overflow-hidden relative" style={{ height: 'clamp(160px, 30vw, 280px)' }}>
          {profile.cover_url ? <img src={profile.cover_url} alt="Portada" className="w-full h-full object-cover object-center" /> : <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative bg-white rounded-3xl shadow-xl border border-slate-100 mt-4 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-end">
              <div className="w-32 h-40 md:w-40 md:h-48 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 -mt-24 md:-mt-28">
                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} /> : <span className="text-5xl font-black text-slate-300">{profile.full_name?.charAt(0)}</span>}
              </div>
              <div className="flex-1 text-center sm:text-left pb-1">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{profile.full_name}</h1>
                <p className="text-base md:text-lg text-emerald-600 font-semibold mt-1">{profile.title}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-5 pt-5 border-t border-slate-100 text-sm font-medium">
              {profile.contact_email && (<a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-4 py-2 rounded-full transition-colors"><Mail size={14} className="text-emerald-500" /> {profile.contact_email}</a>)}
              {fullPhone && (<a href={`https://wa.me/${fullPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-4 py-2 rounded-full transition-colors"><Phone size={14} className="text-emerald-500" /> WhatsApp</a>)}
              {profile.linkedin && (<a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-4 py-2 rounded-full transition-colors"><LinkedinIcon size={14} className="text-emerald-500" /> LinkedIn</a>)}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 md:px-6 mt-6 space-y-8">
        
        {/* SOBRE MÍ */}
        {profile.bio && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="text-emerald-500" /> Sobre mí</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </motion.div>
        )}

        {/* TRAYECTORIA */}
        {experiences.length > 0 && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2"><Briefcase className="text-emerald-500" /> Trayectoria Profesional</h2>
            <div className="space-y-8 border-l-2 border-slate-100 ml-3 pl-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[33px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">{exp.position}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-emerald-600 font-semibold text-sm mb-3">
                    <span>{exp.company}</span><span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md"><Calendar size={13} /> {exp.start_year} – {exp.end_year}</span>
                  </div>
                  {exp.description && (<p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>)}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SECCIÓN DOBLE: IDIOMAS Y HABILIDADES ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* IDIOMAS (NUEVO) */}
          {languages.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Languages className="text-emerald-500" /> Idiomas
              </h2>
              <div className="space-y-5">
                {languages.map((lang) => {
                  const percentage = getLanguagePercentage(lang.level);
                  return (
                    <div key={lang.id} className="w-full">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-slate-800">{lang.name}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{lang.level}</span>
                      </div>
                      {/* Barra de progreso visual */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${percentage}%` }} 
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-emerald-500 h-2.5 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* HABILIDADES TÉCNICAS */}
          {skills.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="text-emerald-500" /> Habilidades
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s.id} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    {s.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* BOTÓN VER CV */}
        {profile.cv_url && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <a href={profile.cv_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-4 rounded-3xl shadow-sm border border-slate-800 transition text-base">
              <FileText size={20} className="text-emerald-400" /> Ver CV completo
            </a>
          </motion.div>
        )}

      {/* MENSAJE RÁPIDO WHATSAPP */}
      {profile.phone && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible"
            className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800">
            <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-1">Mensaje rápido</p>
            <h2 className="text-2xl font-black text-white mb-2">Escribeme un mensaje</h2>
            <p className="text-slate-400 text-sm mb-6">Llena los campos y se abrirá WhatsApp con un mensaje listo para enviar.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Tu nombre"
                  value={waForm.name}
                  onChange={e => setWaForm({ ...waForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Asunto</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Ej. Desarrollo de API, portafolio, landing page..."
                  value={waForm.subject}
                  onChange={e => setWaForm({ ...waForm, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mensaje</label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition resize-none"
                  placeholder="Cuéntame brevemente qué necesitas..."
                  value={waForm.message}
                  onChange={e => setWaForm({ ...waForm, message: e.target.value })}
                />
              </div>
              <a
                href={(() => {
                  const phone = `${profile.country_code || ''}${profile.phone}`.replace(/\D/g, '');
                  const text = encodeURIComponent(
                    `Hola ${profile.full_name}, soy ${waForm.name}.\n\n*Asunto:* ${waForm.subject}\n\n${waForm.message}`
                  );
                  return `https://wa.me/${phone}?text=${text}`;
                })()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-500/20 text-sm"
              >
                <MessageCircle size={18} /> Enviar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Columna 1 — Info personal */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center flex-shrink-0 border-2 border-slate-700">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} />
                    : <span className="text-xl font-black text-slate-400">{profile.full_name?.charAt(0)}</span>}
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight">{profile.full_name}
                    <span className="text-emerald-500">.</span>
                  </h3>
                  <p className="text-slate-400 text-xs">{profile.title}</p>
                </div>
              </div>

            </div>

            {/* Columna 2 — Contacto */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4">Contacto</h4>
              <div className="space-y-3">
                {profile.contact_email && (
                  <a href={`mailto:${profile.contact_email}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition">
                    <Mail size={14} className="text-emerald-500 flex-shrink-0" /> {profile.contact_email}
                  </a>
                )}
                {profile.phone && (
                  <a href={`https://wa.me/${(`${profile.country_code || ''}${profile.phone}`).replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition">
                    <Phone size={14} className="text-emerald-500 flex-shrink-0" />
                    {profile.country_code} {profile.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Columna 3 — Redes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4">Redes</h4>
              <div className="flex gap-3">
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition border border-slate-700 hover:border-emerald-500">
                    <LinkedinIcon size={18} />
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition border border-slate-700 hover:border-emerald-500">
                    <GithubIcon size={18} />
                  </a>
                )}
                {profile.phone && (
                  <a href={`https://wa.me/${(`${profile.country_code || ''}${profile.phone}`).replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-green-500 flex items-center justify-center transition border border-slate-700 hover:border-green-500">
                    <MessageCircle size={18} />
                  </a>
                )}
                {profile.other_social_url && (
                  <a href={profile.other_social_url} target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition border border-slate-700 hover:border-emerald-500">
                    <Globe size={18} />
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Línea inferior */}
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} {profile.full_name}. Todos los derechos reservados.</span>
            <span className="flex items-center gap-1">
              Hecho con <span className="text-emerald-500 font-bold">CVerso</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
