import React, { useState, useMemo, useEffect } from 'react';
import {
  Car, Calendar, Gauge, Fuel, Settings2, 
  Search, X, MessageCircle, ChevronRight,
  Filter, Heart, Share2, LayoutDashboard, ArrowLeft,
  ShieldCheck, User, FileCheck, Settings, Zap, Activity, Star,ChevronLeft,
  QrCode, Smartphone, Calculator, Percent, CreditCard, Banknote
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from 'framer-motion';

// --- IMPORTACIÓN DEL COMPONENTE VENDEDOR ---
import SellerPortal from './components/SellerPortal';

// --- COLORES DE MARCA LIONS CARS ---
const GOLD_MAIN = '#E8B923';

// --- UTILIDADES Y TIPOS ---

const createImageArray = (folder: string, count: number) => {
  const normFolder = folder.toLowerCase().replace(/[^a-z0-9-_]/g, '').replace(/\s+/g, '-');
  return Array.from({ length: count }, (_, i) => `/autoefec/${normFolder}/${i + 1}.jpg`);
};

// ===== INTERFACES CORREGIDAS (COINCIDEN CON SELLERPORTAL) =====
export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
  imageIndex?: number;
}

export interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  version?: string; // Ahora es Opcional (?) para coincidir con SellerPortal
  ano: number;
  precio: number;
  km: number;
  duenos: number;
  traccion?: string;
  transmision: string;
  cilindrada?: string;
  combustible: string;
  carroceria: string; // Ahora es Obligatorio (sin ?)
  puertas: number;
  pasajeros: number;
  motor?: string;
  techo: boolean;
  asientos: string;
  tipoVenta: 'Propio' | 'Consignado';
  vendedor: string;
  financiable: boolean;
  valorPie: number;
  aire: boolean;
  neumaticos: string;
  llaves: number;
  obs: string;
  imagenes: string[];
  imagen: string; // Obligatorio
  estado: 'Disponible' | 'Reservado' | 'Vendido';
  diasStock: number;
  vistas: number;
  interesados: number;
  patente: string;
  color: string;
  comisionEstimada: number;
  precioHistorial: { date: string; price: number; }[];
  hotspots: Hotspot[];
}

interface CarCardProps {
  car: Vehiculo;
  onClick: (c: Vehiculo) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: number) => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price || 0);

// --- DATOS INICIALES CORREGIDOS (RELLENADOS) ---

