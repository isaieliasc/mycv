"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, Award, Zap, LogOut, Trash2, Plus, Save,
  Menu, X, Upload, Eye, QrCode, Globe,
  Phone, Mail, Calendar, ChevronDown, ExternalLink, Copy, Check, Download, ZoomIn, ZoomOut, FileText, Languages
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { supabase } from '../../lib/supabase';

const GithubIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

async function getCroppedBlob(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    croppedAreaPixels.x, croppedAreaPixels.y,
    croppedAreaPixels.width, croppedAreaPixels.height,
    0, 0,
    croppedAreaPixels.width, croppedAreaPixels.height,
  );
  return new Promise(res => canvas.toBlob(blob => res(blob!), 'image/png'));
}

const COUNTRY_CODES = [
  { code: '+52', country: 'México 🇲🇽' },
  { code: '+1', country: 'EE.UU / Canadá 🇺🇸' },
  { code: '+54', country: 'Argentina 🇦🇷' },
  { code: '+55', country: 'Brasil 🇧🇷' },
  { code: '+56', country: 'Chile 🇨🇱' },
  { code: '+57', country: 'Colombia 🇨🇴' },
  { code: '+34', country: 'España 🇪🇸' },
];

const POPULAR_SKILLS = [
  'Resolución de problemas', 'Trabajo en equipo', 'Liderazgo',
  'Comunicación efectiva', 'Gestión de proyectos', 'Excel Avanzado',
  'Análisis de datos', 'Adaptabilidad', 'Pensamiento crítico',
  'Innovación', 'Atención al cliente', 'Inteligencia emocional',
  'Desarrollo de software', 'Gestión financiera', 'Diseño estratégico',
  'Negociación', 'Marketing digital', 'Auditoría'
];

