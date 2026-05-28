"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import {
  Mail, Phone, Briefcase, Award, Zap,
  Calendar, ExternalLink, User, Globe, ArrowLeft
} from 'lucide-react';

// SVG de GitHub — funciona en cualquier versión
const GithubIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// SVG de LinkedIn — funciona en cualquier versión
const LinkedinIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const [loading, setLoading]           = useState(true);
  const [isOwner, setIsOwner]           = useState(false);
  const [profile, setProfile]           = useState<any>(null);
  const [experiences, setExperiences]   = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [skills, setSkills]             = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;
      try {
        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('slug', username).single();

        if (profileData) {
          setProfile(profileData);

          // ¿Es el dueño del perfil?
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id === profileData.id) setIsOwner(true);

          const [expRes, certRes, skillsRes] = await Promise.all([
            supabase.from('experiences').select('*').eq('user_id', profileData.id).order('start_year', { ascending: false }),
            supabase.from('certificates').select('*').eq('user_id', profileData.id).order('created_at', { ascending: false }),
            supabase.from('skills').select('*').eq('user_id', profileData.id),
          ]);
          if (expRes.data)    setExperiences(expRes.data);
          if (certRes.data)   setCertificates(certRes.data);
          if (skillsRes.data) setSkills(skillsRes.data);
        }
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold animate-pulse">
      Cargando perfil profesional...
    </div>
  );
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 text-xl font-bold">
      Perfil no encontrado
    </div>
  );

  const fadeIn = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Teléfono completo con lada
  const fullPhone = profile.phone
    ? `${profile.country_code || ''}${profile.phone}`.replace(/\s+/g, '')
    : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* ── BOTÓN REGRESAR AL DASHBOARD (solo dueño) ── */}
      {isOwner && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-full shadow-lg border border-slate-200 transition"
          >
            <ArrowLeft size={16} className="text-emerald-500" />
            Volver al panel
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="bg-slate-900 pt-20 pb-32 px-6 text-center text-white relative">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Avatar */}
          <div className="w-36 h-36 md:w-40 md:h-40 mx-auto rounded-full border-4 border-emerald-500 overflow-hidden shadow-2xl mb-6 bg-slate-800 flex items-center justify-center">
            {profile.avatar_url
              ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} />
              : <span className="text-4xl text-slate-400 font-black">{profile.full_name?.charAt(0)}</span>}
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">{profile.full_name}</h1>
          <p className="text-xl text-emerald-400 font-medium mb-8">{profile.title}</p>

          {/* Links de contacto */}
          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium">
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition-colors">
                <Mail size={15} className="text-emerald-400" /> {profile.contact_email}
              </a>
            )}
            {fullPhone && (
              <a href={`https://wa.me/${fullPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition-colors">
                <Phone size={15} className="text-emerald-400" /> WhatsApp
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition-colors">
                <LinkedinIcon size={15} className="text-emerald-400" /> LinkedIn
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition-colors">
                <GithubIcon size={15} className="text-emerald-400" /> GitHub
              </a>
            )}
            {profile.other_social_url && (
              <a href={profile.other_social_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition-colors">
                <Globe size={15} className="text-emerald-400" />
                {profile.other_social_label || 'Sitio web'}
              </a>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── CONTENIDO ── */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 -mt-16 relative z-10 space-y-8">

        {/* SOBRE MÍ */}
        {profile.bio && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible"
            className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="text-emerald-500" /> Sobre mí
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </motion.div>
        )}

        {/* TRAYECTORIA */}
        {experiences.length > 0 && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible"
            className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Briefcase className="text-emerald-500" /> Trayectoria Profesional
            </h2>
            <div className="space-y-8 border-l-2 border-slate-100 ml-3 pl-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[33px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">{exp.position}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-emerald-600 font-semibold text-sm mb-3">
                    <span>{exp.company}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md">
                      <Calendar size={13} /> {exp.start_year} – {exp.end_year}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CERTIFICACIONES + HABILIDADES (2 columnas en desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {certificates.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" animate="visible"
              className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award className="text-emerald-500" /> Certificaciones
              </h2>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <a key={cert.id} href={cert.file_url} target="_blank" rel="noreferrer"
                    className="block group bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                    <div className="flex justify-between items-center">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                          {cert.name}
                        </h4>
                        <p className="text-slate-500 text-sm font-medium">{cert.issuer}</p>
                      </div>
                      <ExternalLink size={17} className="text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 ml-3" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {skills.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" animate="visible"
              className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="text-emerald-500" /> Habilidades
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s.id}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    {s.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