const stockInicial: Vehiculo[] = [
  {
    id: 1, marca: "CITROEN", modelo: "BERLINGO", version: "Multispace",
    ano: 2020, precio: 10990000, km: 140000, duenos: 1, traccion: "Delantera",
    transmision: "Automática CVT", cilindrada: "1.0L Turbo", combustible: "Diesel",
    carroceria: "Furgón", puertas: 5, pasajeros: 5, motor: "1.6 HDI", techo: false, asientos: "Tela",
    tipoVenta: "Propio", vendedor: "Carlos Pérez", financiable: true, valorPie: 4000000,
    aire: true, neumaticos: "Nuevos", llaves: 2,
    estado: "Disponible", imagen: "", // Se llena en loadStock
    obs: "Vehículo seminuevo, garantía de marca vigente",
    imagenes: createImageArray("CITROEN-BERLINGO", 8),
    diasStock: 12, vistas: 450, interesados: 12, patente: "LZ-22-33", color: "Blanco",
    comisionEstimada: 219800, precioHistorial: [], hotspots: []
  },
  {
    id: 2, marca: "FORD", modelo: "F150", version: "5.0 Lariat",
    ano: 2024, precio: 44990000, km: 35000, duenos: 1, traccion: "4x4",
    transmision: "Automática", cilindrada: "3.5L Twin-Turbo", combustible: "Gasolina",
    carroceria: "Camioneta", puertas: 4, pasajeros: 5, motor: "V8 5.0", techo: true, asientos: "Cuero",
    tipoVenta: "Propio", vendedor: "Carlos Pérez", financiable: true, valorPie: 15000000,
    aire: true, neumaticos: "Nuevos", llaves: 2,
    estado: "Disponible", imagen: "",
    obs: "Unidad en estado de vitrina.",
    imagenes: createImageArray("FORD-F150", 9),
    diasStock: 5, vistas: 1200, interesados: 45, patente: "PP-WW-11", color: "Negro",
    comisionEstimada: 899800, precioHistorial: [], hotspots: []
  },
  {
    id: 3, marca: "HYUNDAI", modelo: "GRAND-I10-GLS", version: "1.2",
    ano: 2018, precio: 6790000, km: 85000, duenos: 2, traccion: "Delantera",
    transmision: "Mecánica 6V", cilindrada: "2.4L Diesel", combustible: "Diesel",
    carroceria: "Hatchback", puertas: 5, pasajeros: 5, motor: "1.2L", techo: false, asientos: "Tela",
    tipoVenta: "Consignado", vendedor: "María González", financiable: true, valorPie: 2000000,
    aire: true, neumaticos: "Media vida", llaves: 1,
    estado: "Disponible", imagen: "",
    obs: "Mecánicamente impecable. Uso mayoritario en carretera. Ideal para trabajo pesado.",
    imagenes: createImageArray("HYUNDAI -GRAND-I10-GLS", 8),
    diasStock: 30, vistas: 150, interesados: 5, patente: "JJ-KK-99", color: "Gris Plata",
    comisionEstimada: 135800, precioHistorial: [], hotspots: []
  },
  {
    id: 4, marca: "HYUNDAI", modelo: "TUCSON", version: "M Sport",
    ano: 2015, precio: 8900000, km: 41000, duenos: 1, traccion: "Trasera",
    transmision: "Mecanica", cilindrada: "2.0L Turbo", combustible: "Gasolina",
    carroceria: "SUV", puertas: 5, pasajeros: 5, motor: "2.0L", techo: false, asientos: "Tela",
    tipoVenta: "Propio", vendedor: "Alex Hernandez", financiable: true, valorPie: 20000000,
    aire: true, neumaticos: "Buen estado", llaves: 2,
    estado: "Disponible", imagen: "",
    obs: "Solo uso fin de semana. Láminas certificadas. Garantía vigente. Paquete M completo.",
    imagenes: createImageArray("HYUNDAI-TUCSON", 8),
    diasStock: 15, vistas: 600, interesados: 20, patente: "TT-RR-44", color: "Blanco",
    comisionEstimada: 178000, precioHistorial: [], hotspots: []
  },
  {
    id: 5, marca: "MAXUS", modelo: "T60", version: "2.8 turbo diesel",
    ano: 2018, precio: 13900000, km: 44000, duenos: 2, traccion: "Delantera",
    transmision: "Automática", cilindrada: "1.6L BlueHDi", combustible: "Diesel",
    carroceria: "Camioneta", puertas: 4, pasajeros: 5, motor: "2.8L Turbo", techo: false, asientos: "Cuero",
    tipoVenta: "Consignado", vendedor: "Roberto Diaz", financiable: false, valorPie: 4000000,
    aire: true, neumaticos: "Nuevos", llaves: 2,
    estado: "Disponible", imagen: "",
    obs: "Consignación virtual. El dueño lo muestra en su domicilio. Techo panorámico.",
    imagenes: createImageArray("MAXUS-T60", 9),
    diasStock: 40, vistas: 300, interesados: 8, patente: "BB-CC-11", color: "Rojo",
    comisionEstimada: 278000, precioHistorial: [], hotspots: []
  },
  {
    id: 6, marca: "NISSAN", modelo: "NAVARA", version: "2.3",
    ano: 2023, precio: 20990000, km: 55000, duenos: 3, traccion: "4x4",
    transmision: "Automática", cilindrada: "3.6L V6", combustible: "Diesel",
    carroceria: "Camioneta", puertas: 4, pasajeros: 5, motor: "2.3L Twin-Turbo", techo: false, asientos: "Tela",
    tipoVenta: "Consignado", vendedor: "María González", financiable: true, valorPie: 12000000,
    aire: true, neumaticos: "Off-road 35''", llaves: 1,
    estado: "Disponible", imagen: "",
    obs: "Equipamiento extra: Winche, suspensión elevada Fox, focos LED. Listo para aventura.",
    imagenes: createImageArray("NISSAN-NAVARA", 8),
    diasStock: 8, vistas: 900, interesados: 35, patente: "NN-VV-66", color: "Gris Grafito",
    comisionEstimada: 419800, precioHistorial: [], hotspots: []
  },
  {
    id: 7, marca: "PEUGEOT", modelo: "208", version: "Z71 Trail Boss",
    ano: 2020, precio: 42500000, km: 45000, duenos: 1, traccion: "4x4",
    transmision: "Automática 10V", cilindrada: "5.3L V8", combustible: "Gasolina",
    carroceria: "Hatchback", puertas: 5, pasajeros: 5, motor: "1.2L PureTech", techo: true, asientos: "Cuero",
    tipoVenta: "Propio", vendedor: "Alex Hernandez", financiable: true, valorPie: 14000000,
    aire: true, neumaticos: "Nuevos M/T", llaves: 2,
    estado: "Disponible", imagen: "",
    obs: "Potencia americana pura. Suspensión rancho de fábrica. Pisaderas eléctricas.",
    imagenes: createImageArray("PEUGEOT-208", 7),
    diasStock: 3, vistas: 1500, interesados: 60, patente: "PG-20-08", color: "Amarillo",
    comisionEstimada: 850000, precioHistorial: [], hotspots: []
  },
  {
    id: 8, marca: "TOYOTA-HILUX- 4X4", modelo: "Frontier", version: "GT AWD",
    ano: 2022, precio: 9490000, km: 25000, duenos: 1, traccion: "AWD",
    transmision: "Automática 6V", cilindrada: "2.5L Skyactiv", combustible: "Gasolina",
    carroceria: "Camioneta", puertas: 4, pasajeros: 5, motor: "2.4L", techo: false, asientos: "Tela",
    tipoVenta: "Consignado", vendedor: "Roberto Diaz", financiable: true, valorPie: 9000000,
    aire: true, neumaticos: "Buen estado", llaves: 2,
    estado: "Disponible", imagen: "",
    obs: "SUV familiar seguro y confiable. Audio Bose, Head-up display y cuero nappa.",
    imagenes: createImageArray("TOYOTA-HILUX- 4X4", 7),
    diasStock: 18, vistas: 550, interesados: 10, patente: "TY-HL-44", color: "Rojo",
    comisionEstimada: 189800, precioHistorial: [], hotspots: []
  },
];

// --- LOGICA DE PERSISTENCIA ---
const LOCAL_STORAGE_KEY = 'autos_catalogo_stock';

// Tipo auxiliar para cargar datos antiguos sin romper la app
type VehiculoLegacy = Partial<Vehiculo>;

function loadStockFromLocalStorage(): Vehiculo[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const loaded: VehiculoLegacy[] = JSON.parse(data);
      // Mapeamos y rellenamos datos faltantes para cumplir con la interfaz estricta
      return loaded.map((car) => {
        let imagenesArray = car.imagenes || [];
        if (imagenesArray.length === 0 && car.imagen) {
          imagenesArray = [car.imagen];
        }
        if (imagenesArray.length === 0) {
          imagenesArray = ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"];
        }
        return {
          ...car,
          id: car.id || Date.now(),
          marca: car.marca || 'Marca',
          modelo: car.modelo || 'Modelo',
          precio: car.precio || 0,
          km: car.km || 0,
          ano: car.ano || 2024,
          transmision: car.transmision || 'Automática',
          combustible: car.combustible || 'Gasolina',
          carroceria: car.carroceria || 'SUV', // Valor por defecto
          puertas: car.puertas || 5,
          pasajeros: car.pasajeros || 5,
          techo: car.techo || false,
          asientos: car.asientos || 'Tela',
          tipoVenta: car.tipoVenta || 'Propio',
          vendedor: car.vendedor || 'Lions Cars',
          financiable: car.financiable ?? true,
          valorPie: car.valorPie || 0,
          aire: car.aire ?? true,
          neumaticos: car.neumaticos || 'Buenos',
          llaves: car.llaves || 1,
          obs: car.obs || '',
          estado: car.estado || 'Disponible',
          patente: car.patente || '',
          color: car.color || 'Blanco',
          imagenes: imagenesArray,
          imagen: imagenesArray[0] || "",
          comisionEstimada: car.comisionEstimada || 0,
          precioHistorial: car.precioHistorial || [],
          hotspots: car.hotspots || []
        } as Vehiculo;
      });
    }
  } catch (e) {
    console.error('Error cargando stock:', e);
  }
  return stockInicial;
}

function saveStockToLocalStorage(stock: Vehiculo[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stock));
  } catch {
    // ignore
  }
}

// --- ANIMATION VARIANTS & UTILS ---

const containerStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, 
      delayChildren: 0.1,
    }
  },
  exit: { opacity: 0 }
};

const fadeInUpSpring: Variants = {
  hidden: { y: 30, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: { y: -20, opacity: 0 }
};

const pageTransitionVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeIn" } }
};


// --- COMPONENTES AUXILIARES ---

const AutoCarousel = ({ images, interval = 3000 }: { images: string[], interval?: number }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800";
          }}
        />
      </AnimatePresence>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, idx) => (
          <motion.div
            key={idx}
            animate={{
              width: currentIndex === idx ? 24 : 6,
              backgroundColor: currentIndex === idx ? GOLD_MAIN : 'rgba(255,255,255,0.5)',
              transition: { type: "spring", stiffness: 300, damping: 30 }
            }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

const CarCard = ({ car, onClick, isFavorite, onToggleFavorite }: CarCardProps) => {
  if (!car) return null;

  return (
    <motion.div
      layoutId={`card-${car.id}`} // Shared layout animation
      whileHover={{ y: -10, scale: 1.02, boxShadow: `0 25px 50px -12px rgba(232, 185, 35, 0.25)` }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => onClick(car)}
      className="group bg-[#121212] border border-white/5 rounded-[24px] overflow-hidden cursor-pointer flex flex-col h-full relative transition-colors duration-300"
    >
      {/* Badges Flotantes */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <motion.span 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border ${
          car.tipoVenta === 'Propio'
            ? 'bg-[#E8B923] text-black border-[#FFE65F]/50'
            : 'bg-zinc-800 text-zinc-100 border-white/10'
          }`}>
          {car.tipoVenta}
        </motion.span>
        {car.estado && car.estado !== 'Disponible' && (
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-600 text-white border border-orange-500/50 backdrop-blur-md">
            {car.estado}
          </span>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.8, rotate: -15 }}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation(); 
          onToggleFavorite(e, car.id);
        }}
        className="absolute top-3 right-3 z-30 p-2.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all border border-white/10 shadow-lg"
      >
        <Heart 
          size={18} 
          className={isFavorite ? `fill-[${GOLD_MAIN}] text-[${GOLD_MAIN}]` : "text-gray-300"}
          style={{ fill: isFavorite ? GOLD_MAIN : 'none', color: isFavorite ? GOLD_MAIN : 'inherit' }}
        />
      </motion.button>

      <div className="relative h-60 overflow-hidden bg-zinc-900">
        <motion.div layoutId={`image-container-${car.id}`} className="w-full h-full">
            <AutoCarousel
            images={Array.isArray(car.imagenes) && car.imagenes.length > 0
                ? car.imagenes
                : ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"]}
            />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-4 left-5">
          <p className="text-[#E8B923] text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 drop-shadow-md">
            {car.marca}
          </p>
          <motion.p layoutId={`price-${car.id}`} className="text-white font-bold text-2xl drop-shadow-2xl tracking-tight">
            {formatPrice(car.precio)}
          </motion.p>
          {car.financiable && (
            <p className="text-zinc-400 text-[10px] mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Pie: {formatPrice(car.valorPie)}
            </p>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#121212] to-[#0a0a0a]">
        <div className="mb-5">
          <motion.h3 layoutId={`title-${car.id}`} className="text-zinc-100 font-bold text-xl leading-tight group-hover:text-[#E8B923] transition-colors">
            {car.modelo}
          </motion.h3>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-1 opacity-70">
            {car.version}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-[13px] text-zinc-400 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 text-[#E8B923] border border-white/5">
              <Calendar size={14} />
            </div>
            <span className="font-semibold">{car.ano}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 text-[#E8B923] border border-white/5">
              <Gauge size={14} />
            </div>
            <span className="font-semibold">{car.km.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 text-[#E8B923] border border-white/5">
              <Fuel size={14} />
            </div>
            <span className="font-semibold">{car.combustible}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 text-[#E8B923] border border-white/5">
              <Settings2 size={14} />
            </div>
            <span className="font-semibold truncate">{car.transmision}</span>
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-[#E8B923] font-black border border-white/10 shadow-inner">
              {car.vendedor.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-zinc-600">Vendedor</span>
              <span className="text-zinc-300 font-bold leading-none">{car.vendedor.split(' ')[0]}</span>
            </div>
          </div>
            
          <motion.span 
            className="text-[#E8B923] text-[11px] font-black uppercase flex items-center gap-1.5 bg-[#E8B923]/10 px-3 py-2 rounded-xl border border-[#E8B923]/20"
            whileHover={{ x: 3, backgroundColor: "rgba(232, 185, 35, 0.15)" }}
          >
            Ficha <ChevronRight size={14} />
          </motion.span>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[24px] border-2 border-white/0 group-hover:border-[#E8B923]/30 transition-all duration-500" />
    </motion.div>
  );
};

// --- COMPONENTE FINANCE MODAL (NUEVO) ---

const FinanceModal = ({ car, onClose }: { car: Vehiculo, onClose: () => void }) => {
  const [piePercent, setPiePercent] = useState(20);
  const [months, setMonths] = useState(24);
  const tasaMensual = 0.022; // 2.2% Referencial

  const montoPie = Math.round(car.precio * (piePercent / 100));
  const montoCredito = car.precio - montoPie;
  const cuota = Math.round((montoCredito * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -months)));
  const costoTotal = (cuota * months) + montoPie;

  return (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-12 bg-[#E8B923]/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic text-white flex items-center gap-2">
                    <Calculator size={20} className="text-[#E8B923]" /> Simulador
                </h3>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <X size={18} className="text-gray-400" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Info Auto */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden">
                        <img src={car.imagen} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{car.marca}</p>
                        <p className="text-sm font-bold text-white">{car.modelo}</p>
                        <p className="text-xs text-[#E8B923] font-mono">{formatPrice(car.precio)}</p>
                    </div>
                </div>

                {/* Slider Pie */}
                <div>
                    <div className="flex justify-between text-xs mb-2 font-bold">
                        <span className="text-gray-400 flex items-center gap-1"><Percent size={12}/> Pie ({piePercent}%)</span>
                        <span className="text-white">{formatPrice(montoPie)}</span>
                    </div>
                    <input 
                        type="range" min="20" max="50" step="5" 
                        value={piePercent} 
                        onChange={(e) => setPiePercent(parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E8B923]"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                        <span>20%</span>
                        <span>50%</span>
                    </div>
                </div>

                {/* Plazo */}
                <div>
                    <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1"><Calendar size={12}/> Plazo (Meses)</p>
                    <div className="grid grid-cols-4 gap-2">
                        {[12, 24, 36, 48].map(m => (
                            <button
                                key={m}
                                onClick={() => setMonths(m)}
                                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                    months === m 
                                    ? 'bg-[#E8B923] border-[#E8B923] text-black shadow-lg shadow-[#E8B923]/20' 
                                    : 'bg-zinc-900 border-white/5 text-gray-400 hover:border-white/20'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resultado */}
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 rounded-[2rem] border border-white/10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#E8B923]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1 relative z-10">Cuota Mensual Estimada</p>
                    <p className="text-4xl font-black text-white tracking-tighter relative z-10 drop-shadow-xl">{formatPrice(cuota)}</p>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] relative z-10">
                        <div className="text-left">
                            <p className="text-gray-500">Costo Total</p>
                            <p className="text-white font-bold">{formatPrice(costoTotal)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500">Tasa Ref.</p>
                            <p className="text-green-500 font-bold">{(tasaMensual * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex-1 bg-white text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                        <Banknote size={16}/> Solicitar
                    </button>
                    <button className="flex-1 bg-zinc-800 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                        <CreditCard size={16}/> Evaluar
                    </button>
                </div>

                <p className="text-[9px] text-center text-gray-600 leading-tight">
                    * Simulación referencial. No constituye una oferta vinculante. Sujeto a evaluación comercial y condiciones de mercado.
                </p>
            </div>
        </motion.div>
    </motion.div>
  );
};

// --- COMPONENTE CAR MODAL (CON HOTSPOTS, QR Y SIMULADOR) ---

const CarModal = ({ car, onClose, onContact, onOpenFinance }: { car: Vehiculo; onClose: () => void; onContact: (c: Vehiculo) => void, onOpenFinance: () => void }) => {
  type TabType = 'EXTERIOR' | 'INTERIOR' | 'DETALLES';
  const [activeTab, setActiveTab] = useState<TabType>('EXTERIOR');
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Simulamos la separación de fotos
  const splitIndex = Math.ceil(car.imagenes.length / 2);
  const exteriorImages = car.imagenes.slice(0, splitIndex);
  const interiorImages = car.imagenes.slice(splitIndex);
   
  const activeImages = activeTab === 'INTERIOR' ? interiorImages : exteriorImages;

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-2 md:p-6 font-mono overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#A37A00]/20 via-black to-black pointer-events-none" />
      
      <motion.div 
        layoutId={`card-${car.id}`} 
        className="relative w-full max-w-[1600px] h-[95vh] bg-[#0a0a0c] border border-white/10 rounded-sm shadow-[0_0_100px_rgba(232,185,35,0.15)] flex flex-col md:flex-row overflow-hidden"
      >
        
        {/* === COLUMNA IZQUIERDA: VISUALIZADOR === */}
        <div className="w-full md:w-[65%] h-full relative flex flex-col bg-black">
          
          <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex gap-4 pointer-events-auto">
               <div className="flex bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-1">
                  {(['EXTERIOR', 'INTERIOR', 'DETALLES'] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setCurrentImgIdx(0);
                      }}
                      className={`px-4 py-2 text-[10px] font-bold tracking-widest transition-all rounded-md ${
                        activeTab === tab 
                        ? 'bg-[#E8B923] text-black shadow-lg shadow-[#E8B923]/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="flex items-center gap-2 bg-[#E8B923]/20 border border-[#E8B923]/30 px-3 py-1 rounded-full animate-pulse pointer-events-auto">
               <div className="w-2 h-2 bg-[#E8B923] rounded-full" />
               <span className="text-[9px] text-[#E8B923] font-bold uppercase tracking-wider">
                 3 Personas viendo ahora
               </span>
            </div>
          </div>

          {/* IMAGEN PRINCIPAL CON HOTSPOTS */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center group">
             <AnimatePresence mode="wait">
                <motion.img 
                  layoutId={`image-container-${car.id}`}
                  key={`${activeTab}-${currentImgIdx}`}
                  src={activeImages[currentImgIdx] || car.imagen}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`w-full h-full object-contain transition-transform duration-700 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
             </AnimatePresence>

             {/* RENDERIZADO DE HOTSPOTS (Puntos de Venta) */}
             {!isZoomed && car.hotspots?.filter(h => {
                  return h.imageIndex === currentImgIdx || (h.imageIndex === undefined && currentImgIdx === 0);
             }).map((spot) => (
               <motion.div
                 key={spot.id}
                 initial={{ scale: 0 }} animate={{ scale: 1 }}
                 className="absolute w-6 h-6 -ml-3 -mt-3 z-30 cursor-pointer group/hotspot"
                 style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
               >
                 <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8B923] opacity-75 animate-ping"></span>
                 <span className="relative inline-flex rounded-full h-6 w-6 bg-[#E8B923] border-2 border-white items-center justify-center shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"/>
                 </span>
                 
                 {/* Tooltip de Observación */}
                 <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-48 bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl opacity-0 group-hover/hotspot:opacity-100 transition-opacity pointer-events-none transform translate-x-2 group-hover/hotspot:translate-x-0">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-black rotate-45 border-l border-b border-white/10"></div>
                    <p className="text-[10px] text-[#E8B923] font-bold uppercase tracking-widest mb-1">{spot.label}</p>
                    <p className="text-xs text-white leading-snug">{spot.detail}</p>
                 </div>
               </motion.div>
             ))}

             {/* Controles de Navegación */}
             <button onClick={() => setCurrentImgIdx(prev => prev > 0 ? prev - 1 : activeImages.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-[#E8B923] hover:text-black transition-all border border-white/10 opacity-0 group-hover:opacity-100 z-40">
                <ChevronLeft size={24} />
             </button>
             <button onClick={() => setCurrentImgIdx(prev => prev < activeImages.length - 1 ? prev + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-[#E8B923] hover:text-black transition-all border border-white/10 opacity-0 group-hover:opacity-100 z-40">
                <ChevronRight size={24} />
             </button>
          </div>

          <div className="h-24 bg-[#050505] border-t border-white/10 flex items-center gap-3 px-6 overflow-x-auto">
              {activeImages.map((img, idx) => (
                <button 
                 key={idx}
                 onClick={() => setCurrentImgIdx(idx)}
                 className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                   currentImgIdx === idx ? 'border-[#E8B923] scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                 }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
          </div>
        </div>

        {/* === COLUMNA DERECHA: DATOS Y MARKETING === */}
        <div className="w-full md:w-[35%] h-full bg-[#08080a] border-l border-white/10 flex flex-col relative overflow-y-auto custom-scrollbar">
            
           <button onClick={onClose} className="absolute top-4 right-4 z-50 text-gray-500 hover:text-[#E8B923] transition-colors">
             <X size={24} />
           </button>

           <div className="p-8 pb-40">
              <div className="mb-8 border-b border-white/5 pb-8">
                <h3 className="text-[#E8B923] text-xs font-black uppercase tracking-[0.4em] mb-2">{car.marca}</h3>
                <motion.h2 layoutId={`title-${car.id}`} className="text-4xl md:text-5xl font-black italic text-white tracking-tighter mb-4">{car.modelo}</motion.h2>
                <div className="flex items-end gap-4">
                  <motion.span layoutId={`price-${car.id}`} className="text-3xl font-bold text-white">{formatPrice(car.precio)}</motion.span>
                  {car.estado === 'Disponible' && (
                    <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1">
                      Entrega Inmediata
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <ShieldCheck size={20} className="text-blue-400" />
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Garantía</p>
                    <p className="text-xs text-white font-bold">6 Meses</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <User size={20} className="text-purple-400" />
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Dueños</p>
                    <p className="text-xs text-white font-bold">{car.duenos} Propietario{car.duenos > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <FileCheck size={20} className="text-green-400" />
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Papeles</p>
                    <p className="text-xs text-white font-bold">Al Día 2026</p>
                  </div>
                </div>
                 <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <Settings size={20} className="text-orange-400" />
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Inspección</p>
                    <p className="text-xs text-white font-bold">Aprobada</p>
                  </div>
                </div>
              </div>

              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-4">Ficha Técnica Resumida</h4>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                  {[
                    { label: 'Año', val: car.ano, icon: Calendar },
                    { label: 'Kilometraje', val: `${car.km.toLocaleString()} KM`, icon: Gauge },
                    { label: 'Combustible', val: car.combustible, icon: Fuel },
                    { label: 'Transmisión', val: car.transmision, icon: Settings2 },
                    { label: 'Motor', val: car.motor || car.cilindrada || 'N/A', icon: Zap },
                    { label: 'Tracción', val: car.traccion || '4x2', icon: Activity },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                       <div className="p-2 bg-neutral-900 rounded-lg text-[#E8B923] border border-white/5">
                         <item.icon size={16} />
                       </div>
                       <div>
                         <p className="text-[9px] text-gray-500 uppercase font-bold">{item.label}</p>
                         <p className="text-sm text-white font-bold">{item.val}</p>
                       </div>
                    </div>
                  ))}
              </div>

              {car.financiable && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#A37A00]/40 to-black border border-[#E8B923]/30 p-5 mb-8 group">
                  <div className="absolute top-0 right-0 p-2 bg-[#E8B923] text-black text-[9px] font-black uppercase tracking-widest rounded-bl-xl">
                    Oportunidad
                  </div>
                  <p className="text-[10px] text-[#FFE65F] font-bold uppercase tracking-[0.2em] mb-1">Financiamiento Flexible</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-black text-white italic">24/48</span>
                    <span className="text-sm font-bold text-gray-400 mb-1">Cuotas</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Llévatelo con un pie desde <span className="text-white font-bold">{formatPrice(car.valorPie)}</span>. Evaluación en 15 minutos.
                  </p>
                  <button 
                    onClick={onOpenFinance}
                    className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Calculator size={14} className="text-[#E8B923]"/> Simular Crédito Ahora
                  </button>
                </div>
              )}

              {/* SECCIÓN DE DESCARGA (QR) */}
              <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white p-1 rounded-lg">
                        {/* Generador de QR Real */}
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Lions Cars: ${car.marca} ${car.modelo} ID:${car.id}`)}`} alt="QR" className="w-full h-full" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-white flex items-center gap-2">
                           <Smartphone size={14} className="text-[#E8B923]" /> Ficha Digital
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Escanea para llevar en tu móvil</p>
                     </div>
                  </div>
                  <div className="bg-[#E8B923]/20 p-2 rounded-lg text-[#E8B923] group-hover:bg-[#E8B923] group-hover:text-black transition-all">
                     <QrCode size={20} />
                  </div>
              </div>

              <div className="mb-8">
                  <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-2">Observaciones del Especialista</h4>
                  <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-[#E8B923] pl-4 italic">
                    "{car.obs}"
                  </p>
              </div>

           </div>
           
           <div className="absolute bottom-0 left-0 w-full bg-[#08080a]/90 backdrop-blur-xl border-t border-white/10 p-6 z-20">
              <button 
                onClick={() => onContact(car)}
                className="w-full py-4 bg-gradient-to-r from-[#DAA520] to-[#E8B923] hover:from-[#FFE65F] hover:to-[#DAA520] text-black font-black text-sm uppercase tracking-[0.2em] rounded-xl shadow-[0_0_30px_rgba(232,185,35,0.4)] hover:shadow-[0_0_50px_rgba(232,185,35,0.6)] transition-all flex items-center justify-center gap-3 group"
              >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform"/>
                Contactar Vendedor
              </button>
              <p className="text-center text-[9px] text-gray-500 mt-3 font-bold uppercase">
                Respuesta promedio: 5 Minutos
              </p>
           </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Columna 1: Branding */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#E8B923] rounded-xl flex items-center justify-center shadow-lg shadow-[#E8B923]/20">
                <Car className="text-black" size={24} />
              </div>
              <span className="text-white font-black text-2xl tracking-tighter uppercase">
                LIONS<span className="text-[#E8B923]">CARS</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Tu destino premium para la compra y venta de vehículos. Calidad garantizada y financiamiento a tu medida.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Navegación</h4>
            <ul className="space-y-4">
              {['Catálogo', 'Vender mi Auto', 'Financiamiento', 'Seguros'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-zinc-500 hover:text-[#E8B923] text-sm transition-colors flex items-center gap-2 group">
                    <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#E8B923]" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto Directo */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-zinc-500 text-sm">
                <MessageCircle size={18} className="text-[#E8B923]" />
                +56 9 1234 5678
              </li>
              <li className="flex items-center gap-3 text-zinc-500 text-sm">
                <Search size={18} className="text-[#E8B923]" />
                contacto@lionscars.cl
              </li>
            </ul>
          </div>

          {/* Columna 4: Horario (Importante para ventas) */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Horarios</h4>
            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Lun - Vie:</span>
                <span className="text-zinc-200">09:00 - 19:00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Sábados:</span>
                <span className="text-zinc-200">10:00 - 14:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
            © 2026 LIONS CARS - CATÁLOGO PROFESIONAL
          </p>
          <div className="flex gap-6">
            <motion.div whileHover={{ scale: 1.2, color: "#E8B923" }} className="text-zinc-600 cursor-pointer">
                <Share2 size={16} />
            </motion.div>
            <motion.div whileHover={{ scale: 1.2, color: "#E8B923" }} className="text-zinc-600 cursor-pointer">
                <Heart size={16} />
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- APP PRINCIPAL ---

function App() {
  const [stock, setStock] = useState<Vehiculo[]>(() => loadStockFromLocalStorage());
  const [selectedSeller, setSelectedSeller] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCar, setSelectedCar] = useState<Vehiculo | null>(null);
  const [financeCar, setFinanceCar] = useState<Vehiculo | null>(null);
  const [notification, setNotification] = useState<{ message: string; sub: string } | null>(null);
  const [currentView, setCurrentView] = useState<'catalog' | 'seller'>('catalog');
   
  // Parallax Hook
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  const [filters, setFilters] = useState({
    marca: 'Todas',
    yearMin: '',
    yearMax: '',
    priceMin: '',
    priceMax: '',
    kmMin: '',
    kmMax: '',
    combustible: 'Todos',
    transmision: 'Todas',
    traccion: 'Todas',
    tipoVenta: 'Todos',
    financiable: 'Todos',
    duenosMax: '',
    aire: 'Todos',
    neumaticos: 'Todos'
  });

  // --- LÓGICA DE ACTUALIZACIÓN DEL STOCK ---

  // Agregar Auto
  const handleAddCar = (car: Vehiculo) => {
    console.log('🚗 Nuevo auto recibido:', car);
    if (!car.imagenes || car.imagenes.length === 0) {
      console.warn('⚠️ No se recibieron imágenes, usando placeholder');
      car.imagenes = ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"];
    }

    setStock((prev) => {
      const updated = [car, ...prev];
      saveStockToLocalStorage(updated);
      return updated;
    });
  };

  // Actualizar Auto (NUEVO - REQUERIDO POR SellerPortal)
  const handleUpdateCar = (updatedCar: Vehiculo) => {
    setStock((prev) => {
      const updated = prev.map(car => car.id === updatedCar.id ? updatedCar : car);
      saveStockToLocalStorage(updated);
      return updated;
    });
    console.log('✅ Auto actualizado:', updatedCar.id);
  };

  // Eliminar Auto (NUEVO - REQUERIDO POR SellerPortal)
  const handleDeleteCar = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este vehículo?')) {
        setStock((prev) => {
            const updated = prev.filter(car => car.id !== id);
            saveStockToLocalStorage(updated);
            return updated;
        });
        console.log('🗑️ Auto eliminado:', id);
    }
  };

  // Escuchar cambios en localStorage hechos desde otras pestañas/ventanas
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'autos_catalogo_stock') {
        setStock(loadStockFromLocalStorage());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Sync stock to localStorage on change
  useEffect(() => {
    saveStockToLocalStorage(stock);
  }, [stock]);

  const sellers = useMemo(() => ['Todos', ...Array.from(new Set(stock.map(c => c.vendedor)))], [stock]);
  const marcas = useMemo(() => ['Todas', ...Array.from(new Set(stock.map(c => c.marca))).sort()], [stock]);


  const filteredStock = useMemo(() => {
    return stock.filter(car => {
      const matchSeller = selectedSeller === 'Todos' || car.vendedor === selectedSeller;

      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        car.marca.toLowerCase().includes(searchLower) ||
        car.modelo.toLowerCase().includes(searchLower) ||
        car.ano.toString().includes(searchLower) ||
        (car.version || '').toLowerCase().includes(searchLower);

      const matchMarca = filters.marca === 'Todas' || car.marca === filters.marca;
      const matchYearMin = !filters.yearMin || car.ano >= parseInt(filters.yearMin);
      const matchYearMax = !filters.yearMax || car.ano <= parseInt(filters.yearMax);
      const matchPriceMin = !filters.priceMin || car.precio >= parseInt(filters.priceMin);
      const matchPriceMax = !filters.priceMax || car.precio <= parseInt(filters.priceMax);
      const matchKmMin = !filters.kmMin || car.km >= parseInt(filters.kmMin);
      const matchKmMax = !filters.kmMax || car.km <= parseInt(filters.kmMax);
      const matchCombustible = filters.combustible === 'Todos' || car.combustible === filters.combustible;
      const matchTransmision = filters.transmision === 'Todas' || car.transmision.includes(filters.transmision);
      const matchTraccion = filters.traccion === 'Todas' || car.traccion === filters.traccion;
      const matchTipoVenta = filters.tipoVenta === 'Todos' || car.tipoVenta === filters.tipoVenta;
      const matchFinanciable = filters.financiable === 'Todos' || 
        (filters.financiable === 'Si' ? car.financiable : !car.financiable);
      const matchDuenos = !filters.duenosMax || car.duenos <= parseInt(filters.duenosMax);
      const matchAire = filters.aire === 'Todos' || (filters.aire === 'Si' ? car.aire : !car.aire);
      const matchNeumaticos = filters.neumaticos === 'Todos' || car.neumaticos === filters.neumaticos;

      return matchSeller && matchSearch && matchMarca && matchYearMin && matchYearMax &&
        matchPriceMin && matchPriceMax && matchKmMin && matchKmMax && matchCombustible &&
        matchTransmision && matchTraccion && matchTipoVenta && matchFinanciable &&
        matchDuenos && matchAire && matchNeumaticos;
    });
  }, [stock, selectedSeller, searchTerm, filters]);

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleContact = (car: Vehiculo) => {
    const phone = "56912345678";
    const text = `Hola ${car.vendedor}, estoy interesado en el ${car.marca} ${car.modelo} (${car.ano}) que vi en Lions Cars.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    setNotification({
      message: `¡Redirigiendo a WhatsApp!`,
      sub: `Contactando a ${car.vendedor}...`
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const clearAllFilters = () => {
    setFilters({
      marca: 'Todas',
      yearMin: '',
      yearMax: '',
      priceMin: '',
      priceMax: '',
      kmMin: '',
      kmMax: '',
      combustible: 'Todos',
      transmision: 'Todas',
      traccion: 'Todas',
      tipoVenta: 'Todos',
      financiable: 'Todos',
      duenosMax: '',
      aire: 'Todos',
      neumaticos: 'Todos'
    });
    setSearchTerm('');
    setSelectedSeller('Todos');
  };



  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-[#E8B923]/30 overflow-x-hidden">
      <div className="relative">
        {/* Header Superior */}
        <motion.header
          // Animación Premium: Entrada del header con spring
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="sticky top-0 z-50 bg-black/95 backdrop-blur-2xl border-b border-gray-800/50"
        >
          {/* Barra superior con contactos */}
          <div className="w-full bg-gray-900/50 border-b border-gray-800/30">
            <div className="w-full px-6 py-2">
              <div className="flex items-center justify-between text-xs">
                {/* Dirección */}
                <div className="hidden lg:flex items-center gap-2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Av. Principal #123, Concepción, Chile</span>
                </div>

                {/* WhatsApp en 2 filas */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex flex-col gap-1">
                    <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors">
                      <MessageCircle size={14} />
                      <span className="font-medium">+56 9 1234 5678</span>
                    </a>
                   
                  </div>
                 
                </div>
              </div>
            </div>
          </div>

          {/* Barra principal */}
          <div className="w-full px-6 h-20 flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCurrentView('catalog')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* LOGO ACTUALIZADO: Pon aquí la ruta real de tu logo */}
              <img
                src="/logo.png" 
                alt="Lions Cars Logo"
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='50' viewBox='0 0 200 50'%3E%3Ctext x='0' y='35' font-family='Arial' font-size='28' fill='%23E8B923' font-weight='bold' font-style='italic'%3ELIONS CARS%3C/text%3E%3C/svg%3E";
                }}
              />
            </motion.div>

            <div className="flex items-center gap-4">
              {currentView === 'catalog' && (
                <motion.button 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Favoritos <motion.span key={favorites.length} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="bg-[#E8B923] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{favorites.length}</motion.span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: currentView === 'catalog' ? "#E8B923" : "rgba(31, 41, 55, 0.8)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView(currentView === 'catalog' ? 'seller' : 'catalog')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg ${currentView === 'catalog'
                    ? 'bg-white text-black hover:bg-[#E8B923]'
                    : 'bg-gray-800 text-[#E8B923] border border-[#A37A00]/50'
                  }`}
              >
                {currentView === 'catalog' ? (
                  <>
                    <LayoutDashboard size={18} />
                    <span>Portal Vendedor</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft size={18} />
                    <span>Volver al Catálogo</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Hero Section - MEJORADO CON PARALLAX Y DORADOS */}
        {currentView === 'catalog' && (
        <div className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
            {/* Fondo Parallax */}
            <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="absolute inset-0 z-0"
            >
            <img src="/hero.png" className="w-full h-full object-cover opacity-80 scale-105" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
            </motion.div>
            
            {/* Contenido del Héroe con Stagger */}
            <motion.div 
                variants={containerStagger}
                initial="hidden"
                animate="show"
                className="relative z-10 text-center px-4 max-w-4xl"
            >
            <motion.h1 variants={fadeInUpSpring} className="text-6xl md:text-9xl font-black italic text-white tracking-tighter mb-4 drop-shadow-[0_10px_30px_rgba(232,185,35,0.3)]">
                LIONS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE65F] via-[#E8B923] to-[#A37A00]">CARS</span>
            </motion.h1>
            
            <motion.div variants={fadeInUpSpring} className="flex justify-center gap-4 mb-8">
                {[1,2,3,4,5].map(i => (
                      <Star key={i} className="text-[#E8B923] fill-[#E8B923]" size={20} />
                ))}
            </motion.div>

            <motion.p variants={fadeInUpSpring} className="text-2xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                Multiservicios del Sur
            </motion.p>
            
            <motion.p variants={fadeInUpSpring} className="text-gray-300 text-base md:text-lg font-medium drop-shadow-md max-w-2xl mx-auto">
                Vehículos seleccionados con garantía y financiamiento disponible. 
                <span className="text-[#E8B923] font-bold"> Calidad Premium</span> asegurada.
            </motion.p>

            <motion.div variants={containerStagger} className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                {["Garantía Incluida", "Financiamiento Fácil", "Revisión Técnica"].map((text, i) => (
                    <motion.div 
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                        key={i} 
                        variants={fadeInUpSpring} 
                        className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full cursor-default"
                    >
                        <p className="text-xs font-bold text-white">✓ {text}</p>
                    </motion.div>
                ))}
            </motion.div>
            </motion.div>

            {/* Partículas de Fondo Doradas (Simuladas) */}
            <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#A37A00]/10 to-[#E8B923]/20 blur-[120px] pointer-events-none"
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            />
        </div>
        )}
      </div>

      {/* CUERPO PRINCIPAL CON TRANSICIONES ENTRE VISTAS */}
      <main className="w-full px-6 pb-20 min-h-[600px]">
        <AnimatePresence mode="wait">
          {currentView === 'catalog' ? (
            // Animación Premium: Transición de página (Slide In/Out)
            <motion.div
                key="catalog-view"
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col md:flex-row gap-8"
            >

              {/* COLUMNA IZQUIERDA: FILTROS FIJOS */}
              <aside className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0">
                <div className="sticky top-24">
                  <div className="bg-gray-900/50 p-5 rounded-3xl border border-gray-800 shadow-xl">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Filter size={18} className="text-[#E8B923]" /> Filtros
                    </h3>

                    {/* Buscador dentro del Sidebar */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full bg-black border border-gray-800 rounded-xl py-2 pl-10 pr-3 text-sm focus:border-[#E8B923] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filtros Compactos */}
                    <div className="space-y-3">
                      {/* Vendedor y Marca en una fila */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Vendedor</label>
                          <select
                            value={selectedSeller}
                            onChange={(e) => setSelectedSeller(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs text-white focus:border-[#E8B923]"
                          >
                            {sellers.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Marca</label>
                          <select
                            value={filters.marca}
                            onChange={(e) => setFilters({ ...filters, marca: e.target.value })}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs text-white focus:border-[#E8B923]"
                          >
                            {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Año */}
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Año</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Desde"
                            value={filters.yearMin}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs focus:border-[#E8B923] outline-none"
                            onChange={(e) => setFilters({ ...filters, yearMin: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Hasta"
                            value={filters.yearMax}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs focus:border-[#E8B923] outline-none"
                            onChange={(e) => setFilters({ ...filters, yearMax: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Precio */}
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Precio (M)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.priceMin}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs focus:border-[#E8B923] outline-none"
                            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.priceMax}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs focus:border-[#E8B923] outline-none"
                            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Kilometraje */}
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Km</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.kmMin}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs focus:border-[#E8B923] outline-none"
                            onChange={(e) => setFilters({ ...filters, kmMin: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.kmMax}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs focus:border-[#E8B923] outline-none"
                            onChange={(e) => setFilters({ ...filters, kmMax: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Combustible y Transmisión */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Combustible</label>
                          <select
                            value={filters.combustible}
                            onChange={(e) => setFilters({ ...filters, combustible: e.target.value })}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs text-white focus:border-[#E8B923]"
                          >
                            <option value="Todos">Todos</option>
                            <option value="Gasolina">Gasolina</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Eléctrico">Eléctrico</option>
                            <option value="Híbrido">Híbrido</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Transmisión</label>
                          <select
                            value={filters.transmision}
                            onChange={(e) => setFilters({ ...filters, transmision: e.target.value })}
                            className="w-full bg-black border border-gray-800 rounded-lg py-1.5 px-2 text-xs text-white focus:border-[#E8B923]"
                          >
                            <option value="Todas">Todas</option>
                            <option value="Automática">Auto</option>
                            <option value="Mecánica">Manual</option>
                          </select>
                        </div>
                      </div>

                      {/* Checkboxes compactos */}
                      <div className="pt-2 border-t border-gray-800">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Características</label>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Tracción 4x4 */}
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={filters.traccion === '4x4'}
                              onChange={(e) => setFilters({ ...filters, traccion: e.target.checked ? '4x4' : 'Todas' })}
                              className="w-4 h-4 rounded border-gray-700 bg-black text-[#E8B923] focus:ring-[#E8B923] focus:ring-offset-0"
                            />
                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">4x4</span>
                          </label>

                          {/* Aire */}
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={filters.aire === 'Si'}
                              onChange={(e) => setFilters({ ...filters, aire: e.target.checked ? 'Si' : 'Todos' })}
                              className="w-4 h-4 rounded border-gray-700 bg-black text-[#E8B923] focus:ring-[#E8B923] focus:ring-offset-0"
                            />
                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">A/C</span>
                          </label>

                          {/* Financiable */}
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={filters.financiable === 'Si'}
                              onChange={(e) => setFilters({ ...filters, financiable: e.target.checked ? 'Si' : 'Todos' })}
                              className="w-4 h-4 rounded border-gray-700 bg-black text-[#E8B923] focus:ring-[#E8B923] focus:ring-offset-0"
                            />
                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Financ.</span>
                          </label>

                          {/* Propio */}
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={filters.tipoVenta === 'Propio'}
                              onChange={(e) => setFilters({ ...filters, tipoVenta: e.target.checked ? 'Propio' : 'Todos' })}
                              className="w-4 h-4 rounded border-gray-700 bg-black text-[#E8B923] focus:ring-[#E8B923] focus:ring-offset-0"
                            />
                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Propio</span>
                          </label>
                        </div>
                      </div>

                      {/* Botón Limpiar con micro-interacción */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(232, 185, 35, 0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={clearAllFilters}
                        className="w-full mt-3 bg-[#E8B923]/10 border border-[#A37A00]/30 text-[#FFE65F] font-bold py-2 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                      >
                        <X size={14} />
                        Limpiar Filtros
                      </motion.button>
                    </div>
                  </div>
                </div>
              </aside>

              {/* COLUMNA DERECHA: GRILLA DE AUTOS */}
              <div className="flex-grow">
                <div className="mb-6 flex justify-between items-end">
                  <p className="text-gray-400 text-sm font-medium">
                    Mostrando <span className="text-white font-bold">{filteredStock.length}</span> vehículos
                  </p>
                </div>

                {filteredStock.length > 0 ? (
                  // Animación Premium: Staggered Grid (Aparición en cascada)
                  <motion.div 
                    variants={containerStagger}
                    initial="hidden"
                    animate="show"
                    layout // Animación mágica al filtrar/reordenar
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6"
                  >
                    {filteredStock.map((car) => (
                      <motion.div 
                        key={car.id} 
                        variants={fadeInUpSpring}
                        layout // Importante para la animación de reordenamiento
                      >
                        <CarCard 
                          car={car}
                          onClick={setSelectedCar}
                          isFavorite={favorites.includes(car.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-gray-900/30 rounded-[3rem] border border-dashed border-gray-800">
                    <Search size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-xl font-bold text-gray-400">No encontramos lo que buscas</p>
                    <button onClick={clearAllFilters} className="mt-4 text-[#E8B923] font-bold hover:underline">Ver todo el stock</button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
              // VISTA DE VENDEDOR REAL (INTEGRADA)
              <motion.div
                key="seller-view"
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                <SellerPortal 
                  stock={stock} 
                  onAdd={handleAddCar} 
                  onUpdate={handleUpdateCar} 
                  onDelete={handleDeleteCar} 
                  onBack={() => setCurrentView('catalog')}
                />
              </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* --- INICIO DEL FOOTER --- */}
      <Footer />
      {/* --- FIN DEL FOOTER --- */}

      {/* Modales y Notificaciones con AnimatePresence */}
      <AnimatePresence>
        {selectedCar && 
          <CarModal 
            car={selectedCar} 
            onClose={() => setSelectedCar(null)} 
            onContact={handleContact}
            onOpenFinance={() => setFinanceCar(selectedCar)}
          />
        }
      </AnimatePresence>

      <AnimatePresence>
        {financeCar && <FinanceModal car={financeCar} onClose={() => setFinanceCar(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          // Animación Premium: Notificación con entrada tipo resorte
          <motion.div 
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed bottom-10 right-10 z-[100] bg-[#25D366] text-white p-5 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20"
          >
            <MessageCircle size={28} />
            <div>
              <p className="font-black leading-none">{notification.message}</p>
              <p className="text-xs opacity-80 mt-1">{notification.sub}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
      .text-glow { text-shadow: 0 0 40px rgba(232, 185, 35, 0.6); }
      select { 
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); 
        background-position: right 1rem center; 
        background-repeat: no-repeat; 
        background-size: 1.25rem; 
        appearance: none; 
      }
      /* Custom scrollbar para el sidebar si es muy largo */
      .sticky {
        max-height: none;
        overflow-y: visible;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #000;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #E8B923;
      }
    `}</style>
    </div>
  );
}

export default App;