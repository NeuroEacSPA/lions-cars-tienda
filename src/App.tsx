import React, { useState, useMemo, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import {
  Car, Calendar, Gauge, Fuel, Settings2,
  Search, X, MessageCircle, ChevronRight,
  Filter, Heart, Share2, LayoutDashboard, ArrowLeft,
  User, FileCheck, Settings, Zap, Activity, ChevronLeft,
  QrCode, Smartphone, Calculator, Percent, CreditCard, Banknote, RefreshCw, FileDown, Eye
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type Variants } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CarPdfDocument } from './components/CarPdf';
import { useAuth } from './context/AuthContext';
// AuthModal loaded lazily below
import { UserMenu } from './components/UserMenu';
import { TasarVehiculo } from './components/TasarVehiculo';
// SellerPortal loaded lazily below
// Background3D loaded lazily below
import { ConfirmModal } from './components/ConfirmModal';

const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const SellerPortal = lazy(() => import('./components/SellerPortal'));
const Background3D = lazy(() => import('./components/Background3D').then(m => ({ default: m.Background3D })));
import { carService } from './services/api';
import type { Vehiculo, Hotspot } from './services/api';

const RED_MAIN = '#C8102E';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price || 0);

interface CarCardProps {
  car: Vehiculo;
  onClick: (c: Vehiculo) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: number) => void;
}

// ── ANIMATION VARIANTS ──────────────────────────────────────
const containerStagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  exit: { opacity: 0 }
};
const fadeInUpSpring: Variants = {
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
  exit: { y: -20, opacity: 0 }
};
const pageTransitionVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3, ease: 'easeIn' } }
};

// ── PARTICLES COMPONENT (Ultra Premium Touch) ───────────────
const Sparkles = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const particles = useMemo(() => [...Array(12)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    dur: Math.random() * 4 + 4,
    delay: Math.random() * 4,
  })), []);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-[#E8B923] rounded-full shadow-[0_0_6px_#E8B923]"
          style={{ left: p.left, top: p.top }}
          animate={{ y: -160, opacity: [0.5, 0.8, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'linear', delay: p.delay }}
        />
      ))}
    </div>
  );
};

// ── LOADING DEL MODAL ────────────────────────────────────────
const ModalLoading = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl"
  >
    <div className="flex flex-col items-center gap-6">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-2xl bg-[#C8102E] flex items-center justify-center shadow-[0_0_60px_rgba(200,16,46,0.6)]"
      >
        <Car size={40} className="text-[#E8B923]" />
      </motion.div>
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#C8102E] via-[#E8B923] to-[#C8102E] rounded-full"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="text-center">
        <p className="text-white font-black text-sm uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          LYONS <span className="text-[#E8B923]">&amp; ACTYON</span>
        </p>
        <p className="text-zinc-500 text-[10px] mt-2 font-bold uppercase tracking-widest animate-pulse">
          Preparando catálogo...
        </p>
      </div>
    </div>
  </motion.div>
);

// ── AUTO CAROUSEL ─────────────────────────────────────────────
const AutoCarousel = ({ images, interval = 3000 }: { images: string[]; interval?: number }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length === 0) return;
    const timer = setInterval(() => setCurrentIndex(p => (p + 1) % images.length), interval);
    return () => clearInterval(timer);
  }, [images, interval]);

  return (
    <div className="relative w-full h-full overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex] || '/web1.jpg'}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="w-full h-full object-cover transform transition-transform duration-[10s] group-hover:scale-110"
          loading="lazy"
          decoding="async"
          onError={e => { (e.target as HTMLImageElement).src = '/web3.jpg'; }}
        />
      </AnimatePresence>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, idx) => (
          <motion.div
            key={idx}
            animate={{
              width: currentIndex === idx ? 24 : 6,
              backgroundColor: currentIndex === idx ? RED_MAIN : 'rgba(255,255,255,0.4)',
              transition: { type: 'spring', stiffness: 300, damping: 30 }
            }}
            className="h-1.5 rounded-full shadow-lg"
          />
        ))}
      </div>
    </div>
  );
};

