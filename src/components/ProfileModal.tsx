import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Crown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INPUT_CLS = 'w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#C9A84C] transition-all';
const LABEL_CLS = 'text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block';
const ERR_CLS = 'text-xs text-red-400 mt-1';

const ROLE_CONFIG = {
  owner:   { label: 'Propietario',     icon: <Crown size={13} />,  bg: 'bg-[#C9A84C]/20', text: 'text-[#C9A84C]' },
  admin:   { label: 'Administrador',   icon: <Shield size={13} />, bg: 'bg-red-500/20',    text: 'text-red-400' },
  vendedor:{ label: 'Vendedor',        icon: <User size={13} />,   bg: 'bg-blue-500/20',   text: 'text-blue-400' },
};

export const ProfileModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [tab, setTab] = useState<'perfil' | 'password'>('perfil');

  // Perfil
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Contraseña
  const [passData, setPassData] = useState({ current: '', nueva: '', confirm: '' });
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});
  const [savingPass, setSavingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const roleConf = ROLE_CONFIG[user?.role ?? 'vendedor'];

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    if (!profileData.nombre.trim() || profileData.nombre.length < 2) errors.nombre = 'Nombre debe tener al menos 2 caracteres';
    if (!profileData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) errors.email = 'Email inválido';
    if (!profileData.telefono || profileData.telefono.replace(/\D/g, '').length < 8) errors.telefono = 'Teléfono inválido';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      await updateProfile(profileData);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileErrors({ general: err instanceof Error ? err.message : 'Error al guardar' });
    } finally {
      setSavingProfile(false);
    }
  };

  const validatePass = () => {
    const errors: Record<string, string> = {};
    if (!passData.current) errors.current = 'Ingresa tu contraseña actual';
    if (!passData.nueva || passData.nueva.length < 8) errors.nueva = 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(passData.nueva)) errors.nueva = 'Debe incluir una mayúscula';
    if (!/[0-9]/.test(passData.nueva)) errors.nueva = 'Debe incluir un número';
    if (passData.nueva !== passData.confirm) errors.confirm = 'Las contraseñas no coinciden';
    setPassErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePass()) return;
    setSavingPass(true);
    setPassSuccess(false);
    try {
      await changePassword(passData.current, passData.nueva);
      setPassSuccess(true);
      setPassData({ current: '', nueva: '', confirm: '' });
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err) {
      setPassErrors({ general: err instanceof Error ? err.message : 'Error al cambiar contraseña' });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center font-black text-[#C9A84C] text-lg">
              {user?.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{user?.nombre}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${roleConf.bg} ${roleConf.text}`}>
                {roleConf.icon} {roleConf.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={18} className="text-neutral-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'perfil', label: 'Mi Perfil', icon: <User size={15} /> },
            { id: 'password', label: 'Contraseña', icon: <Lock size={15} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'perfil' | 'password')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                tab === t.id
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            {tab === 'perfil' && (
              <motion.div key="perfil" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                {profileSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                    <CheckCircle size={16} /> Perfil actualizado correctamente
                  </div>
                )}
                {profileErrors.general && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle size={16} /> {profileErrors.general}
                  </div>
                )}

                <div>
                  <label className={LABEL_CLS}>Nombre completo</label>
                  <input
                    className={`${INPUT_CLS} ${profileErrors.nombre ? 'border-red-500/50' : ''}`}
                    value={profileData.nombre}
                    onChange={(e) => { setProfileData({ ...profileData, nombre: e.target.value }); setProfileErrors({ ...profileErrors, nombre: '' }); }}
                    placeholder="Tu nombre"
                  />
                  {profileErrors.nombre && <p className={ERR_CLS}>{profileErrors.nombre}</p>}
                </div>

                <div>
                  <label className={LABEL_CLS}>Email</label>
                  <input
                    className={`${INPUT_CLS} ${profileErrors.email ? 'border-red-500/50' : ''}`}
                    type="email"
                    value={profileData.email}
                    onChange={(e) => { setProfileData({ ...profileData, email: e.target.value }); setProfileErrors({ ...profileErrors, email: '' }); }}
                    placeholder="tu@email.com"
                  />
                  {profileErrors.email && <p className={ERR_CLS}>{profileErrors.email}</p>}
                </div>

                <div>
                  <label className={LABEL_CLS}>Teléfono</label>
                  <input
                    className={`${INPUT_CLS} ${profileErrors.telefono ? 'border-red-500/50' : ''}`}
                    value={profileData.telefono}
                    onChange={(e) => { setProfileData({ ...profileData, telefono: e.target.value }); setProfileErrors({ ...profileErrors, telefono: '' }); }}
                    placeholder="+56 9 ..."
                  />
                  {profileErrors.telefono && <p className={ERR_CLS}>{profileErrors.telefono}</p>}
                </div>

                <div className="pt-2">
                  <p className="text-xs text-neutral-600">
                    Usuario: <span className="text-neutral-400">@{user?.username}</span>
                  </p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="w-full py-3 bg-[#C9A84C] hover:bg-[#b8963d] disabled:bg-neutral-700 disabled:cursor-not-allowed text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Guardando...</>
                  ) : (
                    <><CheckCircle size={16} /> Guardar cambios</>
                  )}
                </button>
              </motion.div>
            )}

            {tab === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                {passSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                    <CheckCircle size={16} /> Contraseña actualizada correctamente
                  </div>
                )}
                {passErrors.general && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle size={16} /> {passErrors.general}
                  </div>
                )}

                <div>
                  <label className={LABEL_CLS}>Contraseña actual</label>
                  <div className="relative">
                    <input
                      className={`${INPUT_CLS} pr-10 ${passErrors.current ? 'border-red-500/50' : ''}`}
                      type={showCurrent ? 'text' : 'password'}
                      value={passData.current}
                      onChange={(e) => { setPassData({ ...passData, current: e.target.value }); setPassErrors({ ...passErrors, current: '' }); }}
                      placeholder="Tu contraseña actual"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3.5 text-neutral-500 hover:text-neutral-300">
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passErrors.current && <p className={ERR_CLS}>{passErrors.current}</p>}
                </div>

                <div>
                  <label className={LABEL_CLS}>Nueva contraseña</label>
                  <div className="relative">
                    <input
                      className={`${INPUT_CLS} pr-10 ${passErrors.nueva ? 'border-red-500/50' : ''}`}
                      type={showNew ? 'text' : 'password'}
                      value={passData.nueva}
                      onChange={(e) => { setPassData({ ...passData, nueva: e.target.value }); setPassErrors({ ...passErrors, nueva: '' }); }}
                      placeholder="Min 8 chars, mayúscula, número"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3.5 text-neutral-500 hover:text-neutral-300">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passErrors.nueva && <p className={ERR_CLS}>{passErrors.nueva}</p>}
                </div>

                <div>
                  <label className={LABEL_CLS}>Confirmar nueva contraseña</label>
                  <input
                    className={`${INPUT_CLS} ${passErrors.confirm ? 'border-red-500/50' : ''}`}
                    type="password"
                    value={passData.confirm}
                    onChange={(e) => { setPassData({ ...passData, confirm: e.target.value }); setPassErrors({ ...passErrors, confirm: '' }); }}
                    placeholder="Repite la nueva contraseña"
                  />
                  {passErrors.confirm && <p className={ERR_CLS}>{passErrors.confirm}</p>}
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={savingPass}
                  className="w-full py-3 bg-[#C9A84C] hover:bg-[#b8963d] disabled:bg-neutral-700 disabled:cursor-not-allowed text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {savingPass ? (
                    <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Cambiando...</>
                  ) : (
                    <><Lock size={16} /> Cambiar contraseña</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileModal;
