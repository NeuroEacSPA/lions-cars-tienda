import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, User, Crown } from 'lucide-react';
import { COLOR_PALETTE } from '../config/theme';
import { motion, AnimatePresence } from 'framer-motion';

export const UserMenu: React.FC<{ onAdminClick?: () => void }> = ({ onAdminClick }) => {
  const { user, logout, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-400 transition-all"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
             style={{ backgroundColor: COLOR_PALETTE.primary.gold, color: '#000' }}>
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
            className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden min-w-48"
          >
            {/* User Info */}
            <div className="p-3 border-b" style={{ borderColor: COLOR_PALETTE.gray[200] }}>
              <p className="font-bold" style={{ color: COLOR_PALETTE.gray[900] }}>
                {user.nombre}
              </p>
              <p className="text-sm" style={{ color: COLOR_PALETTE.gray[500] }}>
                {user.email}
              </p>
              {isAdmin && (
                <div className="mt-1 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit"
                     style={{ backgroundColor: COLOR_PALETTE.primary.light, color: COLOR_PALETTE.primary.gold }}>
                  <Crown size={14} />
                  Administrador
                </div>
              )}
              {user.role === 'vendedor' && (
                <div className="mt-1 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit"
                     style={{ backgroundColor: '#DFF2BF', color: '#4F8A10' }}>
                  <User size={14} />
                  Vendedor
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setShowMenu(false);
                  // Navegar a perfil
                }}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <User size={18} style={{ color: COLOR_PALETTE.gray[600] }} />
                <span style={{ color: COLOR_PALETTE.gray[700] }}>Mi perfil</span>
              </button>

              {(isAdmin || user.role === 'vendedor') && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onAdminClick?.();
                  }}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={18} style={{ color: COLOR_PALETTE.gray[600] }} />
                  <span style={{ color: COLOR_PALETTE.gray[700] }}>Panel {isAdmin ? 'de Admin' : 'de Vendedor'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
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
  );
};

export default UserMenu;
