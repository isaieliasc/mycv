"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Award, Zap, LogOut, Trash2, Plus, Save, Upload, Loader2, QrCode, X, Download, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // --- ESTADOS: DATOS PERSONALES ---
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Teléfono dividido en Lada y Número
  const [countryCode, setCountryCode] = useState('+52');
  const [phoneNumber, setPhoneNumber] = useState('');

  // --- ESTADOS: HABILIDADES, TRAYECTORIA, CERTIFICACIONES ---
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
  const [certFileType, setCertFileType] = useState('');

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : '';

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
      setFullName(p.full_name || ''); 
      setTitle(p.title || ''); 
      setSlug(p.slug || '');
      setContactEmail(p.contact_email || '');
      setBio(p.bio || '');
      setAvatarUrl(p.avatar_url || '');
      
      // Separar la lada del número si existe
      if (p.phone) {
        if (p.phone.startsWith('+52')) { setCountryCode('+52'); setPhoneNumber(p.phone.replace('+52', '').trim()); }
        else if (p.phone.startsWith('+1')) { setCountryCode('+1'); setPhoneNumber(p.phone.replace('+1', '').trim()); }
        else { setPhoneNumber(p.phone); } // Fallback
      }
    }
    
    const { data: s } = await supabase.from('skills').select('*').eq('user_id', id);
    if (s) setSkills(s);
    const { data: e } = await supabase.from('experiences').select('*').eq('user_id', id).order('start_year', { ascending: false });
    if (e) setExperiences(e);
    const { data: c } = await supabase.from('certificates').select('*').eq('user_id', id).order('created_at', { ascending: false });
    if (c) setCertificates(c);

    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userId) return;
    setUploadingAvatar(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const filePath = `${userId}/avatar-${Math.random()}.${fileExt}`;
    
    try {
      await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (error: any) { alert('Error subiendo foto: ' + error.message); } 
    finally { setUploadingAvatar(false); }
  };

  const handleDeleteAvatar = async () => {
    setAvatarUrl('');
    // Opcional: Agregar lógica para borrar el archivo físico del storage de Supabase aquí
  };

  const handleSavePersonal = async () => {
    if (!userId) return;
    const formattedSlug = slug.toLowerCase().replace(/\s+/g, '-');
    const fullPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : null;
    
    await supabase.from('profiles').upsert({ 
      id: userId, 
      full_name: fullName, 
      title: title,
      slug: formattedSlug,
      contact_email: contactEmail,
      phone: fullPhone,
      bio: bio,
      avatar_url: avatarUrl
    });
    setSlug(formattedSlug);
    alert('¡Datos personales actualizados!');
  };

  // --- FUNCIONES DE OTRAS SECCIONES ---
  const handleAddSkill = async (e: React.FormEvent) => { e.preventDefault(); if (!userId || !skillName.trim()) return; const { data } = await supabase.from('skills').insert([{ user_id: userId, name: skillName.trim() }]).select(); if (data) { setSkills([...skills, data[0]]); setSkillName(''); } };
  const handleDeleteSkill = async (id: string) => { await supabase.from('skills').delete().eq('id', id); setSkills(skills.filter(s => s.id !== id)); };
  const handleAddExperience = async (e: React.FormEvent) => { e.preventDefault(); if (!userId) return; const { data } = await supabase.from('experiences').insert([{ user_id: userId, company: expCompany, position: expPosition, start_year: expStart, end_year: expEnd, description: expDesc }]).select(); if (data) { setExperiences([...experiences, data[0]]); setExpCompany(''); setExpPosition(''); setExpStart(''); setExpEnd(''); setExpDesc(''); } };
  const handleDeleteExperience = async (id: string) => { await supabase.from('experiences').delete().eq('id', id); setExperiences(experiences.filter(exp => exp.id !== id)); };
  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || e.target.files.length === 0 || !userId) return; setUploading(true); const file = e.target.files[0]; const fileExt = file.name.split('.').pop()?.toLowerCase(); const filePath = `${userId}/${Math.random()}.${fileExt}`; try { await supabase.storage.from('certificates').upload(filePath, file, { upsert: true }); const { data } = supabase.storage.from('certificates').getPublicUrl(filePath); setCertFileUrl(data.publicUrl); setCertFileType(fileExt === 'pdf' ? 'pdf' : 'image'); alert('¡Documento cargado!'); } catch (error: any) { alert('Error: ' + error.message); } finally { setUploading(false); } };
  const handleAddCertificate = async (e: React.FormEvent) => { e.preventDefault(); if (!userId || !certFileUrl) return alert('Sube un archivo.'); const { data } = await supabase.from('certificates').insert([{ user_id: userId, name: certName, issuer: certIssuer, file_url: certFileUrl, file_type: certFileType }]).select(); if (data) { setCertificates([...certificates, data[0]]); setCertName(''); setCertIssuer(''); setCertFileUrl(''); setCertFileType(''); } };
  const handleDeleteCertificate = async (id: string) => { await supabase.from('certificates').delete().eq('id', id); setCertificates(certificates.filter(c => c.id !== id)); };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-gen') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR-${slug || 'perfil'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 font-bold">Cargando tu panel...</div>;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col shadow-xl z-10">
        <h1 className="text-xl font-bold text-emerald-400 mb-10 tracking-tight">MyCV Panel</h1>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'personal', icon: User, label: 'Datos Personales' },
            { id: 'experience', icon: Briefcase, label: 'Trayectoria' },
            { id: 'certificates', icon: Award, label: 'Certificaciones' },
            { id: 'skills', icon: Zap, label: 'Habilidades' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === item.id ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <button onClick={() => setShowQRModal(true)} className="flex items-center justify-center gap-2 bg-emerald-500 text-white w-full py-3 rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg">
            <QrCode size={20} /> Mi Código QR
          </button>
          <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="flex items-center justify-center gap-2 text-slate-500 w-full py-3 hover:text-white transition-colors">
            <LogOut size={20} /> Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
              <h2 className="text-3xl font-bold mb-8 capitalize text-slate-800">
                {activeTab === 'personal' ? 'Datos Personales' : activeTab === 'experience' ? 'Trayectoria Profesional' : activeTab === 'certificates' ? 'Certificaciones' : 'Habilidades Técnicas'}
              </h2>
              
              {/* === DATOS PERSONALES === */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  
                  {/* FOTO DE PERFIL */}
                  <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-md flex-shrink-0">
                      {uploadingAvatar ? (
                        <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500"/></div>
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={40}/></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-700 mb-2">Foto de Perfil</h3>
                      <div className="flex gap-3">
                        <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                          <Camera size={16}/> Cambiar foto
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                        </label>
                        {avatarUrl && (
                          <button onClick={handleDeleteAvatar} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-500 mb-2">Nombre Completo</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-2">Título Profesional</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-2">URL del perfil (Ej. isai-elias)</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium">mycv.com/</span>
                        <input className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-r-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" value={slug} onChange={(e) => setSlug(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-2">Correo de Contacto</label>
                      <input type="email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="tucorreo@gmail.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    
                    {/* SELECTOR DE CÓDIGO DE PAÍS Y TELÉFONO */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-2">WhatsApp</label>
                      <div className="flex gap-2">
                        <select 
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium text-slate-700"
                          value={countryCode} 
                          onChange={(e) => setCountryCode(e.target.value)}
                        >
                          <option value="+52">🇲🇽 +52</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+57">🇨🇴 +57</option>
                          <option value="+54">🇦🇷 +54</option>
                          <option value="+56">🇨🇱 +56</option>
                        </select>
                        <input type="tel" className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Número (Ej. 993 123...)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-500 mb-2">Sobre mí (Biografía)</label>
                      <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all h-32 resize-none" placeholder="Escribe un breve resumen de tu perfil profesional, metas o experiencia..." value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                  </div>
                  
                  <button onClick={handleSavePersonal} className="mt-4 bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
                    <Save size={20}/> Guardar Cambios
                  </button>
                </div>
              )}

              {/* === TRAYECTORIA, CERTIFICACIONES Y HABILIDADES (SE MANTIENEN IGUAL) === */}
              {activeTab === 'experience' && (
                <div className="space-y-8">
                  <form onSubmit={handleAddExperience} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Plus size={18} className="text-emerald-500"/> Nueva Experiencia</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input required className="col-span-2 md:col-span-1 p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" placeholder="Empresa" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} />
                      <input required className="col-span-2 md:col-span-1 p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" placeholder="Puesto" value={expPosition} onChange={(e) => setExpPosition(e.target.value)} />
                      <input required className="p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" placeholder="Año Inicio (Ej. 2022)" value={expStart} onChange={(e) => setExpStart(e.target.value)} />
                      <input required className="p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" placeholder="Año Fin (Ej. 2024 o Actual)" value={expEnd} onChange={(e) => setExpEnd(e.target.value)} />
                      <textarea required className="col-span-2 p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 h-24 resize-none" placeholder="Descripción de actividades..." value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold w-full md:w-auto hover:bg-slate-800 transition-colors">Añadir Trayectoria</button>
                  </form>
                  <div className="space-y-3">
                    {experiences.map(exp => (
                      <div key={exp.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start group">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">{exp.position}</h4>
                          <p className="text-emerald-600 font-medium mb-2">{exp.company} <span className="text-slate-400 font-normal text-sm ml-2">({exp.start_year} - {exp.end_year})</span></p>
                          <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                        </div>
                        <button onClick={() => handleDeleteExperience(exp.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={20} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="space-y-8">
                  <form onSubmit={handleAddCertificate} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><Plus size={18} className="text-emerald-500"/> Subir Certificado</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required className="p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" placeholder="Nombre del Certificado" value={certName} onChange={(e) => setCertName(e.target.value)} />
                      <input required className="p-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" placeholder="Institución (Ej. Udemy, Cisco)" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-white border border-slate-200 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                        {uploading ? <Loader2 size={18} className="animate-spin text-emerald-500"/> : <Upload size={18} className="text-slate-400"/>}
                        {certFileUrl ? 'Archivo Listo ✓' : 'Seleccionar PDF o Imagen'}
                        <input type="file" accept="image/*,application/pdf" onChange={handleCertificateUpload} disabled={uploading} className="hidden" />
                      </label>
                      <button type="submit" disabled={!certFileUrl} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Guardar</button>
                    </div>
                  </form>
                  <div className="space-y-3">
                    {certificates.map(cert => (
                      <div key={cert.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group">
                        <div><h4 className="font-bold text-slate-800">{cert.name}</h4><p className="text-slate-500 text-sm">{cert.issuer}</p></div>
                        <button onClick={() => handleDeleteCertificate(cert.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={20} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddSkill} className="flex gap-3">
                    <input className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Ej: Python, React, Liderazgo..." value={skillName} onChange={(e) => setSkillName(e.target.value)} />
                    <button className="bg-slate-900 text-white px-8 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2"><Plus size={20}/> Añadir</button>
                  </form>
                  <div className="flex flex-wrap gap-3">
                    {skills.map(s => (
                      <motion.div whileHover={{ scale: 1.05 }} key={s.id} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 shadow-md shadow-blue-600/20">
                        {s.name} <button onClick={() => handleDeleteSkill(s.id)} className="text-blue-300 hover:text-white transition-colors"><Trash2 size={16} /></button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* === MODAL DEL CÓDIGO QR === */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center border border-slate-100">
              <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"><X size={24} /></button>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Tu Código QR</h3>
              <p className="text-slate-500 text-sm mb-6">Escanea para ir a tu perfil profesional</p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block mb-6">
                {slug ? <QRCodeCanvas id="qr-gen" value={profileUrl} size={200} bgColor={"#f8fafc"} fgColor={"#0f172a"} level={"H"} includeMargin={false} /> : <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400 text-sm p-4 text-center">Configura tu URL en "Datos Personales" primero</div>}
              </div>
              <button onClick={downloadQR} disabled={!slug} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"><Download size={18} /> Descargar PNG</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}