// ── CAR CARD ────────────────────────────────────────────
const CarCard = ({ car, onClick, isFavorite, onToggleFavorite }: CarCardProps) => {
  if (!car) return null;

  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-8deg', '8deg']);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  const imageList = Array.isArray(car.imagenes) && car.imagenes.length > 0
    ? car.imagenes
    : car.imagen ? [car.imagen] : ['https://via.placeholder.com/800x600/121212/e8b923?text=Lyons+Actyon'];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1200px' }}
      className="gradient-border-card"
    >
      <motion.div
        layoutId={`card-${car.id}`}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onClick(car)}
        className="group relative bg-gradient-to-b from-[#171719] to-[#0a0a0c] rounded-[24px] overflow-hidden cursor-pointer flex flex-col h-full shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_30px_60px_rgba(200,16,46,0.25)] transition-shadow duration-500 border border-white/[0.04]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,16,46,0.1)_0%,transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8B923]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8102E]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-20" />

        <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
          <motion.span
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md border ${
              car.tipoVenta === 'Propio'
                ? 'bg-[#E8B923]/90 text-black border-[#FFE65F]/50'
                : 'bg-black/60 text-zinc-100 border-white/10'
            }`}
          >{car.tipoVenta}</motion.span>
          {car.estado && car.estado !== 'Disponible' && (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#C8102E]/90 text-white border border-red-500/50 backdrop-blur-md">
              {car.estado}
            </span>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.8, rotate: -15 }}
          onClick={e => { e.stopPropagation(); onToggleFavorite(e, car.id); }}
          className="absolute top-3 right-3 z-30 p-2.5 rounded-xl bg-black/40 hover:bg-black/80 backdrop-blur-md text-white transition-all border border-white/10 shadow-lg"
        >
          <Heart size={18} style={{ fill: isFavorite ? RED_MAIN : 'none', color: isFavorite ? RED_MAIN : 'inherit' }} />
        </motion.button>

        <div className="relative h-52 sm:h-64 overflow-hidden bg-black border-b border-white/[0.04]">
          <motion.div layoutId={`image-container-${car.id}`} className="w-full h-full">
            <AutoCarousel images={imageList} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/20 to-transparent" />
          <div className="absolute bottom-4 left-5 pr-4">
            <p className="font-display text-[#E8B923] text-[10px] font-black uppercase tracking-[0.28em] mb-1 drop-shadow-md">{car.marca}</p>
            <motion.p layoutId={`price-${car.id}`} className="font-display text-white font-black text-2xl sm:text-3xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-tight">
              {formatPrice(car.precio)}
            </motion.p>
          </div>
        </div>

        <div className="p-5 sm:p-6 flex flex-col flex-grow relative z-10">
          <div className="mb-5">
            <motion.h3 layoutId={`title-${car.id}`} className="font-display text-zinc-100 font-bold text-lg sm:text-xl leading-tight group-hover:text-[#E8B923] transition-colors duration-300 line-clamp-1">
              {car.modelo}
            </motion.h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80 line-clamp-1">{car.version}</p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-[11px] sm:text-[12px] text-zinc-400 mb-6">
            {[
              { Icon: Calendar, val: car.ano },
              { Icon: Gauge, val: `${car.km.toLocaleString()} km` },
              { Icon: Fuel, val: car.combustible },
              { Icon: Settings2, val: car.transmision },
            ].map(({ Icon, val }, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-lg bg-black/60 text-[#E8B923] border border-white/[0.05] shrink-0 group-hover:border-[#E8B923]/25 group-hover:bg-[#E8B923]/5 transition-all shadow-inner">
                  <Icon size={14} className="sm:w-[16px] sm:h-[16px]" />
                </div>
                <span className="font-semibold truncate">{val}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-5 border-t border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1c1c20] to-black flex items-center justify-center text-[#C8102E] font-black border border-white/10 shadow-inner font-display text-sm">
                {car.vendedor ? car.vendedor.charAt(0) : 'L'}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-zinc-600 tracking-widest">Atendido por</span>
                <span className="text-zinc-300 font-semibold leading-none truncate max-w-[80px] sm:max-w-none">
                  {car.vendedor ? car.vendedor.split(' ')[0] : 'Lyons'}
                </span>
              </div>
            </div>
            <motion.span
              className="text-[#E8B923] text-[10px] sm:text-[11px] font-black uppercase flex items-center gap-1.5 bg-[#E8B923]/[0.07] px-3 py-2 rounded-xl border border-[#E8B923]/20 group-hover:bg-[#E8B923] group-hover:text-black transition-all duration-300 tracking-wider"
              whileHover={{ x: 2 }}
            >
              Ver Ficha <ChevronRight size={14} />
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── GENERIC FINANCE MODAL (sin auto específico) ───────────────
const GenericFinanceModal = ({ onClose }: { onClose: () => void }) => {
  const [precio, setPrecio] = useState(12000000);
  const [piePercent, setPiePercent] = useState(20);
  const [months, setMonths] = useState(24);
  const tasaMensual = 0.022;
  const montoPie = Math.round(precio * (piePercent / 100));
  const montoCredito = precio - montoPie;
  const cuota = Math.round((montoCredito * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -months)));
  const costoTotal = cuota * months + montoPie;
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto"
      onClick={onClose}>
      <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-red-900/40 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_50px_rgba(200,16,46,0.3)] relative overflow-hidden my-auto">
        <div className="absolute top-0 right-0 p-16 bg-[#C8102E]/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-16 bg-[#E8B923]/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-xl font-black italic text-white flex items-center gap-3">
            <Calculator size={24} className="text-[#E8B923]" /> Simular Crédito
          </h3>
          <button onClick={onClose} className="p-2.5 bg-black rounded-full border border-white/10 hover:border-white/30 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="space-y-5 relative z-10">
          {/* Precio del vehículo */}
          <div>
            <div className="flex justify-between text-xs mb-3 font-bold">
              <span className="text-gray-400">Valor del vehículo</span>
              <span className="text-[#E8B923] font-mono text-sm">{formatPrice(precio)}</span>
            </div>
            <input type="range" min={3000000} max={40000000} step={500000} value={precio}
              onChange={e => setPrecio(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#C8102E]" />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono"><span>$3M</span><span>$40M</span></div>
          </div>
          {/* Pie */}
          <div>
            <div className="flex justify-between text-xs mb-3 font-bold">
              <span className="text-gray-400 flex items-center gap-1.5"><Percent size={13} className="text-[#E8B923]" /> Pie ({piePercent}%)</span>
              <span className="text-white font-mono">{formatPrice(montoPie)}</span>
            </div>
            <input type="range" min={20} max={50} step={5} value={piePercent}
              onChange={e => setPiePercent(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#C8102E]" />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono"><span>20%</span><span>50%</span></div>
          </div>
          {/* Plazo */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5"><Calendar size={13} className="text-[#E8B923]" /> Plazo (Meses)</p>
            <div className="grid grid-cols-4 gap-2">
              {[12, 24, 36, 48].map(m => (
                <button key={m} onClick={() => setMonths(m)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${months===m ? 'bg-[#C8102E] border-[#C8102E] text-white shadow-[0_0_15px_rgba(200,16,46,0.5)]' : 'bg-black border-white/5 text-gray-400 hover:border-[#E8B923]/50'}`}
                >{m}</button>
              ))}
            </div>
          </div>
          {/* Resultado */}
          <div className="bg-black/60 p-6 rounded-[2rem] border border-red-900/30 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/5 to-transparent pointer-events-none" />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2 relative z-10">Cuota Mensual Estimada</p>
            <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8B923] to-white tracking-tighter relative z-10">{formatPrice(cuota)}</p>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5 relative z-10">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Costo Total Est.</span>
              <span className="text-xs font-mono text-zinc-300 font-bold">{formatPrice(costoTotal)}</span>
            </div>
          </div>
          {/* Acciones */}
          <div className="flex gap-3">
            <a href={`https://api.whatsapp.com/send?phone=56958016208&text=Hola! Me interesa financiar un vehículo de ${formatPrice(precio)} con cuota de ${formatPrice(cuota)}/mes a ${months} meses`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-[#E8B923] to-[#DAA520] text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(232,185,35,0.3)]">
              <Banknote size={18} /> Solicitar
            </a>
            <button onClick={onClose}
              className="flex-1 bg-black text-white border border-[#C8102E]/50 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#C8102E]/10 transition-colors flex items-center justify-center gap-2">
              <X size={16} /> Cerrar
            </button>
          </div>
          <p className="text-[9px] text-zinc-600 text-center">*Simulación referencial. Tasa mensual 2.2%. Sujeto a evaluación crediticia.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── FINANCE MODAL ─────────────────────────────────────────────
const FinanceModal = ({ car, onClose }: { car: Vehiculo; onClose: () => void }) => {
  const [piePercent, setPiePercent] = useState(20);
  const [months, setMonths] = useState(24);
  const tasaMensual = 0.022;
  const montoPie = Math.round(car.precio * (piePercent / 100));
  const montoCredito = car.precio - montoPie;
  const cuota = Math.round((montoCredito * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -months)));
  const costoTotal = cuota * months + montoPie;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-red-900/40 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_50px_rgba(200,16,46,0.3)] relative overflow-hidden my-auto"
      >
        <div className="absolute top-0 right-0 p-16 bg-[#C8102E]/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-16 bg-[#E8B923]/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-xl font-black italic text-white flex items-center gap-3">
            <Calculator size={24} className="text-[#E8B923]" /> Simulador
          </h3>
          <button onClick={onClose} className="p-2.5 bg-black rounded-full border border-white/10 hover:border-white/30 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-6 relative z-10">
          <div className="bg-black/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-14 h-14 bg-zinc-900 rounded-xl overflow-hidden shrink-0 border border-white/10">
              <img src={car.imagen || car.imagenes?.[0]} className="w-full h-full object-cover" alt="" loading="lazy" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{car.marca}</p>
              <p className="text-sm font-bold text-white truncate">{car.modelo}</p>
              <p className="text-xs text-[#E8B923] font-mono mt-1">{formatPrice(car.precio)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-3 font-bold">
              <span className="text-gray-400 flex items-center gap-1.5"><Percent size={14} className="text-[#E8B923]" /> Pie ({piePercent}%)</span>
              <span className="text-white text-sm">{formatPrice(montoPie)}</span>
            </div>
            <input type="range" min="20" max="50" step="5" value={piePercent}
              onChange={e => setPiePercent(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-mono font-bold"><span>20%</span><span>50%</span></div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5"><Calendar size={14} className="text-[#E8B923]" /> Plazo (Meses)</p>
            <div className="grid grid-cols-4 gap-2.5">
              {[12, 24, 36, 48].map(m => (
                <button key={m} onClick={() => setMonths(m)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${months === m ? 'bg-[#C8102E] border-[#C8102E] text-white shadow-[0_0_15px_rgba(200,16,46,0.5)]' : 'bg-black border-white/5 text-gray-400 hover:border-[#E8B923]/50'}`}
                >{m}</button>
              ))}
            </div>
          </div>
          <div className="bg-black/60 p-6 rounded-[2rem] border border-red-900/30 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/5 to-transparent pointer-events-none" />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2 relative z-10">Cuota Mensual Estimada</p>
            <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8B923] to-white tracking-tighter drop-shadow-xl relative z-10">{formatPrice(cuota)}</p>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5 relative z-10">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Costo Total Est.</span>
              <span className="text-xs font-mono text-zinc-300 font-bold">{formatPrice(costoTotal)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-[#E8B923] to-[#DAA520] text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(232,185,35,0.3)]">
              <Banknote size={18} /> Solicitar
            </button>
            <button className="flex-1 bg-black text-white border border-[#C8102E]/50 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#C8102E]/10 transition-colors flex items-center justify-center gap-2">
              <CreditCard size={18} className="text-[#C8102E]" /> Evaluar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── REACTBITS MICRO-COMPONENTS ──────────────────────────────────────────────
// Inlined from reactbits.dev — no extra deps, no CSS files

// ShinyText: pure CSS shimmer sweep (zero JS overhead)
const ShinyText = ({ text, className = '', speed = 3.5, color = '#E8B923', shine = '#fffbe0' }: {
  text: string; className?: string; speed?: number; color?: string; shine?: string;
}) => (
  <span className={className} style={{
    backgroundImage: `linear-gradient(120deg,${color} 0%,${color} 30%,${shine} 50%,${color} 70%,${color} 100%)`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `shineText ${speed}s linear infinite`,
  }}>{text}</span>
);

// SpotlightCard: mouse-tracked radial glow overlay (from reactbits.dev/components/spotlight-card)
const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(200,16,46,0.25)' }: {
  children: React.ReactNode; className?: string; spotlightColor?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--sx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--sy', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300"
        style={{ background: `radial-gradient(260px circle at var(--sx,-200px) var(--sy,-200px),${spotlightColor},transparent 70%)` }} />
      <div className="relative z-[2]">{children}</div>
    </div>
  );
};

// CountUp: spring-animated counter (from reactbits.dev/text-animations/count-up)
const CountUp = ({ to, from = 0, duration = 1.6, className = '', fmt }: {
  to: number; from?: number; duration?: number; className?: string; fmt?: (n: number) => string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { damping: 20 + 40 / duration, stiffness: 100 / duration });
  useEffect(() => { const t = setTimeout(() => mv.set(to), 120); return () => clearTimeout(t); }, [to, mv]);
  useEffect(() => spring.on('change', v => {
    if (ref.current) ref.current.textContent = fmt ? fmt(Math.round(v)) : Math.round(v).toLocaleString('es-CL');
  }), [spring, fmt]);
  return <span ref={ref} className={className}>{fmt ? fmt(from) : from.toLocaleString('es-CL')}</span>;
};

// BlurText: word-by-word blur entrance (from reactbits.dev/text-animations/blur-text)
const BlurText = ({ text, className = '', wordDelay = 60 }: { text: string; className?: string; wordDelay?: number }) => (
  <span className={`inline-flex flex-wrap ${className}`}>
    {text.split(' ').map((w, i) => (
      <motion.span key={i}
        initial={{ opacity: 0, filter: 'blur(14px)', y: 18 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 + i * wordDelay / 1000, ease: [0.16, 1, 0.3, 1] }}
        className="mr-[0.22em] last:mr-0 inline-block"
      >{w}</motion.span>
    ))}
  </span>
);

// Converts image URLs to JPEG base64 via Canvas API.
// Canvas uses the browser's native image loader (no CORS/fetch issues),
// then exports as JPEG which react-pdf handles reliably.
function imgToJpegDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const MAX = 900;
        const scale = img.naturalWidth > MAX ? MAX / img.naturalWidth : 1;
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(src); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src.startsWith('http') ? src : `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
  });
}

function useBase64Images(urls: string[]): string[] {
  const [b64, setB64] = useState<string[]>([]);
  const key = urls.join('|');
  useEffect(() => {
    if (!urls.length) return;
    let cancelled = false;
    Promise.all(urls.map(imgToJpegDataUrl))
      .then(results => { if (!cancelled) setB64(results); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return b64;
}

// ── CAR MODAL ─────────────────────────────────────────────────────────────────
const CarModal = ({
  car, onClose, onContact, onOpenFinance
}: {
  car: Vehiculo; onClose: () => void; onContact: (c: Vehiculo) => void; onOpenFinance: () => void;
}) => {
  type TabType = 'EXTERIOR' | 'INTERIOR';
  const [activeTab, setActiveTab] = useState<TabType>('EXTERIOR');
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const images = Array.isArray(car.imagenes) && car.imagenes.length > 0
    ? car.imagenes : [car.imagen || '/web3.jpg'];
  const splitIndex = Math.ceil(images.length / 2);
  const exteriorImages = images.slice(0, splitIndex);
  const interiorImages = images.slice(splitIndex);
  const activeImages = activeTab === 'INTERIOR' && interiorImages.length > 0 ? interiorImages : exteriorImages;
  const currentImage = activeImages[currentImgIdx] || images[0];

  // Pre-fetch top 4 images as base64 so react-pdf can embed them without CORS issues
  const pdfBase64 = useBase64Images(images.slice(0, 4));
  const pdfCar = pdfBase64.length > 0
    ? { ...car, imagenes: pdfBase64, imagen: pdfBase64[0] }
    : car;

  const shareUrl = car.slug ? `https://lionscars.cl/autos/${car.slug}` : `https://lionscars.cl/vehiculo/${car.id}`;

  const handleTabChange = (tab: TabType) => { setActiveTab(tab); setCurrentImgIdx(0); setIsZoomed(false); };
  const goToPrev = () => setCurrentImgIdx(p => (p > 0 ? p - 1 : activeImages.length - 1));
  const goToNext = () => setCurrentImgIdx(p => (p < activeImages.length - 1 ? p + 1 : 0));

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: `${car.marca} ${car.modelo} ${car.ano} — Lyons & Actyon`, url: shareUrl });
    else navigator.clipboard.writeText(shareUrl);
  };

  // Swipe support
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 40) dx < 0 ? goToNext() : goToPrev();
    setTouchStart(null);
  };

  // Scroll active thumb into view
  useEffect(() => {
    const el = thumbsRef.current?.children[currentImgIdx] as HTMLElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentImgIdx]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, activeImages]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-0 sm:p-2 md:p-5 font-sans"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[1600px] h-[100dvh] sm:h-[95vh] bg-[#070709] sm:rounded-3xl overflow-hidden flex flex-col lg:flex-row border border-white/[0.05] shadow-[0_0_80px_rgba(0,0,0,0.9)]"
      >

        {/* ── LEFT: GALLERY ─────────────────────────────────────────────── */}
        <div
          className="relative w-full lg:w-[60%] h-[46vh] sm:h-[52vh] lg:h-full flex flex-col overflow-hidden shrink-0 bg-black"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        >
          {/* Ambient blurred background from current image */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <img src={currentImage} className="w-full h-full object-cover scale-125 blur-3xl opacity-[0.18] saturate-150" loading="lazy" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 sm:p-5">
            {/* EXTERIOR / INTERIOR tabs */}
            <div className="flex bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-lg">
              {(['EXTERIOR', 'INTERIOR'] as TabType[]).map(tab => (
                <button key={tab} onClick={() => handleTabChange(tab)}
                  className={`px-3.5 sm:px-5 py-1.5 text-[9px] sm:text-[10px] font-black tracking-widest transition-all duration-200 rounded-lg ${
                    activeTab === tab
                      ? 'bg-[#E8B923] text-black shadow-[0_0_14px_rgba(232,185,35,0.5)]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >{tab}</button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Live badge */}
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xl border border-[#C8102E]/40 px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(200,16,46,0.25)]">
                <span className="w-1.5 h-1.5 bg-[#C8102E] rounded-full animate-pulse shadow-[0_0_4px_#C8102E]" />
                <span className="text-[9px] text-[#E8B923] font-black uppercase tracking-wider hidden sm:inline">15 viendo</span>
              </div>
              {/* Mobile close */}
              <button onClick={onClose} className="lg:hidden p-2 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-[#C8102E]/20 transition-all">
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Main image */}
          <div className="flex-1 relative z-10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={`${activeTab}-${currentImgIdx}`}
                src={currentImage}
                initial={{ opacity: 0, scale: 1.04, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: isZoomed ? 1.65 : 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full h-full object-contain select-none ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={() => setIsZoomed(z => !z)}
                draggable={false}
                loading="lazy"
                alt={`${car.marca} ${car.modelo} ${car.ano}`}
                onError={e => { (e.target as HTMLImageElement).src = '/web3.jpg'; }}
              />
            </AnimatePresence>

            {/* Hotspots */}
            {!isZoomed && car.hotspots?.filter((h: Hotspot) =>
              h.imageIndex === currentImgIdx || (h.imageIndex === undefined && currentImgIdx === 0)
            ).map((spot: Hotspot) => (
              <motion.div key={spot.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute w-6 h-6 -ml-3 -mt-3 z-30 cursor-pointer group/hs"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
                <span className="absolute inset-0 rounded-full bg-[#E8B923]/70 animate-ping" />
                <span className="relative flex h-6 w-6 rounded-full bg-[#C8102E] border-2 border-[#E8B923] items-center justify-center shadow-[0_0_12px_rgba(232,185,35,0.6)]">
                  <span className="w-1.5 h-1.5 bg-[#E8B923] rounded-full" />
                </span>
                <div className="absolute left-1/2 -translate-x-1/2 top-9 lg:left-full lg:top-1/2 lg:-translate-y-1/2 lg:ml-3 w-52 bg-black/95 backdrop-blur-xl border border-[#C8102E]/40 p-4 rounded-2xl shadow-2xl opacity-0 group-hover/hs:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="text-[10px] text-[#E8B923] font-black uppercase tracking-[0.2em] mb-1">{spot.label}</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{spot.detail}</p>
                </div>
              </motion.div>
            ))}

            {/* Nav arrows */}
            {activeImages.length > 1 && (
              <>
                <motion.button whileTap={{ scale: 0.92 }} onClick={goToPrev}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-[#C8102E] hover:border-[#C8102E] transition-all shadow-lg">
                  <ChevronLeft size={18} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.92 }} onClick={goToNext}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/70 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-[#C8102E] hover:border-[#C8102E] transition-all shadow-lg">
                  <ChevronRight size={18} />
                </motion.button>
              </>
            )}

            {/* Image counter pill */}
            <div className="absolute bottom-3 right-4 z-20 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
              <span className="text-[11px] font-bold text-white tabular-nums">{currentImgIdx + 1} / {activeImages.length}</span>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div ref={thumbsRef} className="relative z-10 h-[4.5rem] sm:h-24 bg-black/80 backdrop-blur-sm border-t border-white/[0.06] flex items-center gap-2 px-3 overflow-x-auto scrollbar-hide py-2 shrink-0">
            {activeImages.map((img: string, idx: number) => (
              <motion.button key={idx} whileTap={{ scale: 0.94 }} onClick={() => setCurrentImgIdx(idx)}
                className={`flex-shrink-0 h-full aspect-[4/3] rounded-xl overflow-hidden transition-all duration-250 ring-2 ${
                  currentImgIdx === idx ? 'ring-[#E8B923] scale-105 shadow-[0_0_16px_rgba(232,185,35,0.45)]' : 'ring-transparent opacity-40 hover:opacity-75 hover:ring-white/20'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" loading="lazy" alt={`Vista ${idx + 1}`}
                  onError={e => { (e.target as HTMLImageElement).src = '/web3.jpg'; }} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: INFO PANEL ─────────────────────────────────────────── */}
        <div className="relative w-full lg:w-[40%] flex-1 lg:h-full flex flex-col bg-[#060608] border-l border-white/[0.04] min-h-0">

          {/* Brand header */}
          <div className="shrink-0 flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-white/[0.05] bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C8102E]/20 border border-[#C8102E]/30 flex items-center justify-center shrink-0">
                <Car size={14} className="text-[#C8102E]" />
              </div>
              <span className="text-[10px] text-[#E8B923]/90 font-black uppercase tracking-[0.35em]">{car.marca}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} title="Compartir"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-all border border-white/[0.06]">
                <Share2 size={14} />
              </button>
              <button onClick={onClose}
                className="hidden lg:flex p-2 rounded-xl bg-white/5 hover:bg-[#C8102E]/20 text-zinc-500 hover:text-[#C8102E] transition-all border border-white/[0.06]">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-7 pt-5 pb-4">

            {/* Model — BlurText animation */}
            <div className="mb-1">
              <BlurText text={car.modelo}
                className="text-[1.9rem] sm:text-[2.4rem] font-black italic text-white leading-none tracking-tighter"
                wordDelay={70}
              />
            </div>

            {/* Price — ShinyText */}
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <ShinyText text={formatPrice(car.precio)} className="text-2xl sm:text-[1.7rem] font-black" speed={3.5} />
              {car.estado === 'Disponible' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
                  className="px-3 py-1 bg-[#C8102E]/10 border border-[#C8102E]/40 text-[#C8102E] text-[9px] font-black uppercase tracking-widest rounded-lg"
                >Entrega Inmediata</motion.span>
              )}
            </div>
            {car.slug && <p className="text-[10px] text-zinc-700 font-mono mb-5 truncate">lionscars.cl/autos/{car.slug}</p>}

            {/* SpotlightCard badges */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { Icon: RefreshCw, hex: '#C8102E', label: 'Retoma', val: 'Recibimos tu Auto' },
                { Icon: User,       hex: '#E8B923', label: 'Dueños', val: `${car.duenos} Propietario${car.duenos > 1 ? 's' : ''}` },
                { Icon: FileCheck,  hex: '#C8102E', label: 'Papeles', val: 'Al Día 2026' },
                { Icon: Settings,   hex: '#E8B923', label: 'Inspección', val: 'Aprobada' },
              ].map(({ Icon, hex, label, val }) => (
                <SpotlightCard key={label}
                  className="bg-[#0c0c0e] border border-white/[0.06] rounded-2xl p-3.5 hover:border-white/[0.12] transition-colors cursor-default"
                  spotlightColor={`${hex}35`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl shrink-0" style={{ background: `${hex}18`, color: hex }}>
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{label}</p>
                      <p className="text-[11px] text-white font-bold truncate mt-0.5">{val}</p>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>

            {/* Ficha Técnica — SpotlightCards + CountUp for KM */}
            <div className="mb-5">
              <h4 className="flex items-center gap-2 text-[9px] text-[#C8102E] font-black uppercase tracking-[0.35em] mb-3">
                <div className="w-3 h-[2px] bg-[#C8102E] rounded-full" />
                Ficha Técnica
                <div className="flex-1 h-px bg-white/[0.05]" />
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { label: 'Año', icon: Calendar, countTo: undefined, val: String(car.ano) },
                  { label: 'Kilometraje', icon: Gauge, countTo: car.km ?? 0, val: '' },
                  { label: 'Combustible', icon: Fuel, countTo: undefined, val: car.combustible },
                  { label: 'Transmisión', icon: Settings2, countTo: undefined, val: car.transmision },
                  { label: 'Motor', icon: Zap, countTo: undefined, val: car.motor || car.cilindrada || 'N/A' },
                  { label: 'Tracción', icon: Activity, countTo: undefined, val: car.traccion || '4x2' },
                ] as { label: string; icon: React.ElementType; countTo?: number; val: string }[]).map((item, i) => (
                  <SpotlightCard key={i}
                    className="bg-[#0a0a0c] border border-white/[0.05] rounded-xl p-3 hover:border-[#E8B923]/20 transition-colors cursor-default"
                    spotlightColor="rgba(232,185,35,0.1)"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-[#111] rounded-lg text-[#E8B923] border border-[#E8B923]/10 shrink-0 mt-0.5">
                        <item.icon size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] text-zinc-600 uppercase font-black tracking-wider">{item.label}</p>
                        <p className="text-sm text-white font-black mt-0.5 truncate">
                          {item.countTo !== undefined
                            ? <CountUp to={item.countTo} className="text-sm text-white font-black" fmt={n => `${n.toLocaleString('es-CL')} KM`} />
                            : item.val
                          }
                        </p>
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </div>

            {/* Finance banner */}
            {car.financiable && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#110505] to-[#070709] border border-[#C8102E]/30 p-4 sm:p-5 mb-5 group hover:border-[#C8102E]/50 transition-all">
                <div className="absolute top-3 right-3 bg-gradient-to-r from-[#E8B923] to-[#c9991f] text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Oportunidad</div>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#C8102E]/15 blur-2xl rounded-full pointer-events-none" />
                <p className="text-[9px] text-[#E8B923] font-black uppercase tracking-[0.3em] mb-1 relative z-10">Financiamiento Flexible</p>
                <p className="text-[1.6rem] font-black text-white italic mb-1 relative z-10 leading-none">
                  24/48 <span className="text-sm font-bold text-zinc-500 not-italic">cuotas</span>
                </p>
                <p className="text-[11px] text-zinc-500 mb-3.5 relative z-10">
                  Pie desde <span className="text-white font-bold">{formatPrice(car.valorPie || car.precio * 0.2)}</span>. Evaluación en 15 min.
                </p>
                <button onClick={onOpenFinance}
                  className="w-full py-2.5 bg-transparent border border-[#E8B923]/35 hover:border-[#E8B923]/70 text-[#E8B923] text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-[#E8B923]/5 relative z-10">
                  <Calculator size={13} /> Simular Crédito
                </button>
              </div>
            )}

            {/* QR + PDF */}
            <div className="flex flex-col gap-2 mb-5">
              <SpotlightCard
                className="bg-[#0a0a0c] border border-white/[0.05] rounded-2xl p-4 hover:border-[#E8B923]/20 transition-colors cursor-pointer group"
                spotlightColor="rgba(232,185,35,0.08)"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 border border-[#E8B923]/30 group-hover:border-[#E8B923]/60 transition-colors">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shareUrl)}`}
                        alt="QR" className="w-full h-full" loading="lazy" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white flex items-center gap-1.5"><Smartphone size={12} className="text-[#C8102E]" /> Ficha Digital</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">Escanea en tu móvil</p>
                    </div>
                  </div>
                  <QrCode size={16} className="text-zinc-700 group-hover:text-[#E8B923] transition-colors shrink-0" />
                </div>
              </SpotlightCard>

              <PDFDownloadLink document={<CarPdfDocument car={pdfCar} baseUrl={window.location.origin} />} fileName={`Ficha_LyonsActyon_${car.marca}_${car.modelo}.pdf`} className="w-full">
                {/* @ts-ignore */}
                {({ loading: pdfLoading }) => {
                  const busy = pdfLoading || pdfBase64.length === 0;
                  return (
                    <button disabled={busy}
                      className="w-full py-3 bg-[#0a0a0c] hover:bg-black disabled:cursor-not-allowed border border-white/[0.05] hover:border-[#C8102E]/30 text-white rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-[0.2em] group">
                      {busy
                        ? <><div className="w-4 h-4 border-2 border-[#E8B923] border-t-transparent rounded-full animate-spin" /> {pdfBase64.length === 0 ? 'Cargando imágenes...' : 'Generando...'}</>
                        : <><FileDown size={14} className="text-[#E8B923] group-hover:translate-y-0.5 transition-transform" /> Descargar Ficha PDF</>
                      }
                    </button>
                  );
                }}
              </PDFDownloadLink>
            </div>

            {/* Stats — CountUp */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <SpotlightCard className="bg-[#0a0a0c] border border-white/[0.05] rounded-2xl p-4 text-center" spotlightColor="rgba(255,255,255,0.06)">
                <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-black mb-2">Vistas</p>
                <CountUp to={car.vistas || 0} className="text-2xl font-black text-white" />
              </SpotlightCard>
              <SpotlightCard className="bg-gradient-to-b from-[#1a1500]/50 to-[#0a0a0c] border border-[#E8B923]/20 rounded-2xl p-4 text-center" spotlightColor="rgba(232,185,35,0.1)">
                <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-black mb-2">Interesados</p>
                <CountUp to={car.interesados || 0} className="text-2xl font-black text-[#E8B923]" />
              </SpotlightCard>
            </div>

            {/* Expert note */}
            <div className="bg-[#080809] border border-white/[0.04] rounded-2xl p-4 mb-2">
              <p className="text-[8px] text-[#C8102E] font-black uppercase tracking-[0.3em] mb-2.5 flex items-center gap-1.5">
                <Eye size={11} /> Observaciones
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-[#E8B923]/30 pl-3 italic">
                "{car.obs || 'Vehículo en excelentes condiciones, listo para transferir.'}"
              </p>
            </div>
            <div className="h-3" />
          </div>

          {/* Sticky CTA */}
          <div className="shrink-0 px-4 sm:px-5 py-4 bg-black/80 backdrop-blur-2xl border-t border-white/[0.06] shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => onContact(car)}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#C8102E] via-[#e8102e] to-[#C8102E] text-white font-black text-xs sm:text-sm uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_24px_rgba(200,16,46,0.4)] hover:shadow-[0_0_40px_rgba(200,16,46,0.65)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <MessageCircle size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">Contactar Vendedor</span>
            </motion.button>
            <p className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-3">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Respuesta promedio: 5 minutos
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── FOOTER ────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-black border-t border-red-900/40 pt-20 pb-10 mt-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,_rgba(200,16,46,0.15),_transparent_70%)] pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 mb-16">
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C8102E] to-red-900 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(200,16,46,0.4)] border border-red-500/30">
              <Car className="text-[#E8B923]" size={26} />
            </div>
            <span className="text-white font-black text-2xl tracking-tighter uppercase drop-shadow-md">LYONS <span className="text-[#E8B923]">&amp; ACTYON</span></span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed font-medium">Tu destino premium para la compra y venta de vehículos. Calidad garantizada, inspección rigurosa y financiamiento a tu medida.</p>
        </div>
        <div>
          <h4 className="text-[#E8B923] font-black mb-6 text-xs uppercase tracking-[0.2em]">Navegación</h4>
          <ul className="space-y-4">
            {['Catálogo Premium', 'Vender mi Auto', 'Financiamiento', 'Seguros'].map(item => (
              <li key={item}>
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors flex items-center gap-3 group font-medium">
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#C8102E]" />{item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[#E8B923] font-black mb-6 text-xs uppercase tracking-[0.2em]">Contacto</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-4 text-zinc-400 text-sm font-medium hover:text-white transition-colors cursor-pointer group">
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#C8102E]/20 transition-colors"><MessageCircle size={16} className="text-[#C8102E]" /></div>
              <span>+56 9 58016208</span>
            </li>
            <li className="flex items-center gap-4 text-zinc-400 text-sm font-medium hover:text-white transition-colors cursor-pointer group">
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#C8102E]/20 transition-colors"><Search size={16} className="text-[#C8102E]" /></div>
              <span>contacto@lionscars.cl</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[#E8B923] font-black mb-6 text-xs uppercase tracking-[0.2em]">Horarios</h4>
          <div className="bg-black/50 border border-red-900/30 p-5 rounded-2xl space-y-3 shadow-inner">
            <div className="flex justify-between text-xs font-bold"><span className="text-zinc-500 uppercase tracking-wider">Lun - Vie:</span><span className="text-white">09:00 - 19:00</span></div>
            <div className="flex justify-between text-xs font-bold"><span className="text-zinc-500 uppercase tracking-wider">Sábados:</span><span className="text-white">10:00 - 14:00</span></div>
          </div>
        </div>
      </div>
      <div className="border-t border-red-900/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em]">© 2026 LYONS & ACTYON AUTOMOTRIZ</p>
        <div className="flex gap-6">
          <motion.div whileHover={{ scale: 1.2, y: -2 }} className="text-zinc-500 hover:text-[#E8B923] cursor-pointer transition-colors"><Share2 size={18} /></motion.div>
          <motion.div whileHover={{ scale: 1.2, y: -2 }} className="text-zinc-500 hover:text-[#C8102E] cursor-pointer transition-colors"><Heart size={18} /></motion.div>
        </div>
      </div>
    </div>
  </footer>
);


// ── FILTER SECTION ────────────────────────────────────────────────────────────
const FilterSection = ({
  title, icon, children, defaultOpen = true
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.05] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3.5 group">
        <span className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 group-hover:text-zinc-200 transition-colors">
          <span className="text-[#C8102E]">{icon}</span>
          {title}
        </span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={13} className="text-zinc-700" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── APP PRINCIPAL ─────────────────────────────────────────────
function App() {
  const [stock, setStock] = useState<Vehiculo[]>([]);
  const [vendors, setVendors] = useState<{ [key: number]: string }>({});
  const navigate = useNavigate();

// ── Lee el slug o el id desde la URL
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const urlParam = slug || id;

  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCar, setSelectedCar] = useState<Vehiculo | null>(null);
  const [financeCar, setFinanceCar] = useState<Vehiculo | null>(null);
  const [notification, setNotification] = useState<{ message: string; sub: string } | null>(null);
  const [currentView, setCurrentView] = useState<'catalog' | 'seller'>('catalog');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGenericFinance, setShowGenericFinance] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; idToDelete: number | null }>({ isOpen: false, idToDelete: null });

  const [filters, setFilters] = useState({
    marca: 'Todas', yearMin: '', yearMax: '', priceMin: '', priceMax: '',
    kmMin: '', kmMax: '', combustible: 'Todos', transmision: 'Todas',
    traccion: 'Todas', tipoVenta: 'Todos', financiable: 'Todos',
    duenosMax: '', aire: 'Todos', neumaticos: 'Todos'
  });

 // ── Sincroniza la URL con el modal abierto
  useEffect(() => {
    if (!urlParam) {
      setSelectedCar(null);
      return;
    }

    if (selectedCar && (selectedCar.slug === urlParam || selectedCar.id.toString() === urlParam)) {
      return;
    }

    const localCar = stock.find(v => v.slug === urlParam || v.id.toString() === urlParam);

    if (localCar) {
      setSelectedCar(localCar);
      carService.incrementView(localCar.id).catch(console.error);
      return;
    }

    setModalLoading(true);
    carService.getBySlug(urlParam)
      .then(car => {
        setSelectedCar(car);
        carService.incrementView(car.id).catch(console.error);
      })
      .catch(() => {
        setNotification({ message: 'Vehículo no encontrado', sub: 'Es posible que el vehículo ya no esté disponible.' });
        navigate('/', { replace: true });
      })
      .finally(() => setModalLoading(false));
      
  }, [urlParam, stock, selectedCar, navigate]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user?.role === 'admin') setCurrentView('seller');
      else if (!isAuthenticated) setCurrentView('catalog');
    }
  }, [isAuthenticated, user, authLoading]);

  useEffect(() => {
    fetchCars();
    carService.getVendors().then(vendorsList => {
      const map: { [key: number]: string } = {};
      vendorsList.forEach(v => {
        let phone = v.telefono.replace(/\D/g, '');
        if (!phone.startsWith('56')) phone = '56' + phone;
        map[v.id] = phone;
      });
      setVendors(map);
    }).catch(console.error);
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await carService.getAll();
      setStock(data);
    } catch {
      setNotification({ message: 'Error de Conexión', sub: 'Asegúrate de que el backend esté corriendo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (car: Vehiculo) => {
    try {
      const { id: _id, ...carData } = car;
      const newCar = await carService.create(carData as Vehiculo);
      setStock(prev => [newCar, ...prev]);
      setNotification({ message: 'Vehículo Agregado', sub: `${newCar.marca} ${newCar.modelo} guardado.` });
    } catch {
      setNotification({ message: 'Error', sub: 'No se pudo guardar el vehículo.' });
    }
  };

  const handleUpdateCar = async (updatedCar: Vehiculo) => {
    try {
      const result = await carService.update(updatedCar);
      setStock(prev => prev.map(c => c.id === result.id ? result : c));
      setNotification({ message: 'Vehículo Actualizado', sub: 'Los cambios han sido guardados.' });
    } catch {
      setNotification({ message: 'Error', sub: 'No se pudo actualizar.' });
    }
  };

  const requestDeleteCar = (id: number) => setConfirmDialog({ isOpen: true, idToDelete: id });

  const executeDeleteCar = async () => {
    const id = confirmDialog.idToDelete;
    if (!id) return;
    try {
      await carService.delete(id);
      setStock(prev => prev.filter(c => c.id !== id));
      setNotification({ message: 'Vehículo Eliminado', sub: 'El registro ha sido borrado.' });
    } catch {
      setNotification({ message: 'Error', sub: 'No se pudo eliminar.' });
    } finally {
      setConfirmDialog({ isOpen: false, idToDelete: null });
    }
  };

  const sellers = useMemo(() => ['Todos', ...Array.from(new Set(stock.map(c => c.vendedor)))], [stock]);
  const marcas = useMemo(() => ['Todas', ...Array.from(new Set(stock.map(c => c.marca))).sort()], [stock]);

  const filteredStock = useMemo(() => stock.filter(car => {
    const s = searchTerm.toLowerCase();
    const f = filters;
    return (selectedSeller === 'Todos' || car.vendedor === selectedSeller)
      && (car.marca.toLowerCase().includes(s) || car.modelo.toLowerCase().includes(s) || car.ano.toString().includes(s))
      && (f.marca === 'Todas' || car.marca === f.marca)
      && (!f.yearMin || car.ano >= +f.yearMin) && (!f.yearMax || car.ano <= +f.yearMax)
      && (!f.priceMin || car.precio >= +f.priceMin) && (!f.priceMax || car.precio <= +f.priceMax)
      && (!f.kmMin || car.km >= +f.kmMin) && (!f.kmMax || car.km <= +f.kmMax)
      && (f.combustible === 'Todos' || car.combustible === f.combustible)
      && (f.transmision === 'Todas' || car.transmision === f.transmision)
      && (f.traccion === 'Todas' || car.traccion === f.traccion)
      && (f.tipoVenta === 'Todos' || car.tipoVenta === f.tipoVenta)
      && (f.financiable === 'Todos' || (f.financiable === 'Si' ? car.financiable : !car.financiable))
      && (!f.duenosMax || car.duenos <= +f.duenosMax)
      && (f.aire === 'Todos' || (f.aire === 'Si' ? car.aire : !car.aire))
      && (f.neumaticos === 'Todos' || car.neumaticos === f.neumaticos);
  }), [stock, selectedSeller, searchTerm, filters]);

  const activeFilters = useMemo(() => {
    const active: { key: string; label: string; onRemove: () => void }[] = [];
    if (filters.marca !== 'Todas') active.push({ key: 'marca', label: filters.marca, onRemove: () => setFilters(f => ({ ...f, marca: 'Todas' })) });
    if (filters.combustible !== 'Todos') active.push({ key: 'comb', label: filters.combustible, onRemove: () => setFilters(f => ({ ...f, combustible: 'Todos' })) });
    if (filters.transmision !== 'Todas') active.push({ key: 'trans', label: filters.transmision, onRemove: () => setFilters(f => ({ ...f, transmision: 'Todas' })) });
    if (filters.traccion !== 'Todas') active.push({ key: 'trac', label: filters.traccion, onRemove: () => setFilters(f => ({ ...f, traccion: 'Todas' })) });
    if (filters.tipoVenta !== 'Todos') active.push({ key: 'tipo', label: filters.tipoVenta, onRemove: () => setFilters(f => ({ ...f, tipoVenta: 'Todos' })) });
    if (filters.financiable !== 'Todos') active.push({ key: 'fin', label: 'Financiable', onRemove: () => setFilters(f => ({ ...f, financiable: 'Todos' })) });
    if (filters.aire !== 'Todos') active.push({ key: 'aire', label: 'A/C', onRemove: () => setFilters(f => ({ ...f, aire: 'Todos' })) });
    if (filters.duenosMax) active.push({ key: 'duenos', label: '1 dueño', onRemove: () => setFilters(f => ({ ...f, duenosMax: '' })) });
    if (filters.priceMin) active.push({ key: 'pmin', label: `≥ ${formatPrice(+filters.priceMin)}`, onRemove: () => setFilters(f => ({ ...f, priceMin: '' })) });
    if (filters.priceMax) active.push({ key: 'pmax', label: `≤ ${formatPrice(+filters.priceMax)}`, onRemove: () => setFilters(f => ({ ...f, priceMax: '' })) });
    if (filters.yearMin) active.push({ key: 'ymin', label: `≥ ${filters.yearMin}`, onRemove: () => setFilters(f => ({ ...f, yearMin: '' })) });
    if (filters.yearMax) active.push({ key: 'ymax', label: `≤ ${filters.yearMax}`, onRemove: () => setFilters(f => ({ ...f, yearMax: '' })) });
    if (filters.kmMax) active.push({ key: 'km', label: `≤ ${(+filters.kmMax).toLocaleString()} km`, onRemove: () => setFilters(f => ({ ...f, kmMax: '' })) });
    if (selectedSeller !== 'Todos') active.push({ key: 'seller', label: selectedSeller, onRemove: () => setSelectedSeller('Todos') });
    return active;
  }, [filters, selectedSeller]);


  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleContact = (car: Vehiculo) => {
    carService.incrementInterested(car.id).catch(() => {});
    let phone = '56958016208';
    if (car.vendedor_id && vendors[car.vendedor_id]) phone = vendors[car.vendedor_id];
    const link = car.slug ? `lionscars.cl/autos/${car.slug}` : `ID:${car.id}`;
    const text = `Hola, me interesa el ${car.marca} ${car.modelo} ${car.ano} — ${link}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const clearAllFilters = () => {
    setFilters({ marca: 'Todas', yearMin: '', yearMax: '', priceMin: '', priceMax: '', kmMin: '', kmMax: '', combustible: 'Todos', transmision: 'Todas', traccion: 'Todas', tipoVenta: 'Todos', financiable: 'Todos', duenosMax: '', aire: 'Todos', neumaticos: 'Todos' });
    setSearchTerm('');
    setSelectedSeller('Todos');
  };

  return (
    <div className="min-h-screen bg-[#050507] text-gray-100 font-body selection:bg-[#C8102E]/40 overflow-x-hidden">

      <AnimatePresence>
        {modalLoading && <ModalLoading />}
      </AnimatePresence>

      <div className="relative">
        <Suspense fallback={null}>{showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}</Suspense>

        {currentView === 'catalog' && (
          <section className="w-full">
            {/* Relative wrapper: overlays % positions reference IMAGE height, not section total */}
            <div className="relative w-full overflow-hidden">
            {/* Imagen completa sin overlays */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-full"
            >
              <picture>
                <source srcSet="/hero-main.webp" type="image/webp" />
                <source srcSet="/hero-main-opt.jpg" type="image/jpeg" />
                <img
                  src="/hero-main-opt.jpg"
                  alt="Lyons & Actyon Automotriz — Autos Seminuevos Puerto Montt"
                  className="w-full h-auto block"
                  fetchPriority="high"
                  decoding="async"
                  width={1717}
                  height={916}
                  onError={(e) => { e.currentTarget.src = '/web3.jpg'; }}
                />
              </picture>
            </motion.div>

            {/* ── BOTÓN ADMIN — cubre solo el ≡ de la imagen ── */}
            <div className="absolute z-30 hidden lg:block" style={{ top:'2.5%', right:'1.2%', width:'3.5%', aspectRatio:'1' }}>
              {isAuthenticated ? (
                <div className="relative w-full h-full">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setCurrentView(currentView === 'catalog' ? 'seller' : 'catalog')}
                      className="w-full h-full bg-transparent cursor-pointer"
                      title={currentView === 'catalog' ? 'Panel Admin' : 'Volver'}
                    />
                  )}
                  <div className="absolute top-full right-0 mt-1">
                    <UserMenu onAdminClick={() => setCurrentView('seller')} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full h-full bg-transparent cursor-pointer"
                  title="Acceso Admin"
                />
              )}
            </div>

            {/* ── BOTONES SUPERPUESTOS — coords medidas en píxeles de la imagen 1717x916 ── */}
            {/* VER INVENTARIO — px: x=65–304 (3.79%–17.71%), y=531–637 (57.97%–69.54%) */}
            <button
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior:'smooth' })}
              className="absolute z-30 cursor-pointer bg-transparent"
              style={{ left:'3.79%', top:'57.97%', width:'13.92%', height:'11.57%' }}
              aria-label="Ver Inventario"
            />

            {/* FINANCIAMIENTO — px: x=352–513 (20.50%–29.88%), y=598–685 (65.28%–74.78%) */}
            <button
              onClick={() => setShowGenericFinance(true)}
              className="absolute z-30 cursor-pointer bg-transparent"
              style={{ left:'20.50%', top:'65.28%', width:'9.38%', height:'9.50%' }}
              aria-label="Financiamiento"
            />

            {/* ── WIDGET DESKTOP ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="absolute top-1/2 -translate-y-1/2 right-[2%] z-20 hidden lg:block w-[330px] xl:w-[360px]"
            >
              <TasarVehiculo />
            </motion.div>

            {/* ── BOTÓN ADMIN MOBILE — cubre solo el ≡ (inside relative wrapper) ── */}
            <div className="lg:hidden absolute z-30" style={{ top:'2.5%', right:'1.2%', width:'11%', aspectRatio:'1' }}>
              {isAuthenticated ? (
                <div className="relative w-full h-full">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setCurrentView(currentView === 'catalog' ? 'seller' : 'catalog')}
                      className="w-full h-full bg-transparent cursor-pointer"
                      title="Admin"
                    />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full h-full bg-transparent cursor-pointer"
                  title="Admin"
                />
              )}
            </div>
            </div>{/* ─ end relative image wrapper — mobile CTAs go outside so they don't affect overlay % ─ */}

            {/* ── MOBILE: CTAs + widget debajo de la imagen ── */}
            <div className="lg:hidden w-full bg-gradient-to-b from-[#030305] to-[#050507]">
              <div className="mx-4 h-px bg-white/[0.05] mt-1" />

              {/* Botones de acción visibles en móvil */}
              <div className="px-4 pt-5 pb-4 flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 py-4 bg-gradient-to-r from-[#C8102E] via-[#e8102e] to-[#C8102E] text-white font-black text-[11px] uppercase tracking-[0.18em] rounded-2xl shadow-[0_0_24px_rgba(200,16,46,0.45)] flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                  <Car size={16} className="relative z-10 shrink-0" />
                  <span className="relative z-10">Ver Inventario</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGenericFinance(true)}
                  className="flex-1 py-4 bg-black/60 border-2 border-[#E8B923] text-[#E8B923] font-black text-[11px] uppercase tracking-[0.18em] rounded-2xl shadow-[0_0_16px_rgba(232,185,35,0.2)] flex items-center justify-center gap-2"
                >
                  <Calculator size={16} className="shrink-0" />
                  Financiar
                </motion.button>
              </div>

              {/* Widget Tasar */}
              <div className="px-4 pb-8">
                <div className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                  <TasarVehiculo />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>


      <main id="catalog" className="w-full px-4 sm:px-6 pb-20 min-h-[600px] mt-4 sm:mt-10">
        <AnimatePresence mode="wait">
          {currentView === 'catalog' ? (
            <motion.div key="catalog-view" variants={pageTransitionVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col md:flex-row gap-8 max-w-[1600px] mx-auto">
              <button onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden w-full py-4 bg-black border border-red-900/40 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#E8B923] mb-4 shadow-[0_0_20px_rgba(200,16,46,0.2)]"
              >
                <Filter size={18} /> {showMobileFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
              </button>

              <aside className={`w-full md:w-[300px] lg:w-[330px] xl:w-[360px] flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
                <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
                  <div className="bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-[1.75rem] border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">

                    {/* Header */}
                    <div className="px-5 pt-5 pb-4 border-b border-white/[0.05] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#C8102E]/10 rounded-xl border border-[#C8102E]/15">
                          <Filter size={15} className="text-[#C8102E]" />
                        </div>
                        <div>
                          <h3 className="font-display text-sm font-black text-white">Filtros</h3>
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest">{filteredStock.length} resultados</p>
                        </div>
                      </div>
                      <AnimatePresence>
                        {activeFilters.length > 0 && (
                          <motion.button initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }}
                            onClick={clearAllFilters}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-[#C8102E] transition-colors">
                            <X size={11} /> Limpiar ({activeFilters.length})
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Active chips */}
                    <AnimatePresence>
                      {activeFilters.length > 0 && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                          style={{ overflow:'hidden' }}>
                          <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
                            {activeFilters.map(f => (
                              <motion.button key={f.key}
                                initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.8, opacity:0 }}
                                onClick={f.onRemove}
                                className="flex items-center gap-1 px-2.5 py-1 bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-full text-[10px] font-bold text-[#E8B923] hover:bg-[#C8102E]/20 transition-all">
                                {f.label} <X size={9} className="text-zinc-500" />
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="px-4 pt-3 pb-3 space-y-0">

                      {/* Búsqueda */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={13} />
                        <input type="text" placeholder="Marca, modelo, año..."
                          className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl py-2.5 pl-9 pr-8 text-xs text-white placeholder:text-zinc-700 focus:border-[#E8B923]/40 focus:bg-white/[0.05] outline-none transition-all"
                          value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        {searchTerm && (
                          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Vehículo */}
                      <FilterSection title="Vehículo" icon={<Car size={13} />}>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Marca</label>
                            <select value={filters.marca} onChange={e => setFilters({ ...filters, marca: e.target.value })}
                              className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2.5 px-3 text-xs font-semibold text-white focus:border-[#E8B923]/40 outline-none transition-all">
                              {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Asesor</label>
                            <select value={selectedSeller} onChange={e => setSelectedSeller(e.target.value)}
                              className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2.5 px-3 text-xs font-semibold text-white focus:border-[#E8B923]/40 outline-none transition-all">
                              {sellers.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">Tipo de venta</label>
                            <div className="flex gap-1.5">
                              {['Todos', 'Propio', 'Consignado'].map(v => (
                                <button key={v} onClick={() => setFilters({ ...filters, tipoVenta: v })}
                                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${filters.tipoVenta === v ? 'bg-[#C8102E] text-white shadow-[0_0_12px_rgba(200,16,46,0.35)]' : 'bg-white/[0.04] text-zinc-500 hover:text-white border border-white/[0.06]'}`}>
                                  {v === 'Todos' ? 'Todos' : v}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </FilterSection>

                      {/* Precio */}
                      <FilterSection title="Precio (CLP)" icon={<Banknote size={13} />}>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1.5">Desde</label>
                              <input type="number" placeholder="0" value={filters.priceMin}
                                onChange={e => setFilters({ ...filters, priceMin: e.target.value })}
                                className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-zinc-700 focus:border-[#E8B923]/40 outline-none transition-all" />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1.5">Hasta</label>
                              <input type="number" placeholder="∞" value={filters.priceMax}
                                onChange={e => setFilters({ ...filters, priceMax: e.target.value })}
                                className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-zinc-700 focus:border-[#E8B923]/40 outline-none transition-all" />
                            </div>
                          </div>
                          {(filters.priceMin || filters.priceMax) && (
                            <p className="text-[10px] text-zinc-500 font-mono text-center tabular-nums">
                              {filters.priceMin ? formatPrice(+filters.priceMin) : '$0'} → {filters.priceMax ? formatPrice(+filters.priceMax) : 'Sin límite'}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {[[5000000,'5M'],[8000000,'8M'],[12000000,'12M'],[20000000,'20M']].map(([v,l]) => (
                              <button key={v} onClick={() => setFilters({ ...filters, priceMax: String(v) })}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${filters.priceMax === String(v) ? 'bg-[#C8102E]/15 text-[#E8B923] border border-[#C8102E]/35' : 'bg-white/[0.03] text-zinc-600 hover:text-zinc-300 border border-white/[0.05]'}`}>
                                ≤ {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </FilterSection>

                      {/* Año */}
                      <FilterSection title="Año" icon={<Calendar size={13} />}>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1.5">Desde</label>
                              <input type="number" placeholder="2015" min="2000" max="2026" value={filters.yearMin}
                                onChange={e => setFilters({ ...filters, yearMin: e.target.value })}
                                className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-zinc-700 focus:border-[#E8B923]/40 outline-none transition-all" />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1.5">Hasta</label>
                              <input type="number" placeholder="2026" min="2000" max="2026" value={filters.yearMax}
                                onChange={e => setFilters({ ...filters, yearMax: e.target.value })}
                                className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-zinc-700 focus:border-[#E8B923]/40 outline-none transition-all" />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[2020,2021,2022,2023,2024].map(y => (
                              <button key={y} onClick={() => setFilters({ ...filters, yearMin: String(y), yearMax: '' })}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${filters.yearMin === String(y) ? 'bg-[#C8102E]/15 text-[#E8B923] border border-[#C8102E]/35' : 'bg-white/[0.03] text-zinc-600 hover:text-zinc-300 border border-white/[0.05]'}`}>
                                {y}+
                              </button>
                            ))}
                          </div>
                        </div>
                      </FilterSection>

                      {/* Kilometraje */}
                      <FilterSection title="Kilometraje" icon={<Gauge size={13} />} defaultOpen={false}>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1.5">Desde</label>
                              <input type="number" placeholder="0" value={filters.kmMin}
                                onChange={e => setFilters({ ...filters, kmMin: e.target.value })}
                                className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-zinc-700 focus:border-[#E8B923]/40 outline-none transition-all" />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1.5">Hasta</label>
                              <input type="number" placeholder="∞" value={filters.kmMax}
                                onChange={e => setFilters({ ...filters, kmMax: e.target.value })}
                                className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-zinc-700 focus:border-[#E8B923]/40 outline-none transition-all" />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[[50000,'50K'],[100000,'100K'],[150000,'150K'],[200000,'200K']].map(([v,l]) => (
                              <button key={v} onClick={() => setFilters({ ...filters, kmMax: String(v) })}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${filters.kmMax === String(v) ? 'bg-[#C8102E]/15 text-[#E8B923] border border-[#C8102E]/35' : 'bg-white/[0.03] text-zinc-600 hover:text-zinc-300 border border-white/[0.05]'}`}>
                                ≤ {l} km
                              </button>
                            ))}
                          </div>
                        </div>
                      </FilterSection>

                      {/* Motor */}
                      <FilterSection title="Motor" icon={<Zap size={13} />} defaultOpen={false}>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-2">Combustible</label>
                            <div className="flex flex-wrap gap-1.5">
                              {[['Todos','Todos'],['Gasolina','Bencina'],['Diesel','Diésel'],['Híbrido','Híbrido'],['Eléctrico','Eléctrico'],['Gas','Gas']].map(([v,l]) => (
                                <button key={v} onClick={() => setFilters({ ...filters, combustible: v })}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${filters.combustible === v ? 'bg-[#C8102E] text-white shadow-[0_0_10px_rgba(200,16,46,0.3)]' : 'bg-white/[0.04] text-zinc-500 hover:text-white border border-white/[0.06]'}`}>
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-2">Transmisión</label>
                            <div className="flex gap-1.5">
                              {[['Todas','Todos'],['Mecánica','Manual'],['Automática','Automático']].map(([v,l]) => (
                                <button key={v} onClick={() => setFilters({ ...filters, transmision: v })}
                                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${filters.transmision === v ? 'bg-[#C8102E] text-white shadow-[0_0_10px_rgba(200,16,46,0.3)]' : 'bg-white/[0.04] text-zinc-500 hover:text-white border border-white/[0.06]'}`}>
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-2">Tracción</label>
                            <div className="flex flex-wrap gap-1.5">
                              {[['Todas','Todos'],['4x2','4×2'],['4x4','4×4'],['AWD','AWD'],['FWD','FWD']].map(([v,l]) => (
                                <button key={v} onClick={() => setFilters({ ...filters, traccion: v })}
                                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${filters.traccion === v ? 'bg-[#C8102E] text-white shadow-[0_0_10px_rgba(200,16,46,0.3)]' : 'bg-white/[0.04] text-zinc-500 hover:text-white border border-white/[0.06]'}`}>
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </FilterSection>

                      {/* Características */}
                      <FilterSection title="Características" icon={<Settings size={13} />} defaultOpen={false}>
                        <div className="space-y-3">
                          {([
                            { label: 'Aire Acondicionado', sub: 'A/C incluido', field: 'aire', onVal: 'Si', offVal: 'Todos' },
                            { label: 'Financiable', sub: 'Con opción de crédito', field: 'financiable', onVal: 'Si', offVal: 'Todos' },
                            { label: '1 Solo Dueño', sub: 'Primer propietario', field: 'duenosMax', onVal: '1', offVal: '' },
                          ] as const).map(({ label, sub, field, onVal, offVal }) => {
                            const isActive = filters[field as keyof typeof filters] === onVal;
                            return (
                              <div key={field} className="flex items-center justify-between py-0.5">
                                <div>
                                  <p className="text-xs font-semibold text-zinc-300">{label}</p>
                                  <p className="text-[9px] text-zinc-600 mt-0.5">{sub}</p>
                                </div>
                                <button
                                  onClick={() => setFilters({ ...filters, [field]: isActive ? offVal : onVal })}
                                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${isActive ? 'bg-[#C8102E] shadow-[0_0_12px_rgba(200,16,46,0.4)]' : 'bg-white/[0.08]'}`}
                                >
                                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${isActive ? 'left-6' : 'left-1'}`} />
                                </button>
                              </div>
                            );
                          })}
                          <div className="flex items-center justify-between py-0.5 pt-1 border-t border-white/[0.05]">
                            <div>
                              <p className="text-xs font-semibold text-zinc-300">Neumáticos</p>
                              <p className="text-[9px] text-zinc-600 mt-0.5">Estado de los neumáticos</p>
                            </div>
                            <select value={filters.neumaticos} onChange={e => setFilters({ ...filters, neumaticos: e.target.value })}
                              className="bg-[#111113] border border-white/[0.07] rounded-xl py-1.5 px-2.5 text-[10px] font-bold text-white focus:border-[#E8B923]/40 outline-none w-28">
                              <option value="Todos">Todos</option>
                              <option value="Nuevos">Nuevos</option>
                              <option value="Buenos">Buenos</option>
                              <option value="Medios">Medios</option>
                            </select>
                          </div>
                        </div>
                      </FilterSection>

                      {/* Reset */}
                      <div className="pt-3 pb-1">
                        <button onClick={clearAllFilters}
                          className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                            activeFilters.length > 0
                              ? 'bg-[#C8102E]/10 border border-[#C8102E]/25 text-[#C8102E] hover:bg-[#C8102E]/20'
                              : 'bg-white/[0.03] border border-white/[0.05] text-zinc-700 cursor-default'
                          }`}>
                          <X size={11} /> Restablecer{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-grow min-w-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-[#C8102E] rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(200,16,46,0.3)]" />
                    <p className="text-[#E8B923] font-black uppercase tracking-[0.3em] animate-pulse text-xs">Preparando catálogo...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Catálogo <span className="text-white">({filteredStock.length} unidades)</span></p>
                    </div>
                    
                    {filteredStock.length > 0 ? (
                      <motion.div variants={containerStagger} initial="hidden" animate="show" layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredStock.map(car => (
                          <motion.div key={car.id} variants={fadeInUpSpring} layout>
                            <CarCard
                              car={car}
                              onClick={car => car.slug ? navigate(`/autos/${car.slug}`) : navigate(`/vehiculo/${car.id}`)}
                              isFavorite={favorites.includes(car.id)}
                              onToggleFavorite={toggleFavorite}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="text-center py-32 bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-inner">
                        <Car size={48} className="mx-auto text-zinc-800 mb-6" />
                        <p className="text-xl font-black text-white mb-2">No hay resultados</p>
                        <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'vendedor') ? (
                <motion.div key="seller-view" variants={pageTransitionVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                  <Suspense fallback={<div className="flex items-center justify-center py-32"><div className="w-10 h-10 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" /></div>}>
                  <SellerPortal
                    stock={stock}
                    onAdd={handleAddCar}
                    onUpdate={handleUpdateCar}
                    onDelete={requestDeleteCar}
                    onBack={() => setCurrentView('catalog')}
                    userRole={user?.role}
                    userId={user?.id}
                  />
                  </Suspense>
                </motion.div>
              ) : (
                <motion.div key="access-denied" variants={pageTransitionVariants} initial="initial" animate="animate" exit="exit" className="w-full h-[60vh] flex items-center justify-center">
                  <div className="text-center bg-[#0a0a0a] p-12 rounded-[3rem] border border-red-900/30">
                    <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                       <X size={32} className="text-[#C8102E]" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3">Acceso Restringido</h2>
                    <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">Área exclusiva para asesores y administración.</p>
                    <button onClick={() => setCurrentView('catalog')} className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-[#E8B923] text-black hover:bg-[#FFE65F]">
                      Volver al Catálogo
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      <Footer />

     <AnimatePresence>
        {selectedCar && (
          <CarModal
            car={selectedCar}
            onClose={() => {
              setSelectedCar(null);
              navigate('/', { replace: true });
            }}
            onContact={handleContact}
            onOpenFinance={() => setFinanceCar(selectedCar)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {financeCar && <FinanceModal car={financeCar} onClose={() => setFinanceCar(null)} />}
        <AnimatePresence>{showGenericFinance && <GenericFinanceModal onClose={() => setShowGenericFinance(false)} />}</AnimatePresence>
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title="¿Eliminar Vehículo?"
        message="Esta acción no se puede deshacer. El vehículo será eliminado permanentemente de la base de datos."
        type="danger"
        confirmText="Eliminar Definitivamente"
        onCancel={() => setConfirmDialog({ isOpen: false, idToDelete: null })}
        onConfirm={executeDeleteCar}
      />

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-5 right-5 sm:bottom-10 sm:right-10 z-[100] max-w-[90%] bg-[#121212] text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center gap-5 border border-white/10"
          >
            <div className="p-3 bg-[#C8102E]/20 rounded-xl">
               <MessageCircle size={24} className="shrink-0 text-[#C8102E]" />
            </div>
            <div>
              <p className="font-black text-sm text-white">{notification.message}</p>
              <p className="text-[11px] text-gray-400 mt-1">{notification.sub}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E8B923; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes shineText {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}

export default App;