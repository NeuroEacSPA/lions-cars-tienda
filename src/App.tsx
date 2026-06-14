import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import SellerPortal from './components/SellerPortal';
import { Background3D } from './components/Background3D';
import { ConfirmModal } from './components/ConfirmModal';
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
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#E8B923] rounded-full shadow-[0_0_10px_#E8B923]"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: Math.random() * 0.5 + 0.1,
            scale: Math.random() * 1.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 50],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            ease: "linear",
          }}
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
          LIONS<span className="text-[#E8B923]">CARS</span>
        </p>
        <p className="text-zinc-500 text-[10px] mt-2 font-bold uppercase tracking-widest animate-pulse">
          Cargando experiencia...
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
          src={images[currentIndex] || 'public/web1.png'}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="w-full h-full object-cover transform transition-transform duration-[10s] group-hover:scale-110"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600/121212/e8b923?text=No+disponible'; }}
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
    : car.imagen ? [car.imagen] : ['https://via.placeholder.com/800x600/121212/e8b923?text=Lions+Cars'];

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
                  {car.vendedor ? car.vendedor.split(' ')[0] : 'Lions'}
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

// ── CAR MODAL ─────────────────────────────────────────────────
const CarModal = ({
  car, onClose, onContact, onOpenFinance
}: {
  car: Vehiculo;
  onClose: () => void;
  onContact: (c: Vehiculo) => void;
  onOpenFinance: () => void;
}) => {
  type TabType = 'EXTERIOR' | 'INTERIOR';
  const [activeTab, setActiveTab] = useState<TabType>('EXTERIOR');
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const images = Array.isArray(car.imagenes) && car.imagenes.length > 0
    ? car.imagenes
    : [car.imagen || 'https://via.placeholder.com/800x600/121212/e8b923?text=Lions+Cars'];
  const splitIndex = Math.ceil(images.length / 2);
  const exteriorImages = images.slice(0, splitIndex);
  const interiorImages = images.slice(splitIndex);
  const activeImages = activeTab === 'INTERIOR' && interiorImages.length > 0 ? interiorImages : exteriorImages;
  const currentImage = activeImages[currentImgIdx] || images[0];

  const shareUrl = car.slug
    ? `https://lionscars.cl/autos/${car.slug}`
    : `https://lionscars.cl/vehiculo/${car.id}`;

  const handleTabChange = (tab: TabType) => { setActiveTab(tab); setCurrentImgIdx(0); setIsZoomed(false); };
  const goToPrevImage = () => setCurrentImgIdx(p => p > 0 ? p - 1 : activeImages.length - 1);
  const goToNextImage = () => setCurrentImgIdx(p => p < activeImages.length - 1 ? p + 1 : 0);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${car.marca} ${car.modelo} ${car.ano} — Lions Cars`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevImage();
      if (e.key === 'ArrowRight') goToNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, activeImages]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black sm:bg-black/95 sm:backdrop-blur-xl sm:p-2 md:p-6 font-sans overflow-hidden"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C8102E]/20 via-black to-black pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[1600px] h-[100dvh] sm:h-[95vh] bg-[#0a0a0c] sm:border border-red-900/30 sm:rounded-2xl sm:shadow-[0_0_100px_rgba(200,16,46,0.2)] flex flex-col lg:flex-row overflow-hidden"
      >
        {/* IMÁGENES */}
        <div className="w-full lg:w-[65%] h-[40vh] sm:h-[50vh] lg:h-full relative flex flex-col bg-black shrink-0">
          <div className="absolute top-0 left-0 w-full z-20 p-4 sm:p-6 flex justify-between items-start pointer-events-none">
            <div className="flex gap-4 pointer-events-auto">
              <div className="flex bg-black/60 backdrop-blur-md border border-red-900/40 rounded-xl p-1.5 scale-90 origin-top-left sm:scale-100 shadow-lg">
                {(['EXTERIOR', 'INTERIOR'] as TabType[]).map(tab => (
                  <button key={tab} onClick={() => handleTabChange(tab)}
                    className={`px-4 sm:px-5 py-2 text-[9px] sm:text-[11px] font-bold tracking-widest transition-all rounded-lg ${activeTab === tab ? 'bg-[#E8B923] text-black shadow-[0_0_15px_rgba(232,185,35,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >{tab}</button>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="pointer-events-auto p-2.5 bg-black/60 rounded-full text-white sm:hidden backdrop-blur-md border border-white/10 hover:bg-[#C8102E] transition-all">
              <X size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-[#C8102E]/20 border border-[#C8102E]/40 px-4 py-1.5 rounded-full animate-pulse pointer-events-auto shadow-[0_0_15px_rgba(200,16,46,0.3)]">
              <div className="w-2 h-2 bg-[#C8102E] rounded-full shadow-[0_0_5px_#C8102E]" />
              <span className="text-[10px] text-[#E8B923] font-bold uppercase tracking-wider">15 Personas viendo</span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center group bg-gradient-to-b from-zinc-900 to-black">
            <AnimatePresence mode="wait">
              <motion.img
                key={`${activeTab}-${currentImgIdx}`}
                src={currentImage}
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className={`w-full h-full object-contain transition-transform duration-700 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={() => setIsZoomed(!isZoomed)}
                loading="lazy"
                alt={`${car.marca} ${car.modelo} ${car.ano}`}
                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600/121212/e8b923?text=Error+Imagen'; }}
              />
            </AnimatePresence>
         

            {!isZoomed && car.hotspots?.filter((h: Hotspot) =>
              h.imageIndex === currentImgIdx || (h.imageIndex === undefined && currentImgIdx === 0)
            ).map((spot: Hotspot) => (
              <motion.div key={spot.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute w-6 h-6 -ml-3 -mt-3 z-30 cursor-pointer group/hotspot"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8B923] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-6 w-6 bg-[#C8102E] border-2 border-[#E8B923] items-center justify-center shadow-[0_0_15px_rgba(232,185,35,0.6)]">
                  <span className="w-1.5 h-1.5 bg-[#E8B923] rounded-full" />
                </span>
                <div className="absolute left-1/2 -translate-x-1/2 top-8 lg:left-full lg:top-1/2 lg:-translate-y-1/2 lg:ml-4 w-48 sm:w-56 bg-black/95 backdrop-blur-xl border border-red-900/50 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] opacity-0 group-hover/hotspot:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                  <p className="text-[10px] text-[#E8B923] font-black uppercase tracking-[0.2em] mb-1.5">{spot.label}</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{spot.detail}</p>
                </div>
              </motion.div>
            ))}

            <button onClick={goToPrevImage} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-[#C8102E] hover:scale-110 transition-all border border-red-900/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-40 backdrop-blur-md">
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToNextImage} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-[#C8102E] hover:scale-110 transition-all border border-red-900/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-40 backdrop-blur-md">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="h-20 sm:h-28 bg-[#030303] border-t border-red-900/30 flex items-center gap-3 px-4 sm:px-6 overflow-x-auto scrollbar-hide py-3">
            {activeImages.map((img: string, idx: number) => (
              <button key={idx} onClick={() => setCurrentImgIdx(idx)}
                className={`relative flex-shrink-0 w-24 sm:w-32 h-14 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${currentImgIdx === idx ? 'border-[#E8B923] scale-105 shadow-[0_0_20px_rgba(232,185,35,0.4)]' : 'border-transparent opacity-50 hover:opacity-100 hover:border-red-900/50'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Vista ${idx + 1}`} loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x100/121212/e8b923?text=Error'; }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* INFORMACIÓN */}
        <div className="w-full lg:w-[35%] flex-1 lg:h-full min-h-0 flex flex-col bg-[#0a0a0c] border-l border-red-900/30 relative">
          <button onClick={onClose} className="hidden sm:block absolute top-6 right-6 z-50 text-gray-500 hover:text-[#C8102E] hover:rotate-90 transition-all duration-300 bg-black/50 p-2 rounded-full border border-white/5">
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 md:p-10">
            <div className="mb-8 border-b border-red-900/20 pb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#E8B923] text-xs font-black uppercase tracking-[0.4em]">{car.marca}</h3>
                <button onClick={handleShare} className="p-2.5 rounded-xl bg-black hover:bg-red-900/30 text-gray-400 hover:text-white transition-all border border-red-900/30 shadow-sm" title="Compartir">
                  <Share2 size={16} />
                </button>
              </div>
             <motion.h2 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-4xl sm:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter mb-5 leading-none"
              >
                {car.modelo}
              </motion.h2>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                <motion.span 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl font-black text-[#E8B923] drop-shadow-[0_2px_10px_rgba(232,185,35,0.3)]"
                >
                  {formatPrice(car.precio)}
                </motion.span>
                {car.estado === 'Disponible' && (
                  <span className="bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/40 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-1 shadow-[0_0_10px_rgba(200,16,46,0.1)]">
                    Entrega Inmediata
                  </span>
                )}
              </div>
              {car.slug && (
                <p className="text-[10px] text-zinc-600 mt-4 font-mono truncate">lionscars.cl/autos/{car.slug}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                { Icon: RefreshCw, color: 'text-[#C8102E]', label: 'Retoma', val: 'Recibimos tu Auto' },
                { Icon: User, color: 'text-[#E8B923]', label: 'Dueños', val: `${car.duenos} Propietario${car.duenos > 1 ? 's' : ''}` },
                { Icon: FileCheck, color: 'text-[#C8102E]', label: 'Papeles', val: 'Al Día 2026' },
                { Icon: Settings, color: 'text-[#E8B923]', label: 'Inspección', val: 'Aprobada' },
              ].map(({ Icon, color, label, val }) => (
                <div key={label} className="bg-black border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-red-900/40 hover:bg-red-900/5 transition-all shadow-lg">
                  <div className={`p-2 rounded-xl bg-white/5 ${color} shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{label}</p>
                    <p className="text-[11px] text-white font-bold truncate mt-0.5">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-[11px] text-[#C8102E] font-black uppercase tracking-[0.3em] mb-5 flex items-center gap-3">
              <Settings2 size={14} /> Ficha Técnica
            </h4>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10 bg-black/40 p-5 rounded-3xl border border-white/5">
              {[
                { label: 'Año', val: car.ano, icon: Calendar },
               { label: 'Kilometraje', val: `${car.km?.toLocaleString() || 0} KM`, icon: Gauge },
                { label: 'Combustible', val: car.combustible, icon: Fuel },
                { label: 'Transmisión', val: car.transmision, icon: Settings2 },
                { label: 'Motor', val: car.motor || car.cilindrada || 'N/A', icon: Zap },
                { label: 'Tracción', val: car.traccion || '4x2', icon: Activity },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#121212] rounded-xl text-[#E8B923] border border-red-900/20 shrink-0 shadow-inner">
                    <item.icon size={16} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{item.label}</p>
                    <p className="text-sm text-white font-black truncate">{String(item.val)}</p>
                  </div>
                </div>
              ))}
            </div>

            {car.financiable && (
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a0505] to-black border border-[#C8102E]/40 p-6 sm:p-8 mb-10 hover:border-[#E8B923]/50 transition-all group">
                <div className="absolute top-0 right-0 p-3 bg-gradient-to-r from-[#E8B923] to-[#DAA520] text-black text-[9px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg">Oportunidad</div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#C8102E]/20 blur-3xl rounded-full pointer-events-none group-hover:bg-[#E8B923]/20 transition-colors" />
                
                <p className="text-[10px] text-[#E8B923] font-black uppercase tracking-[0.3em] mb-2 relative z-10">Financiamiento Flexible</p>
                <div className="flex items-end gap-2 mb-3 relative z-10">
                  <span className="text-4xl sm:text-5xl font-black text-white italic drop-shadow-lg">24/48</span>
                  <span className="text-sm font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Cuotas</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed relative z-10 mb-6">
                  Llévatelo con un pie desde <span className="text-white font-black bg-[#C8102E]/20 px-2 py-0.5 rounded">{formatPrice(car.valorPie || car.precio * 0.2)}</span>. Evaluación express en 15 minutos.
                </p>
                <button onClick={onOpenFinance} className="w-full py-4 bg-black hover:bg-zinc-900 border border-[#E8B923]/50 text-[#E8B923] text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-3 relative z-10 shadow-[0_0_20px_rgba(232,185,35,0.1)] hover:shadow-[0_0_30px_rgba(232,185,35,0.3)]">
                  <Calculator size={16} /> Simular Crédito Automotriz
                </button>
              </div>
            )}

            <div className="mb-10 flex flex-col gap-4">
              <div className="p-5 bg-gradient-to-r from-black to-[#0a0a0a] rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-red-900/40 transition-all shadow-lg">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white p-1.5 rounded-xl shrink-0 border-2 border-[#E8B923] shadow-[0_0_15px_rgba(232,185,35,0.3)] group-hover:scale-105 transition-transform">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
                      alt="QR Code" className="w-full h-full" loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white flex items-center gap-2 tracking-wide"><Smartphone size={16} className="text-[#C8102E]" /> Ficha Digital</p>
                    <p className="text-[11px] text-gray-400 mt-1">Escanea para llevar en tu móvil</p>
                  </div>
                </div>
                <div className="bg-[#C8102E]/10 p-3 rounded-2xl text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-all shadow-inner">
                  <QrCode size={22} />
                </div>
              </div>

              <PDFDownloadLink
                document={<CarPdfDocument car={car} />}
                fileName={`Ficha_LionsCars_${car.marca}_${car.modelo}.pdf`}
                className="w-full"
              >
                {/* @ts-ignore */}
                {({ loading }) => (
                  <button disabled={loading} className="w-full py-4 bg-[#121212] hover:bg-black disabled:bg-black disabled:cursor-not-allowed border border-red-900/30 text-white rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-[0_0_20px_rgba(200,16,46,0.3)] group">
                    {loading
                      ? <><div className="w-5 h-5 border-2 border-[#E8B923] border-t-transparent rounded-full animate-spin" /><span>Generando PDF...</span></>
                      : <><FileDown size={20} className="text-[#E8B923] group-hover:animate-bounce" /> Descargar Ficha Técnica PDF</>
                    }
                  </button>
                )}
              </PDFDownloadLink>
            </div>

            <div className="mb-8 p-6 bg-black/40 border border-[#E8B923]/20 rounded-3xl relative overflow-hidden">
               <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#E8B923]/5 blur-3xl rounded-full pointer-events-none" />
              <h4 className="text-[10px] text-[#E8B923] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Eye size={14} className="text-[#E8B923]" /> Métricas de Interés
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#050505] p-4 rounded-2xl border border-white/5 shadow-inner">
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1.5">Vistas totales</p>
                  <p className="text-2xl font-black text-white">{car.vistas || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-[#1a1a00] to-black p-4 rounded-2xl border border-[#E8B923]/30 shadow-inner">
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1.5">Interesados</p>
                  <p className="text-2xl font-black text-[#E8B923]">{car.interesados || 0}</p>
                </div>
              </div>
            </div>

            <div className="mb-4 bg-[#0a0a0a] p-6 rounded-3xl border border-white/5">
              <h4 className="text-[10px] text-[#C8102E] font-black uppercase tracking-[0.3em] mb-3">Observaciones del experto</h4>
              <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-[#E8B923] pl-4 italic font-medium">
                "{car.obs || 'Vehículo en excelentes condiciones, listo para transferir.'}"
              </p>
            </div>
            <div className="h-8" />
          </div>

          <div className="shrink-0 w-full bg-black/90 backdrop-blur-2xl border-t border-red-900/50 p-5 sm:p-8 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
            <button onClick={() => onContact(car)}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#C8102E] via-[#ff1a3c] to-[#C8102E] text-white font-black text-xs sm:text-sm uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(200,16,46,0.5)] hover:shadow-[0_0_50px_rgba(200,16,46,0.8)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              {/* Animación de brillo barriendo el botón */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <MessageCircle size={22} className="relative z-10 group-hover:scale-110 transition-transform" /> 
              <span className="relative z-10">Contactar Vendedor</span>
            </button>
            <p className="text-center text-[9px] text-gray-500 mt-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Respuesta promedio: 5 Minutos
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
            <span className="text-white font-black text-2xl tracking-tighter uppercase drop-shadow-md">LIONS<span className="text-[#E8B923]">CARS</span></span>
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
        <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em]">© 2026 LIONS CARS - MULTISERVICIOS DEL SUR</p>
        <div className="flex gap-6">
          <motion.div whileHover={{ scale: 1.2, y: -2 }} className="text-zinc-500 hover:text-[#E8B923] cursor-pointer transition-colors"><Share2 size={18} /></motion.div>
          <motion.div whileHover={{ scale: 1.2, y: -2 }} className="text-zinc-500 hover:text-[#C8102E] cursor-pointer transition-colors"><Heart size={18} /></motion.div>
        </div>
      </div>
    </div>
  </footer>
);

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
        <motion.header
          initial={{ y: -100 }} animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="sticky top-0 z-50 bg-black/80 backdrop-blur-3xl border-b border-red-900/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
        >
          <div className="w-full bg-[#0a0a0a] border-b border-white/5 hidden sm:block">
            <div className="w-full px-6 py-2">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider">
                <div className="hidden lg:flex items-center gap-2 text-[#E8B923]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span>Av. Gabriela Mistral 925, Puerto Montt, Chile</span>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <a href="https://wa.me/56958016208" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-400 hover:text-[#E8B923] transition-colors">
                    <MessageCircle size={14} className="text-[#C8102E]" /><span>+56 9 58016208</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => { setCurrentView('catalog'); navigate('/'); }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="font-display text-2xl sm:text-3xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] tracking-tighter">LIONS<span className="text-[#E8B923]">CARS</span></span>
            </motion.div>
            <div className="flex items-center gap-3 sm:gap-5">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <motion.button whileHover={{ scale: 1.05 }}
                      onClick={() => setCurrentView(currentView === 'catalog' ? 'seller' : 'catalog')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(200,16,46,0.3)] ${currentView === 'catalog' ? 'bg-gradient-to-r from-[#C8102E] to-[#990000] text-white border border-[#ff3333]/30' : 'bg-black text-[#E8B923] border border-[#E8B923]/50 hover:bg-[#E8B923]/10'}`}
                    >
                      {currentView === 'catalog'
                        ? <><LayoutDashboard size={16} /><span className="hidden sm:inline">Panel Admin</span></>
                        : <><ArrowLeft size={16} /><span className="hidden sm:inline">Volver</span></>
                      }
                    </motion.button>
                  )}
                  <UserMenu onAdminClick={() => setCurrentView('seller')} />
                </>
              ) : (
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] bg-gradient-to-r from-[#C8102E] to-red-800 text-white shadow-[0_0_25px_rgba(200,16,46,0.5)] border border-[#ff4d4d]/30 relative overflow-hidden group"
                >
                   <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <User size={16} className="relative z-10" />
                  <span className="hidden sm:inline relative z-10">Acceso VIP</span>
                  <span className="sm:hidden relative z-10">Login</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.header>

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}

        {currentView === 'catalog' && (
          <section className="relative min-h-[75vh] w-full bg-[#050505] overflow-hidden flex items-center">
            
            {/* BACKGROUND IMAGE - WITH ULTRA PREMIUM FALLBACK & OBJECT-COVER */}
            <motion.div 
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src="/web3.jpg" 
                alt="Lions Cars — Garaje Premium" 
                className="w-full h-full object-cover object-right md:object-center opacity-80" 
                onError={(e) => {
                  // Si no carga la local, carga un fallback de super lujo
                  e.currentTarget.src = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=2069";
                }}
              />
            </motion.div>
            
            {/* GRADIENT OVERLAYS TO MERGE IMAGE WITH BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 md:via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30" />
            
            {/* SUBTLE GLOWS */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(200,16,46,0.15),_transparent_40%)]" />

            <Background3D />
            {/* FLOATING SPARKLES ANIMATION */}
            <Sparkles />
            
            {/* CONTENT */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 lg:pt-0">
              <motion.div 
                variants={containerStagger} 
                initial="hidden" 
                animate="show" 
                className="max-w-2xl bg-black/40 p-8 sm:p-10 md:p-12 rounded-[2.5rem] backdrop-blur-xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(200,16,46,0.15)]"
              >
                <motion.div variants={fadeInUpSpring} className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-[2px] bg-[#E8B923]" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#E8B923]">
                    Exclusividad Automotriz
                  </span>
                </motion.div>
                
                <motion.h1 variants={fadeInUpSpring} className="font-display text-5xl sm:text-6xl md:text-7xl font-black italic leading-[0.95] text-white mb-6 drop-shadow-2xl">
                  <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#E8B923,45%,#FFE65F,55%,#E8B923)] bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">LIONS</span>
                  <br />
                  <span className="text-[#C8102E] drop-shadow-[0_0_20px_rgba(200,16,46,0.5)]">AUTOMOTRIZ</span>
                </motion.h1>
                
                <motion.p variants={fadeInUpSpring} className="text-gray-300 text-sm md:text-lg mb-8 leading-relaxed max-w-lg font-medium">
                  Vehículos seminuevos rigurosamente seleccionados e inspeccionados. 
                  <span className="text-white font-black"> Compra y vende seguro. Marcamos el estándar de la diferencia.</span>
                </motion.p>
                
                <motion.div variants={fadeInUpSpring} className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 bg-gradient-to-r from-[#C8102E] to-red-800 text-white border border-[#ff4d4d]/30 font-black uppercase text-xs tracking-[0.2em] rounded-xl shadow-[0_0_30px_rgba(200,16,46,0.4)] hover:shadow-[0_0_40px_rgba(200,16,46,0.7)] hover:scale-[1.02] transition-all relative overflow-hidden group">
                     <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative z-10">Catálogo Premium</span>
                  </button>
                  <button className="px-8 py-4 bg-black/60 backdrop-blur-md border border-[#E8B923]/50 text-[#E8B923] font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-[#E8B923]/10 transition-all hover:shadow-[0_0_20px_rgba(232,185,35,0.2)]">
                    Simular Crédito
                  </button>
                </motion.div>
                
                <motion.div variants={containerStagger} className="flex flex-wrap gap-5 sm:gap-8 mt-10 border-t border-white/10 pt-8">
                  {[
                    { text: 'Garantía Extendida', color: 'bg-[#E8B923]' },
                    { text: 'Financiamiento Flexible', color: 'bg-[#C8102E]' },
                    { text: 'Inspección 360°', color: 'bg-white' }
                  ].map(t => (
                    <motion.div key={t.text} variants={fadeInUpSpring} className="flex items-center gap-3 text-xs font-bold text-gray-300">
                      <span className={`w-2 h-2 ${t.color} rounded-full shadow-[0_0_8px_${t.color}]`} />{t.text}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}
      </div>

      <main className="w-full px-4 sm:px-6 pb-20 min-h-[600px] mt-12">
        <AnimatePresence mode="wait">
          {currentView === 'catalog' ? (
            <motion.div key="catalog-view" variants={pageTransitionVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col md:flex-row gap-8 max-w-[1600px] mx-auto">
              <button onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden w-full py-4 bg-black border border-red-900/40 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#E8B923] mb-4 shadow-[0_0_20px_rgba(200,16,46,0.2)]"
              >
                <Filter size={18} /> {showMobileFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
              </button>

              <aside className={`w-full md:w-[320px] lg:w-[350px] flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
                <div className="sticky top-32">
                  <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl p-6 rounded-[2rem] border border-red-900/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-white border-b border-white/5 pb-4">
                      <Filter size={18} className="text-[#C8102E]" /> Refinar Búsqueda
                    </h3>
                    
                    <div className="relative mb-5">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8102E]" size={16} />
                      <input type="text" placeholder="Buscar modelo o año..." className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:border-[#E8B923] focus:shadow-[0_0_15px_rgba(232,185,35,0.2)] transition-all outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">Marca</label>
                          <select value={filters.marca} onChange={e => setFilters({ ...filters, marca: e.target.value })} className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 px-3 text-xs font-bold text-white cursor-pointer focus:border-[#E8B923] outline-none transition-all">
                            {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">Asesor</label>
                          <select value={selectedSeller} onChange={e => setSelectedSeller(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 px-3 text-xs font-bold text-white cursor-pointer focus:border-[#E8B923] outline-none transition-all">
                            {sellers.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-1">Rango de Precio</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" placeholder="Mínimo" value={filters.priceMin} onChange={e => setFilters({ ...filters, priceMin: e.target.value })} className="bg-[#121212] border border-white/10 rounded-xl py-3 px-3 text-xs font-bold text-white focus:border-[#E8B923] outline-none transition-all" />
                          <input type="number" placeholder="Máximo" value={filters.priceMax} onChange={e => setFilters({ ...filters, priceMax: e.target.value })} className="bg-[#121212] border border-white/10 rounded-xl py-3 px-3 text-xs font-bold text-white focus:border-[#E8B923] outline-none transition-all" />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <label className="text-[9px] font-black text-[#E8B923] uppercase tracking-[0.2em] block mb-4">Especificaciones</label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: '4x4', field: 'traccion', onVal: '4x4', offVal: 'Todas' },
                            { label: 'A/C', field: 'aire', onVal: 'Si', offVal: 'Todos' },
                            { label: 'Financ.', field: 'financiable', onVal: 'Si', offVal: 'Todos' },
                            { label: 'Propio', field: 'tipoVenta', onVal: 'Propio', offVal: 'Todos' },
                          ].map(({ label, field, onVal, offVal }) => (
                            <label key={label} className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative flex items-center justify-center w-5 h-5">
                                <input type="checkbox"
                                  checked={filters[field as keyof typeof filters] === onVal}
                                  onChange={e => setFilters({ ...filters, [field]: e.target.checked ? onVal : offVal })}
                                  className="peer appearance-none w-5 h-5 border-2 border-zinc-700 rounded bg-[#121212] checked:bg-[#C8102E] checked:border-[#C8102E] transition-all cursor-pointer"
                                />
                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                                  <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <button onClick={clearAllFilters} className="w-full mt-6 bg-transparent border border-[#555] text-gray-400 font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all text-[10px] flex items-center justify-center gap-2 hover:border-white hover:text-white">
                        Restablecer Filtros
                      </button>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-grow">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-[#C8102E] rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(200,16,46,0.3)]" />
                    <p className="text-[#E8B923] font-black uppercase tracking-[0.3em] animate-pulse text-xs">Alineando Flota...</p>
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
                  <SellerPortal
                    stock={stock}
                    onAdd={handleAddCar}
                    onUpdate={handleUpdateCar}
                    onDelete={requestDeleteCar}
                    onBack={() => setCurrentView('catalog')}
                    userRole={user?.role}
                    userId={user?.id}
                  />
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
      `}</style>
    </div>
  );
}

export default App;