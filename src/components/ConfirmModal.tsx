import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check, Info } from 'lucide-react';

// --- INTERFAZ CORREGIDA: Incluye confirmText y cancelText ---
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string; // Soluciona el error de TypeScript
  cancelText?: string;  // Soluciona el error de TypeScript
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  type = 'danger',
  confirmText = 'Confirmar', // Valor por defecto
  cancelText = 'Cancelar'    // Valor por defecto
}) => {
  // Configuración de colores según el tipo de alerta
  const colors = {
    danger: { 
      icon: 'text-red-500', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20', 
      btn: 'bg-red-600 hover:bg-red-700 text-white',
      glow: 'shadow-red-900/20'
    },
    warning: { 
      icon: 'text-[#E8B923]', 
      bg: 'bg-[#E8B923]/10', 
      border: 'border-[#E8B923]/20', 
      btn: 'bg-[#E8B923] hover:bg-yellow-500 text-black',
      glow: 'shadow-yellow-900/20'
    },
    info: { 
      icon: 'text-blue-500', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/20', 
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      glow: 'shadow-blue-900/20'
    }
  };

  const theme = colors[type];
  const Icon = type === 'info' ? Info : AlertTriangle;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop con desenfoque */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative w-full max-w-sm bg-[#121212] border ${theme.border} rounded-3xl p-6 shadow-2xl ${theme.glow} overflow-hidden`}
          >
            {/* Brillo de fondo decorativo */}
            <div className={`absolute -top-10 -right-10 p-20 ${theme.bg} blur-[60px] rounded-full pointer-events-none opacity-50`} />

            <div className="relative z-10 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className={`mx-auto w-16 h-16 rounded-full ${theme.bg} flex items-center justify-center mb-5 border ${theme.border}`}
              >
                <Icon size={32} className={theme.icon} />
              </motion.div>

              <h3 className="text-xl font-black text-white mb-2 tracking-tight">{title}</h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed px-2">{message}</p>

              <div className="flex gap-3">
                <button 
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} /> {cancelText}
                </button>
                <button 
                  onClick={onConfirm}
                  className={`flex-1 py-3 px-4 rounded-xl ${theme.btn} text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2`}
                >
                  <Check size={16} /> {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};