const LANGUAGE_LEVELS = ['Básico (A1-A2)', 'Intermedio (B1-B2)', 'Avanzado (C1)', 'Nativo / Bilingüe (C2)'];

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userSlug, setUserSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // ── Personal ────────────────────────────────────────────────────────────
  const [personal, setPersonal] = useState({
    fullName: '', title: '', bio: '', contactEmail: '', countryCode: '+52', phone: '', linkedin: '', github: '', otherSocialLabel: '', otherSocialUrl: '',
  });

  const [experiences, setExperiences] = useState<any[]>([]);
  const [newExp, setNewExp] = useState({ company: '', position: '', start_year: '', end_year: '', description: '', current: false });
  const [certificates, setCertificates] = useState<any[]>([]);
  const [newCert, setNewCert] = useState({ name: '', issuer: '' });
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const certInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [cvUrl, setCvUrl] = useState<string>('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [skillName, setSkillName] = useState('');
  const [languages, setLanguages] = useState<any[]>([]);
  const [newLangName, setNewLangName] = useState('');
  const [newLangLevel, setNewLangLevel] = useState(LANGUAGE_LEVELS[0]);

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
        fullName: p.full_name || '', title: p.title || '', bio: p.bio || '', contactEmail: p.contact_email || '', countryCode: p.country_code || '+52', phone: p.phone || '', linkedin: p.linkedin || '', github: p.github || '', otherSocialLabel: p.other_social_label || '', otherSocialUrl: p.other_social_url || '',
      });
      setUserSlug(p.slug || '');
      if (p.avatar_url) { setAvatarUrl(p.avatar_url); setAvatarPreview(p.avatar_url); }
      if (p.cover_url) { setCoverUrl(p.cover_url); setCoverPreview(p.cover_url); }
      if (p.cv_url) { setCvUrl(p.cv_url); }
    }
    const [expRes, certRes, skillsRes, langRes] = await Promise.all([
      supabase.from('experiences').select('*').eq('user_id', id).order('start_year', { ascending: false }),
      supabase.from('certificates').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('skills').select('*').eq('user_id', id),
      supabase.from('languages').select('*').eq('user_id', id)
    ]);
    if (expRes.data) setExperiences(expRes.data);
    if (certRes.data) setCertificates(certRes.data);
    if (skillsRes.data) setSkills(skillsRes.data);
    if (langRes.data) setLanguages(langRes.data);
    setLoading(false);
  };

  const handleOpenQr = async () => {
    if (!userSlug) return;
    const url = `${window.location.origin}/${userSlug}`;
    const QRCode = (await import('qrcode')).default;
    const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } });
    setQrDataUrl(dataUrl);
    setShowQrModal(true);
  };

  const handleSaveGalleryOrDownload = async () => {
    if (!qrDataUrl) return;

    try {
      // Convertimos la imagen base64 a un archivo físico en memoria
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `qr-${userSlug}.png`, { type: 'image/png' });

      // Verificamos si el dispositivo soporta el menú nativo de compartir (Móviles)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Mi Código QR',
          text: 'Aquí está mi código QR profesional.',
          files: [file],
        });
      } else {
        // Fallback: Descarga clásica si está en PC de escritorio
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `qr-${userSlug}.png`;
        a.click();
      }
    } catch (error) {
      console.error('Interrupción al intentar guardar/compartir:', error);
      // Fallback de seguridad en caso de cancelación o error
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = `qr-${userSlug}.png`;
      a.click();
    }
  };

  const handleCopyLink = () => {
    if (!userSlug) return;
    const url = `${window.location.origin}/${userSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setCropSrc(ev.target?.result as string); setCrop({ x: 0, y: 0 }); setZoom(1); setShowCropper(true); };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const onCropComplete = useCallback((_: any, pixels: any) => { setCroppedAreaPixels(pixels); }, []);

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels || !cropSrc || !userId) return;
    setShowCropper(false);
    setUploadingAvatar(true);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
      setAvatarPreview(URL.createObjectURL(blob));
      const path = `${userId}/avatar.png`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/png' });
      if (upErr) { alert('Error al subir la foto'); setUploadingAvatar(false); return; }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').upsert({ id: userId, avatar_url: publicUrl });
      setAvatarUrl(publicUrl);
    } catch { alert('Error al procesar la imagen'); }
    setUploadingAvatar(false);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    const reader = new FileReader();
    reader.onload = ev => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploadingCover(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/cover.${ext}`;
    const { error: upErr } = await supabase.storage.from("covers").upload(path, file, { upsert: true });
    if (upErr) { setUploadingCover(false); alert("Error al subir la portada"); return; }
    const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").upsert({ id: userId, cover_url: publicUrl });
    setCoverUrl(publicUrl);
    setUploadingCover(false);
  };

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingCv(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/cv_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("cvs").upload(path, file, { upsert: true });
    if (upErr) { setUploadingCv(false); alert("Error al subir el CV"); return; }
    const { data: urlData } = supabase.storage.from("cvs").getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").upsert({ id: userId, cv_url: publicUrl });
    setCvUrl(publicUrl);
    setUploadingCv(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  };

  const handleSavePersonal = async () => {
    if (!userId) return;
    if (!personal.fullName.trim()) { alert('Por favor escribe tu nombre completo.'); return; }
    setSaving(true);

    let slug = userSlug;
    if (!slug && personal.fullName.trim()) {
      const base = generateSlug(personal.fullName);
      const { data: existing } = await supabase.from('profiles').select('slug').eq('slug', base).maybeSingle();
      slug = existing ? `${base}-${userId.slice(0, 4)}` : base;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId, full_name: personal.fullName, title: personal.title, bio: personal.bio, contact_email: personal.contactEmail, country_code: personal.countryCode, phone: personal.phone, linkedin: personal.linkedin, github: personal.github, other_social_label: personal.otherSocialLabel, other_social_url: personal.otherSocialUrl, cv_url: cvUrl, slug,
    });

    if (error) { setSaving(false); alert(`Error al guardar: ${error.message}`); return; }

    if (slug) setUserSlug(slug);
    setSaving(false);
    setSavedMsg('¡Guardado con éxito! ✓');
    setTimeout(() => setSavedMsg(''), 2500);
    setShowSuccessModal(true); // Modal inteligente de éxito tras guardar general
  };

  const handleAddExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newExp.company || !newExp.position) return;
    const { data } = await supabase.from('experiences').insert([{ user_id: userId, company: newExp.company, position: newExp.position, start_year: newExp.start_year, end_year: newExp.current ? 'Presente' : newExp.end_year, description: newExp.description }]).select();
    if (data) { setExperiences([data[0], ...experiences]); setNewExp({ company: '', position: '', start_year: '', end_year: '', description: '', current: false }); }
  };

  const handleDeleteExp = async (id: string) => { await supabase.from('experiences').delete().eq('id', id); setExperiences(experiences.filter(e => e.id !== id)); };

  const handleUploadCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !certFile || !newCert.name) return;
    setUploadingCert(true);
    const ext = certFile.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('certificates').upload(path, certFile);
    if (upErr) { setUploadingCert(false); alert('Error al subir archivo'); return; }
    const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(path);
    const { data } = await supabase.from('certificates').insert([{ user_id: userId, name: newCert.name, issuer: newCert.issuer, file_url: urlData.publicUrl, file_type: certFile.type }]).select();
    if (data) { setCertificates([data[0], ...certificates]); setNewCert({ name: '', issuer: '' }); setCertFile(null); if (certInputRef.current) certInputRef.current.value = ''; }
    setUploadingCert(false);
  };

  const handleDeleteCert = async (id: string) => { await supabase.from('certificates').delete().eq('id', id); setCertificates(certificates.filter(c => c.id !== id)); };

  // ── Handlers de Habilidades (con .select() para tiempo real) ──
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !skillName.trim()) return;
    const exists = skills.some(s => s.name.toLowerCase() === skillName.trim().toLowerCase());
    if (exists) return;

    const { data, error } = await supabase
      .from('skills')
      .insert([{ user_id: userId, name: skillName.trim() }])
      .select();

    if (error) { alert(`Falla al guardar la habilidad: ${error.message}`); return; }
    if (data && data.length > 0) { setSkills([...skills, data[0]]); setSkillName(''); }
  };

  const handleAddSuggestedSkill = async (name: string) => {
    if (!userId) return;
    const exists = skills.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) return;

    const { data, error } = await supabase
      .from('skills')
      .insert([{ user_id: userId, name }])
      .select();

    if (error) { alert(`Falla al guardar la sugerencia: ${error.message}`); return; }
    if (data && data.length > 0) { setSkills([...skills, data[0]]); }
  };

  const handleDeleteSkill = async (id: string) => { await supabase.from('skills').delete().eq('id', id); setSkills(skills.filter(s => s.id !== id)); };

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newLangName.trim()) return;
    const { data, error } = await supabase.from('languages').insert([{ user_id: userId, name: newLangName.trim(), level: newLangLevel }]).select();
    if (error) { alert(`Falla en el sistema: ${error.message}`); return; }
    if (data) { setLanguages([...languages, data[0]]); setNewLangName(''); setNewLangLevel(LANGUAGE_LEVELS[0]); }
  };

  const handleDeleteLanguage = async (id: string) => { await supabase.from('languages').delete().eq('id', id); setLanguages(languages.filter(l => l.id !== id)); };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-slate-500 font-semibold animate-pulse">Cargando tu panel unificado...</div>
    </div>
  );

  const inputClass = "w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-400 focus:outline-none transition text-sm text-gray-900";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <>
      <div className="flex h-screen bg-slate-100 text-gray-900 overflow-hidden">

        {/* Overlay mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* ASIDE SÓLO PARA ACCIONES GLOBALES (SIN PESTAÑAS) */}
        <aside className={`fixed lg:static top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-30 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h1 className="text-xl font-black text-emerald-400 tracking-tight">CVerso</h1>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>

          {/* Espacio informativo */}
          <div className="flex-1 p-6 space-y-4 text-xs text-slate-400 border-b border-slate-800 overflow-y-auto">
            <p className="font-bold text-slate-200 text-sm mb-2">💡 Vista Única Activa</p>
            <p>Hemos organizado todos tus módulos en una sola pantalla continua. Desliza hacia abajo para rellenar toda tu información profesional sin perderte de nada.</p>
            <p>Al finalizar, presiona el botón "Guardar todos mis datos profesionales" al final para actualizar tu CV público al instante.</p>
          </div>

          <div className="p-4 space-y-2">
            {userSlug && (
              <>
                <a href={`/${userSlug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 hover:text-white transition"><Eye size={16} className="text-emerald-400" /> Ver mi perfil público</a>
                <button onClick={handleOpenQr} className="flex items-center gap-2 w-full p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm text-white font-semibold transition"><QrCode size={16} /> Generar QR</button>
                <button onClick={handleCopyLink} className={`flex items-center gap-2 w-full p-3 rounded-xl text-sm font-semibold transition ${copied ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'}`}>{copied ? <><Check size={16} className="text-emerald-400" /> ¡Link copiado!</> : <><Copy size={16} className="text-slate-400" /> Copiar mi link</>}</button>
              </>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 w-full p-3 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-red-400 text-sm transition"><LogOut size={16} /> Cerrar sesión</button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA CON SCROLL GLOBAL Y VISTA UNIFICADA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="lg:hidden flex items-center gap-4 px-5 py-4 bg-white border-b border-slate-200 shadow-sm">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600 hover:text-slate-900"><Menu size={22} /></button>
            <h1 className="text-lg font-black text-emerald-500">CVerso</h1>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 max-w-4xl mx-auto w-full">

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 space-y-12">

              {/* ══ MÓDULO 1: DATOS PERSONALES ══ */}
              <div className="border-b border-slate-100 pb-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <User className="text-emerald-500" size={24} />
                  <h2 className="text-xl font-black text-slate-900">1. Datos Personales y de Contacto</h2>
                </div>

                {/* Portada */}
                <div>
                  <label className={labelClass}>Foto de portada</label>
                  <label className="cursor-pointer block relative group">
                    <div className="w-full h-36 md:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-emerald-900 border-2 border-slate-200 relative">
                      {coverPreview ? <img src={coverPreview} alt="Portada" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400"><Upload size={24} /><span className="text-xs font-medium">Sube tu imagen de portada horizontal</span></div>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-2xl">
                        <span className="text-white text-sm font-bold flex items-center gap-2"><Upload size={16} /> {uploadingCover ? 'Subiendo...' : 'Cambiar portada'}</span>
                      </div>
                    </div>
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} disabled={uploadingCover} />
                  </label>
                </div>

                {/* Avatar */}
                <div>
                  <label className={labelClass}>Foto de perfil profesional</label>
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-28 rounded-2xl border-4 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 relative">
                      {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-slate-300" />}
                    </div>
                    <label className="cursor-pointer flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                      <Upload size={15} /> {uploadingAvatar ? 'Subiendo...' : 'Elegir foto'}
                      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Nombre completo</label><input className={inputClass} placeholder="Ej: Juan Pérez" value={personal.fullName} onChange={e => setPersonal({ ...personal, fullName: e.target.value })} /></div>
                  <div><label className={labelClass}>Título profesional</label><input className={inputClass} placeholder="Ej: Ingeniero de Software / Contador Público" value={personal.title} onChange={e => setPersonal({ ...personal, title: e.target.value })} /></div>
                </div>

                <div><label className={labelClass}>Sobre mí / Resumen Profesional</label><textarea className={`${inputClass} resize-none`} rows={4} placeholder="Describe brevemente tus mayores fortalezas y competencias..." value={personal.bio} onChange={e => setPersonal({ ...personal, bio: e.target.value })} /></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Correo electrónico de contacto</label><input className={inputClass} type="email" placeholder="ejemplo@correo.com" value={personal.contactEmail} onChange={e => setPersonal({ ...personal, contactEmail: e.target.value })} /></div>
                  <div>
                    <label className={labelClass}>Teléfono / WhatsApp</label>
                    <div className="flex gap-2">
                      <select className={`${inputClass} w-auto pr-8 bg-slate-50 cursor-pointer`} value={personal.countryCode} onChange={e => setPersonal({ ...personal, countryCode: e.target.value })}>{COUNTRY_CODES.map((c, i) => (<option key={i} value={c.code}>{c.country} {c.code}</option>))}</select>
                      <input className={inputClass} type="tel" placeholder="9931234567" value={personal.phone} onChange={e => setPersonal({ ...personal, phone: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Enlace de LinkedIn</label><input className={inputClass} placeholder="https://linkedin.com/in/tu-perfil" value={personal.linkedin} onChange={e => setPersonal({ ...personal, linkedin: e.target.value })} /></div>
                  <div><label className={labelClass}>Enlace de GitHub</label><input className={inputClass} placeholder="https://github.com/tu-usuario" value={personal.github} onChange={e => setPersonal({ ...personal, github: e.target.value })} /></div>
                </div>

                {/* Currículum Vitae PDF */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className={labelClass}>Currículum Vitae Oficial (PDF)</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Sube tu archivo PDF definitivo para que reclutadores o directores puedan guardarlo directamente.</p>
                      {cvUrl && (<a href={cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline mt-2"><FileText size={14} /> Ver documento actual cargado</a>)}
                    </div>
                    <label className="cursor-pointer bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2 shrink-0">{uploadingCv ? 'Subiendo...' : 'Subir archivo PDF'}<input ref={cvInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleCvChange} disabled={uploadingCv} /></label>
                  </div>
                </div>
              </div>

              {/* ══ MÓDULO 2: TRAYECTORIA PROFESIONAL ══ */}
              <div className="border-b border-slate-100 pb-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <Briefcase className="text-emerald-500" size={24} />
                  <h2 className="text-xl font-black text-slate-900">2. Trayectoria Laboral y Experiencia</h2>
                </div>

                <form onSubmit={handleAddExp} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Compañía / Organización *</label><input required className={inputClass} placeholder="Ej: Despacho Contable / Empresa TI" value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} /></div>
                    <div><label className={labelClass}>Cargo / Puesto desempeñado *</label><input required className={inputClass} placeholder="Ej: Auxiliar Contable / Desarrollador Web" value={newExp.position} onChange={e => setNewExp({ ...newExp, position: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Fecha de inicio</label><input type="month" className={inputClass} value={newExp.start_year} onChange={e => setNewExp({ ...newExp, start_year: e.target.value })} /></div>
                    <div>
                      <label className={labelClass}>Fecha de término</label>
                      <input type="month" className={inputClass} disabled={newExp.current} value={newExp.end_year} onChange={e => setNewExp({ ...newExp, end_year: e.target.value })} />
                      <label className="flex items-center gap-2 mt-2 text-xs text-slate-500 cursor-pointer select-none"><input type="checkbox" checked={newExp.current} onChange={e => setNewExp({ ...newExp, current: e.target.checked, end_year: '' })} /> Actualmente ejerzo este cargo aquí</label>
                    </div>
                  </div>
                  <div><label className={labelClass}>Actividades y aportaciones relevantes</label><textarea className={inputClass} rows={3} placeholder="Describe tus proyectos o responsabilidades clave..." value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} /></div>
                  <button type="submit" className="bg-slate-900 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm transition"><Plus size={16} /> Insertar experiencia</button>
                </form>

                <div className="space-y-4">
                  {experiences.map(exp => (
                    <div key={exp.id} className="flex gap-4 items-start bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-base">{exp.position}</p>
                        <p className="text-emerald-600 text-sm font-semibold">{exp.company}</p>
                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1"><Calendar size={12} /> {exp.start_year} – {exp.end_year}</p>
                        {exp.description && <p className="text-slate-600 text-sm mt-2">{exp.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteExp(exp.id)} className="text-slate-300 hover:text-red-400 transition mt-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ══ MÓDULO 3: CERTIFICACIONES ══ */}
              <div className="border-b border-slate-100 pb-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <Award className="text-emerald-500" size={24} />
                  <h2 className="text-xl font-black text-slate-900">3. Certificaciones Académicas e Institucionales</h2>
                </div>

                <form onSubmit={handleUploadCert} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Nombre de la certificación *</label><input required className={inputClass} placeholder="Ej: TOEFL ITP / Certificación SAT" value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} /></div>
                    <div><label className={labelClass}>Institución emisora</label><input className={inputClass} placeholder="Ej: Educational Testing Service / IMCP" value={newCert.issuer} onChange={e => setNewCert({ ...newCert, issuer: e.target.value })} /></div>
                  </div>
                  <div>
                    <label className={labelClass}>Comprobante digital (PDF o Imagen) *</label>
                    <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition ${certFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-300 hover:bg-slate-100'}`}>
                      <Upload size={28} className={certFile ? 'text-emerald-500' : 'text-slate-400'} />
                      <span className="text-sm text-slate-600 text-center">{certFile ? <><strong className="text-emerald-700">{certFile.name}</strong></> : <strong>Haz clic para seleccionar archivo vinculante</strong>}</span>
                      <input ref={certInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => setCertFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <button type="submit" disabled={uploadingCert || !certFile} className="bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm transition"><Upload size={16} /> {uploadingCert ? 'Subiendo...' : 'Registrar certificación'}</button>
                </form>

                <div className="space-y-3">
                  {certificates.map(cert => (
                    <div key={cert.id} className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0"><Award size={20} className="text-emerald-500" /></div>
                      <div className="flex-1 min-w-0"><p className="font-bold text-slate-900 truncate">{cert.name}</p><p className="text-slate-400 text-xs">{cert.issuer}</p></div>
                      <a href={cert.file_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-500 transition flex-shrink-0"><ExternalLink size={16} /></a>
                      <button onClick={() => handleDeleteCert(cert.id)} className="text-slate-300 hover:text-red-400 transition flex-shrink-0"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ══ MÓDULO 4: HABILIDADES TÉCNICAS Y COMPETENCIAS ══ */}
              <div className="border-b border-slate-100 pb-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <Zap className="text-emerald-500" size={24} />
                  <h2 className="text-xl font-black text-slate-900">4. Habilidades y Competencias</h2>
                </div>

                {/* Formulario para agregar manualmente */}
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    placeholder="Escribe una habilidad a mano (Ej: AutoCAD, Python, NIF)..."
                    value={skillName}
                    onChange={e => setSkillName(e.target.value)}
                  />
                  <button type="submit" className="bg-slate-900 text-white px-5 rounded-xl hover:bg-slate-700 transition flex items-center shrink-0">
                    <Plus size={18} />
                  </button>
                </form>

                {/* Nube de etiquetas (Sugerencias dinámicas) */}
                <div>
                  <label className={labelClass}>Sugerencias populares (Haz clic para agregar)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {POPULAR_SKILLS.map(skill => {
                      const added = skills.some(s => s.name.toLowerCase() === skill.toLowerCase());
                      if (added) return null;

                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleAddSuggestedSkill(skill)}
                          className="px-4 py-2 rounded-full text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                        >
                          + {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contenedor de habilidades agregadas por el usuario */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 min-h-[120px]">
                  <label className={labelClass}>Tus habilidades actuales</label>
                  {skills.length === 0 ? (
                    <p className="text-slate-400 text-sm mt-3 italic">Aún no has agregado habilidades. Selecciona una de arriba o escríbela manualmente.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.map(s => (
                        <div key={s.id} className="bg-slate-900 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-md">
                          {s.name}
                          <button type="button" onClick={() => handleDeleteSkill(s.id)} className="opacity-60 hover:opacity-100 hover:text-red-400 transition ml-1">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ══ MÓDULO 5: IDIOMAS ══ */}
              <div className="pb-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <Languages className="text-emerald-500" size={24} />
                  <h2 className="text-xl font-black text-slate-900">5. Competencias Lingüísticas</h2>
                </div>

                <form onSubmit={handleAddLanguage} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Idioma *</label>
                      <input required className={inputClass} placeholder="Ej: Inglés, Alemán, Francés..." value={newLangName} onChange={e => setNewLangName(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Nivel certificado *</label>
                      <select className={`${inputClass} cursor-pointer`} value={newLangLevel} onChange={e => setNewLangLevel(e.target.value)}>
                        {LANGUAGE_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="bg-slate-900 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm transition"><Plus size={16} /> Guardar idioma</button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {languages.map(lang => (
                    <div key={lang.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm relative group">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{lang.name}</h4>
                        <p className="text-sm font-semibold text-slate-500">{lang.level}</p>
                      </div>
                      <button onClick={() => handleDeleteLanguage(lang.id)} className="text-slate-300 hover:text-red-400 transition"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTÓN MAESTRO DE ACCIÓN INTEGRAL */}
              <div className="pt-6 border-t border-slate-100 flex items-center gap-4 flex-wrap">
                <button onClick={handleSavePersonal} disabled={saving} className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-lg transition shadow-lg ${saving ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'}`}>
                  <Save size={20} /> {saving ? 'Sincronizando base de datos...' : 'Guardar todos mis datos profesionales'}
                </button>
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* ── MODAL DE NOTIFICACIÓN DE ÉXITO INTELIGENTE ── */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">¡Tu perfil se ha guardado correctamente!</h3>
              <p className="text-slate-500 text-sm mb-6">Tu identidad digital está lista para llamar la atención de las mejores empresas y personas importantes. Tu CV profesional ya es accesible de forma global.</p>

              {/* Indicación de ruta pública */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 text-xs text-slate-600 font-mono break-all text-left">
                <strong className="block text-slate-400 mb-1 font-sans">Enlace de tu perfil:</strong>
                {`${window.location.origin}/${userSlug}`}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <a href={`/${userSlug}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition shadow-md"><Eye size={16} /> Ver mi perfil público</a>
                <button onClick={() => { setShowSuccessModal(false); handleOpenQr(); }} className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition"><QrCode size={16} /> Generar mi código QR</button>
                <button onClick={() => { handleCopyLink(); }} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"><Copy size={16} /> Copiar el enlace directo</button>
                <button onClick={() => setShowSuccessModal(false)} className="text-slate-400 hover:text-slate-600 text-sm mt-2 transition">Seguir editando</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALES ADICIONALES (RECORTAR Y QR ORIGINALES) ── */}
      <AnimatePresence>
        {showCropper && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between"><h3 className="text-lg font-black text-slate-900">Ajustar foto de perfil</h3><button onClick={() => setShowCropper(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button></div>
              <div className="relative w-full bg-slate-900" style={{ height: 320 }}><Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={3 / 4} cropShape="rect" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} /></div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100"><div className="flex items-center gap-3"><ZoomOut size={16} className="text-slate-400 flex-shrink-0" /><input type="range" min={1} max={3} step={0.05} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1 accent-emerald-500 cursor-pointer" /><ZoomIn size={16} className="text-slate-400 flex-shrink-0" /></div></div>
              <div className="flex gap-3 p-5 border-t border-slate-100"><button onClick={() => setShowCropper(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Cancelar</button><button onClick={handleCropConfirm} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg">Confirmar foto</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQrModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQrModal(false)}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Tu código QR</h3>
              <p className="text-slate-400 text-sm mb-6">Escanéalo para ver tu perfil o descárgalo para imprimirlo</p>
              {qrDataUrl && (<div className="flex justify-center mb-6"><img src={qrDataUrl} alt="QR de perfil" className="w-56 h-56 rounded-2xl border-4 border-slate-100 shadow-md" /></div>)}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 text-sm text-slate-500 font-mono break-all">{typeof window !== 'undefined' ? `${window.location.origin}/${userSlug}` : ''}</div>
              <div className="flex flex-col gap-2">
                <button onClick={handleSaveGalleryOrDownload} className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition shadow-md">
                  <Download size={18} /> Guardar en Galería / Descargar
                </button>
                <p className="text-[10px] text-slate-400 mt-1 text-center leading-tight">
                  En móvil, selecciona "Guardar imagen" en el menú que aparecerá, o mantén presionada la imagen arriba.
                </p>
                <button onClick={handleCopyLink} className={`flex items-center justify-center gap-2 w-full font-bold py-3 rounded-xl ${copied ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100'}`}>{copied ? <><Check size={18} /> ¡Copiado!</> : <><Copy size={18} /> Copiar link</>}</button>
                <button onClick={() => setShowQrModal(false)} className="text-slate-400 text-sm py-2">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}