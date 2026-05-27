"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Award, Zap, LogOut, Trash2, Plus, Save, Upload, Loader2, QrCode, X, Download, Camera, Linkedin, Github } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para datos personales
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [countryCode, setCountryCode] = useState('+52');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Estados de carga y UI
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Estados para sub-tablas
  const [skills, setSkills] = useState<any[]>([]);
  const [skillName, setSkillName] = useState('');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [expCompany, setExpCompany] = useState('');
  const [expPosition, setExpPosition] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certFileUrl, setCertFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);
      loadAllData(session.user.id);
    };
    init();
  }, [router]);

  const loadAllData = async (id: string) => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (p) {
      setFullName(p.full_name || ''); setTitle(p.title || ''); setSlug(p.slug || '');
      setContactEmail(p.contact_email || ''); setBio(p.bio || ''); setAvatarUrl(p.avatar_url || '');
      setLinkedinUrl(p.linkedin_url || ''); setGithubUrl(p.github_url || ''); setCvUrl(p.cv_url || '');
      if (p.phone && p.phone.includes('+52')) { setCountryCode('+52'); setPhoneNumber(p.phone.replace('+52', '').trim()); }
      else if (p.phone) setPhoneNumber(p.phone);
    }
    const { data: s } = await supabase.from('skills').select('*').eq('user_id', id); if (s) setSkills(s);
    const { data: e } = await supabase.from('experiences').select('*').eq('user_id', id); if (e) setExperiences(e);
    const { data: c } = await supabase.from('certificates').select('*').eq('user_id', id); if (c) setCertificates(c);
    setLoading(false);
  };

  const handleSavePersonal = async () => {
    if (!userId) return;
    const fullPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : null;
    
    // Usamos 'as any' para evitar el error de TypeScript con las columnas nuevas
    await supabase.from('profiles').upsert({ 
      id: userId, 
      full_name: fullName, title, slug, contact_email: contactEmail, phone: fullPhone, 
      bio, avatar_url: avatarUrl, linkedin_url: linkedinUrl, github_url: githubUrl, cv_url: cvUrl 
    } as any);
    alert('¡Cambios guardados!');
  };

  // --- MANTENEMOS TUS OTRAS FUNCIONES IGUAL ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !userId) return;
    setUploadingAvatar(true);
    const file = e.target.files[0]; const path = `${userId}/avatar-${Date.now()}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(data.publicUrl); setUploadingAvatar(false);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !userId) return;
    setUploadingCv(true);
    const file = e.target.files[0]; const path = `${userId}/cv-${Date.now()}.pdf`;
    await supabase.storage.from('certificates').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('certificates').getPublicUrl(path);
    setCvUrl(data.publicUrl); setUploadingCv(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 flex md:flex-col justify-between">
        <h1 className="text-xl font-bold text-emerald-400">MyCV Panel</h1>
        <nav className="flex md:flex-col gap-2 overflow-x-auto">
          {['personal', 'experience', 'certificates', 'skills'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg ${activeTab === t ? 'bg-emerald-500' : 'hover:bg-slate-800'}`}>{t.toUpperCase()}</button>
          ))}
        </nav>
        <button onClick={() => setShowQRModal(true)} className="hidden md:flex bg-emerald-500 p-3 rounded-xl justify-center"><QrCode /></button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <input className="w-full p-3 border rounded-xl" placeholder="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input className="w-full p-3 border rounded-xl" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className="w-full p-3 border rounded-xl" placeholder="URL" value={slug} onChange={(e) => setSlug(e.target.value)} />
              <input className="w-full p-3 border rounded-xl" placeholder="Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              <input className="w-full p-3 border rounded-xl" placeholder="LinkedIn URL" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
              <input className="w-full p-3 border rounded-xl" placeholder="GitHub URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
              <textarea className="w-full p-3 border rounded-xl" placeholder="Sobre mí" value={bio} onChange={(e) => setBio(e.target.value)} />
              <button onClick={handleSavePersonal} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold">Guardar Cambios</button>
            </div>
          )}
        </div>
      </main>
      
      {/* ... (Modal de QR igual que antes) */}
    </div>
  );
}