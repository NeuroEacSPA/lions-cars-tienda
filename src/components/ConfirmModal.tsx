import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: { icon: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: 'text-[#E8B923]', bg: 'bg-[#E8B923]/10', border: 'border-[#E8B923]/20', btn: 'bg-[#E8B923] hover:bg-yellow-500 text-black' },
    info: { icon: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', btn: 'bg-blue-600 hover:bg-blue-700' }
  };

  const theme = colors[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
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
          className={`relative w-full max-w-sm bg-[#121212] border ${theme.border} rounded-3xl p-6 shadow-2xl overflow-hidden`}
        >
          {/* Brillo de fondo */}
          <div className={`absolute top-0 right-0 p-16 ${theme.bg} blur-[60px] rounded-full pointer-events-none`} />

          <div className="relative z-10 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full ${theme.bg} flex items-center justify-center mb-4 border ${theme.border}`}>
              <AlertTriangle size={32} className={theme.icon} />
            </div>

            <h3 className="text-xl font-black text-white mb-2 tracking-tight">{title}</h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">{message}</p>

            <div className="flex gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} /> Cancelar
              </button>
              <button 
                onClick={onConfirm}
                className={`flex-1 py-3 px-4 rounded-xl ${theme.btn} text-white text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2`}
              >
                <Check size={16} /> Confirmar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};