import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COLOR_PALETTE } from '../config/theme';

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export const AuthModal: React.FC<{ onClose?: () => void; onSuccess?: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Validación (solo para login)
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await login(formData.username, formData.password);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1500);
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{ borderColor: COLOR_PALETTE.gray[200] }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: COLOR_PALETTE.primary.gold }}>
              Lions Cars
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-sm" style={{ color: COLOR_PALETTE.gray[600] }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <CheckCircle size={20} style={{ color: COLOR_PALETTE.status.success }} />
              <span style={{ color: COLOR_PALETTE.status.success }} className="text-sm font-medium">
                ¡Sesión iniciada!
              </span>
            </motion.div>
          )}

          {/* Error Message */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <AlertCircle size={20} style={{ color: COLOR_PALETTE.status.danger }} />
              <span style={{ color: COLOR_PALETTE.status.danger }} className="text-sm font-medium">
                {errors.general}
              </span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: COLOR_PALETTE.gray[700] }}>
                Usuario
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-black bg-white"
                style={{
                  borderColor: errors.username ? COLOR_PALETTE.status.danger : COLOR_PALETTE.gray[300],
                  '--tw-ring-color': COLOR_PALETTE.primary.gold,
                } as React.CSSProperties}
                placeholder="juanperez"
              />
              {errors.username && (
                <p style={{ color: COLOR_PALETTE.status.danger }} className="text-xs mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: COLOR_PALETTE.gray[700] }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 text-black bg-white"
                  style={{
                    borderColor: errors.password ? COLOR_PALETTE.status.danger : COLOR_PALETTE.gray[300],
                    '--tw-ring-color': COLOR_PALETTE.primary.gold,
                  } as React.CSSProperties}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5"
                >
                  {showPassword ? (
                    <EyeOff size={20} style={{ color: COLOR_PALETTE.gray[400] }} />
                  ) : (
                    <Eye size={20} style={{ color: COLOR_PALETTE.gray[400] }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: COLOR_PALETTE.status.danger }} className="text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-all hover:shadow-lg disabled:opacity-70"
              style={{ backgroundColor: COLOR_PALETTE.primary.gold, color: '#000' }}
            >
              {loading ? 'Procesando...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Info Message */}
          <p className="text-xs text-center mt-4" style={{ color: COLOR_PALETTE.gray[500] }}>
            Para registrar nuevos usuarios, accede al panel de administración.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
