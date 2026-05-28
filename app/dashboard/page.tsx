"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, Award, Zap, LogOut, Trash2, Plus, Save,
  Menu, X, Upload, Eye, QrCode, Globe,
  Phone, Mail, Calendar, ChevronDown, ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
// ── Ladas por país (las más comunes) ──────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+52', country: 'México 🇲🇽' },
  { code: '+1',  country: 'EE.UU / Canadá 🇺🇸' },
  { code: '+54', country: 'Argentina 🇦🇷' },
  { code: '+55', country: 'Brasil 🇧🇷' },
  { code: '+56', country: 'Chile 🇨🇱' },
  { code: '+57', country: 'Colombia 🇨🇴' },
  { code: '+34', country: 'España 🇪🇸' },
  { code: '+593', country: 'Ecuador 🇪🇨' },
  { code: '+502', country: 'Guatemala 🇬🇹' },
  { code: '+504', country: 'Honduras 🇭🇳' },
  { code: '+52',  country: 'México 🇲🇽' },
  { code: '+505', country: 'Nicaragua 🇳🇮' },
  { code: '+507', country: 'Panamá 🇵🇦' },
  { code: '+595', country: 'Paraguay 🇵🇾' },
  { code: '+51',  country: 'Perú 🇵🇪' },
  { code: '+1787', country: 'Puerto Rico 🇵🇷' },
  { code: '+598', country: 'Uruguay 🇺🇾' },
  { code: '+58',  country: 'Venezuela 🇻🇪' },
];

// ── Skills sugeridas por área ─────────────────────────────────────────────
const SUGGESTED_SKILLS: Record<string, string[]> = {
  'Ingeniería / TI':    ['Python', 'JavaScript', 'React', 'SQL', 'Docker', 'Git', 'TypeScript', 'Node.js'],
  'Diseño':             ['Figma', 'Adobe XD', 'Illustrator', 'Photoshop', 'Canva', 'Prototipado', 'UX Research'],
  'Administración':     ['Excel avanzado', 'Power BI', 'SAP', 'Gestión de proyectos', 'Liderazgo', 'Presupuesto'],
  'Marketing':          ['SEO', 'Google Ads', 'Meta Ads', 'Email Marketing', 'Copywriting', 'Analítica web'],
  'Contabilidad':       ['Contabilidad general', 'Declaraciones fiscales', 'CFDI', 'QuickBooks', 'Auditoría'],
  'Medicina / Salud':   ['Diagnóstico clínico', 'Urgencias', 'Farmacología', 'Expediente electrónico', 'BLS / ACLS'],
  'Derecho':            ['Derecho laboral', 'Contratos', 'Litigio', 'Amparo', 'Derecho corporativo'],
  'Educación':          ['Didáctica', 'Evaluación educativa', 'Moodle', 'Classroom', 'Diseño curricular'],
  'Idiomas':            ['Inglés B2', 'Inglés C1', 'Francés', 'Alemán', 'Portugués', 'Mandarín'],
  'Soft skills':        ['Trabajo en equipo', 'Comunicación efectiva', 'Resolución de problemas', 'Adaptabilidad'],
};

