import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, User, Crown, Shield } from 'lucide-react';
import { COLOR_PALETTE } from '../config/theme';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileModal } from './ProfileModal';

export const UserMenu: React.FC<{ onAdminClick?: () => void }> = ({ onAdminClick }) => {
  const { user, logout, isAdmin, isOwner } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  const RoleBadge = () => {
    if (isOwner) return (
      <div className="mt-1 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit bg-[#C9A84C]/20 text-[#C9A84C]">
        <Crown size={12} /> Propietario
      </div>
    );
    if (isAdmin) return (
      <div className="mt-1 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit" style={{ backgroundColor: COLOR_PALETTE.primary.light, color: COLOR_PALETTE.primary.gold }}>
        <Shield size={12} /> Administrador
      </div>
    );
    return (
      <div className="mt-1 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit" style={{ backgroundColor: '#DFF2BF', color: '#4F8A10' }}>
        <User size={12} /> Vendedor
      </div>
    );
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-400 transition-all"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-black"
               style={{ backgroundColor: COLOR_PALETTE.primary.gold }}>
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block" style={{ color: COLOR_PALETTE.gray[700] }}>
            {user.nombre}
          </span>
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden min-w-52 z-50"
            >
              {/* User Info */}
              <div className="p-3 border-b" style={{ borderColor: COLOR_PALETTE.gray[200] }}>
                <p className="font-bold" style={{ color: COLOR_PALETTE.gray[900] }}>{user.nombre}</p>
                <p className="text-sm" style={{ color: COLOR_PALETTE.gray[500] }}>{user.email}</p>
                <RoleBadge />
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => { setShowMenu(false); setShowProfile(true); }}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <User size={18} style={{ color: COLOR_PALETTE.gray[600] }} />
                  <span style={{ color: COLOR_PALETTE.gray[700] }}>Mi perfil</span>
                </button>

                {(isAdmin || user.role === 'vendedor') && (
                  <button
                    onClick={() => { setShowMenu(false); onAdminClick?.(); }}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={18} style={{ color: COLOR_PALETTE.gray[600] }} />
                    <span style={{ color: COLOR_PALETTE.gray[700] }}>
                      Panel {isOwner ? 'de Propietario' : isAdmin ? 'de Admin' : 'de Vendedor'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => { logout(); setShowMenu(false); }}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} style={{ color: COLOR_PALETTE.status.danger }} />
                  <span style={{ color: COLOR_PALETTE.status.danger }}>Cerrar sesión</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      </AnimatePresence>
    </>
  );
};

export default UserMenu;
