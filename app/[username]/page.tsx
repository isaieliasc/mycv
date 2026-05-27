"use client";

import { useEffect, useState, use } from 'react'; 
import { supabase } from '../../lib/supabase'; 
import { motion } from 'framer-motion';
import { Mail, Phone, Briefcase, Award, Zap, Calendar, ExternalLink, User } from 'lucide-react';

export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [loading, setLoading] = useState(true);
  
  // Estados para toda la información
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;
      try {
        // 1. Obtener perfil
        const { data: profileData } = await supabase.from('profiles').select('*').eq('slug', username).single();
        
        if (profileData) {
          setProfile(profileData);
          
          // 2. Obtener el resto de los datos usando el ID del perfil en paralelo para que sea más rápido
          const [expRes, certRes, skillsRes] = await Promise.all([
            supabase.from('experiences').select('*').eq('user_id', profileData.id).order('start_year', { ascending: false }),
            supabase.from('certificates').select('*').eq('user_id', profileData.id).order('created_at', { ascending: false }),
            supabase.from('skills').select('*').eq('user_id', profileData.id)
          ]);

          if (expRes.data) setExperiences(expRes.data);
          if (certRes.data) setCertificates(certRes.data);
          if (skillsRes.data) setSkills(skillsRes.data);
        }
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Cargando perfil profesional...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 text-xl font-bold">Perfil no encontrado</div>;

  // Animaciones base
  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* === HERO SECTION === */}
      <section className="bg-slate-900 pt-20 pb-32 px-6 text-center text-white relative">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="w-40 h-40 mx-auto rounded-full border-4 border-emerald-500 overflow-hidden shadow-2xl mb-6 bg-slate-800 flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} />
            ) : (
              <span className="text-4xl text-slate-400">{profile.full_name?.charAt(0)}</span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">{profile.full_name}</h1>
          <p className="text-xl text-emerald-400 font-medium mb-8">{profile.title}</p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition-colors">
                <Mail size={16} className="text-emerald-400" /> {profile.contact_email}
              </a>
            )}
            {profile.phone && (
              <a href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full transition-colors">
                <Phone size={16} className="text-emerald-400" /> WhatsApp
              </a>
            )}
          </div>
        </motion.div>
      </section>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 space-y-10">
        
        {/* SOBRE MÍ */}
        {profile.bio && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="text-emerald-500" /> Sobre mí
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </motion.div>
        )}

        {/* TRAYECTORIA (Línea de tiempo) */}
        {experiences.length > 0 && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Briefcase className="text-emerald-500" /> Trayectoria Profesional
            </h2>
            <div className="space-y-8 border-l-2 border-slate-100 ml-3 pl-6">
              {experiences.map((exp, index) => (
                <div key={exp.id} className="relative">
                  {/* Punto en la línea de tiempo */}
                  <div className="absolute -left-[33px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></div>
                  
                  <h3 className="text-xl font-bold text-slate-800">{exp.position}</h3>
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-3">
                    <span>{exp.company}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md">
                      <Calendar size={14} /> {exp.start_year} - {exp.end_year}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* DOS COLUMNAS: CERTIFICACIONES Y HABILIDADES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* CERTIFICACIONES */}
          {certificates.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award className="text-emerald-500" /> Certificaciones
              </h2>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <a 
                    key={cert.id} 
                    href={cert.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block group bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{cert.name}</h4>
                        <p className="text-slate-500 text-sm font-medium">{cert.issuer}</p>
                      </div>
                      <ExternalLink size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* HABILIDADES */}
          {skills.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="text-emerald-500" /> Habilidades Técnicas
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span 
                    key={s.id} 
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                  >
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