// ─────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab]   = useState('personal');
  const [userId, setUserId]         = useState<string | null>(null);
  const [userSlug, setUserSlug]     = useState<string>('');
  const [loading, setLoading]       = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [savedMsg, setSavedMsg]     = useState('');

  // ── Personal ────────────────────────────────────────────────────────────
  const [personal, setPersonal] = useState({
    fullName: '', title: '', bio: '',
    contactEmail: '', countryCode: '+52', phone: '',
    linkedin: '', github: '',
    otherSocialLabel: '', otherSocialUrl: '',
  });

  // ── Experiencia ─────────────────────────────────────────────────────────
  const [experiences, setExperiences] = useState<any[]>([]);
  const [newExp, setNewExp] = useState({
    company: '', position: '', start_year: '', end_year: '', description: '', current: false,
  });

  // ── Certificados ────────────────────────────────────────────────────────
  const [certificates, setCertificates] = useState<any[]>([]);
  const [newCert, setNewCert] = useState({ name: '', issuer: '' });
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const certInputRef = useRef<HTMLInputElement>(null);

  // ── Skills ──────────────────────────────────────────────────────────────
  const [skills, setSkills]           = useState<any[]>([]);
  const [skillName, setSkillName]     = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // ── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);
      await loadAllData(session.user.id);
    };
    init();
  }, [router]);

  const loadAllData = async (id: string) => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (p) {
      setPersonal({
        fullName:        p.full_name        || '',
        title:           p.title            || '',
        bio:             p.bio              || '',
        contactEmail:    p.contact_email    || '',
        countryCode:     p.country_code     || '+52',
        phone:           p.phone            || '',
        linkedin:        p.linkedin         || '',
        github:          p.github           || '',
        otherSocialLabel: p.other_social_label || '',
        otherSocialUrl:   p.other_social_url   || '',
      });
      setUserSlug(p.slug || '');
    }
    const [expRes, certRes, skillsRes] = await Promise.all([
      supabase.from('experiences').select('*').eq('user_id', id).order('start_year', { ascending: false }),
      supabase.from('certificates').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('skills').select('*').eq('user_id', id),
    ]);
    if (expRes.data)    setExperiences(expRes.data);
    if (certRes.data)   setCertificates(certRes.data);
    if (skillsRes.data) setSkills(skillsRes.data);
    setLoading(false);
  };

  // ── Helpers UI ───────────────────────────────────────────────────────────
  const showSaved = (msg = '¡Guardado!') => {
    setSavedMsg(msg); setSaving(false);
    setTimeout(() => setSavedMsg(''), 2500);
  };

  // ── Guardar personal ─────────────────────────────────────────────────────
  const handleSavePersonal = async () => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('profiles').upsert({
      id:                 userId,
      full_name:          personal.fullName,
      title:              personal.title,
      bio:                personal.bio,
      contact_email:      personal.contactEmail,
      country_code:       personal.countryCode,
      phone:              personal.phone,
      linkedin:           personal.linkedin,
      github:             personal.github,
      other_social_label: personal.otherSocialLabel,
      other_social_url:   personal.otherSocialUrl,
    });
    showSaved();
  };

  // ── Experiencia ──────────────────────────────────────────────────────────
  const handleAddExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newExp.company || !newExp.position) return;
    const { data, error } = await supabase.from('experiences').insert([{
      user_id:     userId,
      company:     newExp.company,
      position:    newExp.position,
      start_year:  newExp.start_year,
      end_year:    newExp.current ? 'Presente' : newExp.end_year,
      description: newExp.description,
    }]).select();
    if (data) {
      setExperiences([data[0], ...experiences]);
      setNewExp({ company: '', position: '', start_year: '', end_year: '', description: '', current: false });
    }
  };

  const handleDeleteExp = async (id: string) => {
    await supabase.from('experiences').delete().eq('id', id);
    setExperiences(experiences.filter(e => e.id !== id));
  };

  // ── Certificados ─────────────────────────────────────────────────────────
  const handleUploadCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !certFile || !newCert.name) return;
    setUploadingCert(true);
    const ext  = certFile.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('certificates').upload(path, certFile);
    if (upErr) { setUploadingCert(false); alert('Error al subir archivo'); return; }
    const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(path);
    const { data, error } = await supabase.from('certificates').insert([{
      user_id:  userId,
      name:     newCert.name,
      issuer:   newCert.issuer,
      file_url: urlData.publicUrl,
      file_type: certFile.type,
    }]).select();
    if (data) {
      setCertificates([data[0], ...certificates]);
      setNewCert({ name: '', issuer: '' });
      setCertFile(null);
      if (certInputRef.current) certInputRef.current.value = '';
    }
    setUploadingCert(false);
  };

  const handleDeleteCert = async (id: string, file_url: string) => {
    await supabase.from('certificates').delete().eq('id', id);
    setCertificates(certificates.filter(c => c.id !== id));
  };

  // ── Skills ───────────────────────────────────────────────────────────────
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !skillName.trim()) return;
    const exists = skills.some(s => s.name.toLowerCase() === skillName.trim().toLowerCase());
    if (exists) return;
    const { data } = await supabase.from('skills').insert([{ user_id: userId, name: skillName.trim() }]).select();
    if (data) { setSkills([...skills, data[0]]); setSkillName(''); }
  };

  const handleAddSuggestedSkill = async (name: string) => {
    if (!userId) return;
    const exists = skills.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    const { data } = await supabase.from('skills').insert([{ user_id: userId, name }]).select();
    if (data) setSkills([...skills, data[0]]);
  };

  const handleDeleteSkill = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id);
    setSkills(skills.filter(s => s.id !== id));
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-slate-500 font-semibold animate-pulse">Cargando panel...</div>
    </div>
  );

  // ── Tabs config ──────────────────────────────────────────────────────────
  const tabs = [
    { id: 'personal',     icon: User,     label: 'Datos Personales' },
    { id: 'experience',   icon: Briefcase, label: 'Trayectoria' },
    { id: 'certificates', icon: Award,    label: 'Certificaciones' },
    { id: 'skills',       icon: Zap,      label: 'Habilidades' },
  ];

  // ── Input helpers ────────────────────────────────────────────────────────
  const inputClass = "w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-400 focus:outline-none transition text-sm";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-100 text-gray-900 overflow-hidden">

      {/* ── SIDEBAR ── */}
      {/* Overlay mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-30
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-black text-emerald-400 tracking-tight">CVerso</h1>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full p-3.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === item.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        {/* QR + Ver perfil + Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {userSlug && (
            <>
              <a
                href={`/${userSlug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 hover:text-white transition"
              >
                <Eye size={16} className="text-emerald-400" /> Ver mi perfil
              </a>
              <a
                href={`/${userSlug}?qr=1`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 w-full p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm text-white font-semibold transition"
              >
                <QrCode size={16} /> Generar QR
              </a>
            </>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-3 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-red-400 text-sm transition"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center gap-4 px-5 py-4 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600 hover:text-slate-900">
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-black text-emerald-500">CVerso</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10"
            >
              {/* Header sección */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                {savedMsg && (
                  <span className="text-emerald-600 text-sm font-semibold bg-emerald-50 px-4 py-2 rounded-full">
                    {savedMsg}
                  </span>
                )}
              </div>

              {/* ══ PERSONAL ══════════════════════════════════════════════════ */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nombre completo</label>
                      <input className={inputClass} placeholder="Juan Pérez" value={personal.fullName}
                        onChange={e => setPersonal({ ...personal, fullName: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Título profesional</label>
                      <input className={inputClass} placeholder="Diseñador UX / Ing. en Software" value={personal.title}
                        onChange={e => setPersonal({ ...personal, title: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Sobre mí / Bio</label>
                    <textarea className={`${inputClass} resize-none`} rows={4}
                      placeholder="Breve descripción de quién eres y qué haces..."
                      value={personal.bio}
                      onChange={e => setPersonal({ ...personal, bio: e.target.value })} />
                  </div>

                  <div>
                    <label className={labelClass}>Correo electrónico de contacto</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input className={`${inputClass} pl-10`} type="email" placeholder="tu@email.com"
                        value={personal.contactEmail}
                        onChange={e => setPersonal({ ...personal, contactEmail: e.target.value })} />
                    </div>
                  </div>

                  {/* Teléfono con lada */}
                  <div>
                    <label className={labelClass}>Teléfono / WhatsApp</label>
                    <div className="flex gap-2">
                      <select
                        className={`${inputClass} w-auto max-w-[180px] pr-8 bg-slate-50 cursor-pointer`}
                        value={personal.countryCode}
                        onChange={e => setPersonal({ ...personal, countryCode: e.target.value })}
                      >
                        {COUNTRY_CODES.map((c, i) => (
                          <option key={i} value={c.code}>{c.country} {c.code}</option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input className={`${inputClass} pl-10`} type="tel" placeholder="5512345678"
                          value={personal.phone}
                          onChange={e => setPersonal({ ...personal, phone: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className={labelClass}>LinkedIn</label>
                    <div className="relative">
                      <LinkedinIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input className={`${inputClass} pl-10`} placeholder="https://linkedin.com/in/tu-perfil"
                        value={personal.linkedin}
                        onChange={e => setPersonal({ ...personal, linkedin: e.target.value })} />
                    </div>
                  </div>

                  {/* GitHub */}
                  <div>
                    <label className={labelClass}>GitHub</label>
                    <div className="relative">
                      <GithubIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input className={`${inputClass} pl-10`} placeholder="https://github.com/tu-usuario"
                        value={personal.github}
                        onChange={e => setPersonal({ ...personal, github: e.target.value })} />
                    </div>
                  </div>

                  {/* Otra red social */}
                  <div>
                    <label className={labelClass}>Otra red social (opcional)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className={inputClass} placeholder="Nombre (ej: Portafolio, Behance...)"
                        value={personal.otherSocialLabel}
                        onChange={e => setPersonal({ ...personal, otherSocialLabel: e.target.value })} />
                      <div className="relative">
                        <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input className={`${inputClass} pl-10`} placeholder="https://..."
                          value={personal.otherSocialUrl}
                          onChange={e => setPersonal({ ...personal, otherSocialUrl: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSavePersonal}
                    disabled={saving}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
                  >
                    <Save size={18} /> {saving ? 'Guardando...' : 'Guardar datos'}
                  </button>
                </div>
              )}

              {/* ══ EXPERIENCIA ═══════════════════════════════════════════════ */}
              {activeTab === 'experience' && (
                <div className="space-y-8">
                  {/* Formulario agregar */}
                  <form onSubmit={handleAddExp} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-700 text-sm mb-2">➕ Agregar experiencia</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Empresa *</label>
                        <input required className={inputClass} placeholder="Google, BBVA, Freelance..."
                          value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Cargo / Puesto *</label>
                        <input required className={inputClass} placeholder="Desarrollador Frontend"
                          value={newExp.position} onChange={e => setNewExp({ ...newExp, position: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Fecha inicio</label>
                        <input type="month" className={inputClass}
                          value={newExp.start_year} onChange={e => setNewExp({ ...newExp, start_year: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Fecha fin</label>
                        <input type="month" className={inputClass} disabled={newExp.current}
                          value={newExp.end_year} onChange={e => setNewExp({ ...newExp, end_year: e.target.value })} />
                        <label className="flex items-center gap-2 mt-2 text-xs text-slate-500 cursor-pointer select-none">
                          <input type="checkbox" checked={newExp.current}
                            onChange={e => setNewExp({ ...newExp, current: e.target.checked, end_year: '' })} />
                          Trabajo actualmente aquí
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Descripción breve (opcional)</label>
                      <textarea className={`${inputClass} resize-none`} rows={3}
                        placeholder="¿Qué hacías en este rol?"
                        value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} />
                    </div>
                    <button type="submit"
                      className="bg-slate-900 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm transition">
                      <Plus size={16} /> Agregar experiencia
                    </button>
                  </form>

                  {/* Lista */}
                  {experiences.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-8">Aún no has agregado experiencia laboral.</p>
                  )}
                  <div className="space-y-4">
                    {experiences.map(exp => (
                      <div key={exp.id} className="flex gap-4 items-start bg-white border border-slate-200 rounded-2xl p-5">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{exp.position}</p>
                          <p className="text-emerald-600 text-sm font-semibold">{exp.company}</p>
                          <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                            <Calendar size={12} /> {exp.start_year} – {exp.end_year}
                          </p>
                          {exp.description && <p className="text-slate-600 text-sm mt-2">{exp.description}</p>}
                        </div>
                        <button onClick={() => handleDeleteExp(exp.id)} className="text-slate-300 hover:text-red-400 transition mt-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ CERTIFICADOS ══════════════════════════════════════════════ */}
              {activeTab === 'certificates' && (
                <div className="space-y-8">
                  <form onSubmit={handleUploadCert} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-700 text-sm mb-2">➕ Subir certificado</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Nombre del certificado *</label>
                        <input required className={inputClass} placeholder="Ej: AWS Solutions Architect"
                          value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Institución / Emisor</label>
                        <input className={inputClass} placeholder="Ej: Amazon, Coursera, UNAM..."
                          value={newCert.issuer} onChange={e => setNewCert({ ...newCert, issuer: e.target.value })} />
                      </div>
                    </div>

                    {/* Zona de carga */}
                    <div>
                      <label className={labelClass}>Archivo (PDF o imagen) *</label>
                      <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition
                        ${certFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-300 hover:bg-slate-100'}`}>
                        <Upload size={28} className={certFile ? 'text-emerald-500' : 'text-slate-400'} />
                        <span className="text-sm text-slate-600 text-center">
                          {certFile
                            ? <><strong className="text-emerald-700">{certFile.name}</strong><br /><span className="text-xs text-slate-400">{(certFile.size / 1024).toFixed(1)} KB</span></>
                            : <><strong>Haz clic para seleccionar</strong><br /><span className="text-xs text-slate-400">PDF, JPG o PNG — máx 10 MB</span></>}
                        </span>
                        <input ref={certInputRef} type="file" accept=".pdf,image/*" className="hidden"
                          onChange={e => setCertFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>

                    <button type="submit" disabled={uploadingCert || !certFile}
                      className="bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm transition">
                      <Upload size={16} /> {uploadingCert ? 'Subiendo...' : 'Subir certificado'}
                    </button>
                  </form>

                  {/* Lista */}
                  {certificates.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-8">Aún no has subido certificados.</p>
                  )}
                  <div className="space-y-3">
                    {certificates.map(cert => (
                      <div key={cert.id} className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Award size={20} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{cert.name}</p>
                          <p className="text-slate-400 text-xs">{cert.issuer}</p>
                        </div>
                        <a href={cert.file_url} target="_blank" rel="noreferrer"
                          className="text-slate-400 hover:text-emerald-500 transition flex-shrink-0">
                          <ExternalLink size={16} />
                        </a>
                        <button onClick={() => handleDeleteCert(cert.id, cert.file_url)}
                          className="text-slate-300 hover:text-red-400 transition flex-shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ SKILLS ════════════════════════════════════════════════════ */}
              {activeTab === 'skills' && (
                <div className="space-y-8">
                  {/* Agregar manual */}
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input className={`${inputClass} flex-1`} placeholder="Escribe una habilidad y presiona +"
                      value={skillName} onChange={e => setSkillName(e.target.value)} />
                    <button type="submit"
                      className="bg-slate-900 text-white px-5 rounded-xl hover:bg-slate-700 transition flex items-center gap-1 text-sm font-bold">
                      <Plus size={18} />
                    </button>
                  </form>

                  {/* Skills actuales */}
                  {skills.length > 0 && (
                    <div>
                      <p className={labelClass}>Tus habilidades</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skills.map(s => (
                          <div key={s.id}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
                            {s.name}
                            <button onClick={() => handleDeleteSkill(s.id)}
                              className="opacity-60 hover:opacity-100 transition">
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sugerencias por categoría */}
                  <div>
                    <p className={labelClass}>Sugerencias por área</p>
                    <div className="space-y-2 mt-2">
                      {Object.entries(SUGGESTED_SKILLS).map(([category, items]) => (
                        <div key={category} className="border border-slate-200 rounded-2xl overflow-hidden">
                          <button
                            onClick={() => setOpenCategory(openCategory === category ? null : category)}
                            className="flex items-center justify-between w-full p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            {category}
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${openCategory === category ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {openCategory === category && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 flex flex-wrap gap-2">
                                  {items.map(item => {
                                    const added = skills.some(s => s.name.toLowerCase() === item.toLowerCase());
                                    return (
                                      <button
                                        key={item}
                                        onClick={() => handleAddSuggestedSkill(item)}
                                        disabled={added}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition
                                          ${added
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 cursor-default'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                      >
                                        {added ? '✓ ' : '+ '}{item}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
