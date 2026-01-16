import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import {
  Car, PlusCircle, LogOut, Wallet, TrendingUp, Search, ArrowLeft,
  Image as ImageIcon, Edit3, DollarSign, Trash2,
  Zap, BarChart3, Clock, ShieldCheck, ChevronRight, ChevronLeft, ArrowUpRight,
  ArrowDownRight, Bell, History, Target, Percent, Eye, Users, Award, Lock,
  Activity, Package, AlertTriangle, LineChart, ImagePlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORTANTE: IMPORTAMOS LOS TIPOS DESDE LA API ---
import type { Vehiculo, Hotspot } from '../services/api';

// --- COLORES GOLD ---
const GOLD_MAIN = '#E8B923';

// ===== CONSTANTES Y LISTAS DE DATOS =====

const CAR_COLORS = [
  "Blanco", "Blanco Perla", "Negro", "Negro Mate", "Gris Plata", "Gris Grafito", 
  "Gris Oscuro", "Gris Nardo", "Azul", "Azul Marino", "Azul Eléctrico", "Azul Noche",
  "Rojo", "Rojo Ferrari", "Rojo Vino", "Burdeo", "Verde", "Verde Inglés", "Verde Oliva",
  "Verde Militar", "Amarillo", "Naranja", "Beige", "Champagne", "Café", "Chocolate",
  "Bronce", "Dorado", "Cobre", "Morado", "Violeta", "Celeste", "Turquesa", "Crema",
  "Titanio", "Fibra de Carbono", "Bicolor", "Otro"
];

const CAR_BRANDS = [
  "Abarth", "Acura", "Aiways", "Alfa Romeo", "Alpine", "Aston Martin", "Audi", 
  "Austin", "Baic", "Bentley", "Bestune", "BMW", "Borgward", "Brilliance", 
  "Bugatti", "Buick", "BYD", "Cadillac", "Caterham", "Changan", "Chery", 
  "Chevrolet", "Chrysler", "Citroën", "Cupra", "Dacia", "Daewoo", "Daihatsu", 
  "Datsun", "DFSK", "Dodge", "Dongfeng", "DS Automobiles", "Exeed", "FAW", 
  "Ferrari", "Fiat", "Fisker", "Ford", "Foton", "GAC", "Geely", "Genesis", 
  "GMC", "Great Wall", "Hafei", "Haval", "Hino", "Honda", "Hongqi", "Hummer", 
  "Hyundai", "Infiniti", "Isuzu", "Iveco", "JAC", "Jaecoo", "Jaguar", "Jeep", 
  "Jetour", "JMC", "Kaiyi", "Karry", "KGM (SsangYong)", "Kia", "King Long", 
  "Koenigsegg", "Kyc", "Lada", "Lamborghini", "Lancia", "Land Rover", 
  "Landwind", "Leapmotor", "Lexus", "Lifan", "Lincoln", "Lotus", "Lucid", 
  "Mahindra", "Maserati", "Maxus", "Maybach", "Mazda", "McLaren", 
  "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Morgan", "Nio", "Nissan", 
  "Oldsmobile", "Omoda", "Opel", "Pagani", "Peugeot", "Polestar", "Pontiac", 
  "Porsche", "Poer", "Proton", "RAM", "Renault", "Rimac", "Rivian", 
  "Rolls-Royce", "Rover", "Saab", "Samsung", "Seat", "Shineray", "Skoda", 
  "Smart", "Soueast", "SsangYong", "Subaru", "Suzuki", "Tank", "Tata", 
  "Tesla", "Toyota", "Triumph", "Volkswagen", "Volvo", "Xpeng", "Zeekr", 
  "ZNA", "Zotye", "ZX Auto", "Otro"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: (currentYear + 1) - 2000 + 1 }, 
  (_, i) => (currentYear + 1 - i).toString()
);

// ===== INTERFACES LOCALES (UI) =====

interface Notification {
  id: number;
  text: string;
  type: 'price' | 'lead' | 'warning';
  time: string;
}

interface Stats {
  totalValue: number;
  avgDays: number;
  leads: number;
  count: number;
  totalComission: number;
  available: number;
  sold: number;
  totalViews: number;
  avgPrice: number;
  conversionRate: string;
}

interface SellerPortalProps {
  stock: Vehiculo[];
  onBack?: () => void;
  onAdd: (car: Vehiculo) => void;
  onUpdate: (car: Vehiculo) => void;
  onDelete: (id: number) => void;
}

interface LoginScreenProps {
  onLogin: () => void;
  onBack?: () => void;
}

interface DashboardProps {
  stock: Vehiculo[];
  notifications: Notification[];
  onAdd: (car: Vehiculo) => void;
  onUpdate: (updated: Vehiculo) => void;
  onDelete: (id: number) => void;
  onBack?: () => void;
  onLogout: () => void;
}

interface InventoryViewProps {
  stock: Vehiculo[];
  onEdit: (car: Vehiculo) => void;
  onDelete: (id: number) => void;
}

interface VehicleFormProps {
  car: Vehiculo | null;
  onCancel: () => void;
  onSubmit: (data: Vehiculo) => void;
}

interface NavItemProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  sub?: string;
  color: string;
  subValue?: string;
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
}

interface FieldProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (value: string) => void;
}

interface TextAreaFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  rows?: number;
}

interface FormSectionProps {
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
}

interface AnalyticsViewProps {
  stock: Vehiculo[];
  stats: Stats;
}

// ===== 1. COMPONENTES DE UI BÁSICOS =====

const AutoCarousel = ({ images, interval = 3000 }: { images: string[], interval?: number }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
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
              backgroundColor: currentIndex === idx ? GOLD_MAIN : 'rgba(255,255,255,0.5)'
            }}
            className="h-1.5 rounded-full transition-all"
          />
        ))}
      </div>
    </div>
  );
};

const FormSection: React.FC<FormSectionProps> = ({ title, icon: Icon, color, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="bg-[#080808] border border-white/5 overflow-hidden shadow-2xl w-full rounded-3xl p-6 relative"
  >
    <div className={`absolute top-0 right-0 p-12 bg-current opacity-[0.02] blur-3xl ${color}`} />
    <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-6 ${color} relative z-10`}>
      <Icon size={18} /> {title}
    </h3>
    <div className="relative z-10 space-y-6">
      {children}
    </div>
  </motion.div>
);

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = "text", readOnly = false }) => (
  <div className="space-y-2 flex-1">
    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">{label}</label>
    <input
      type={type}
      readOnly={readOnly}
      className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#E8B923]/50 focus:bg-white/[0.02] transition-all text-white placeholder:text-neutral-800 hover:border-white/20 disabled:opacity-50"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange }) => (
  <div className="space-y-2 flex-1">
    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select
        className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#E8B923]/50 focus:bg-white/[0.02] transition-all appearance-none cursor-pointer text-white hover:border-white/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => <option key={opt} value={opt} className="bg-black">{opt}</option>)}
      </select>
      <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-neutral-600 pointer-events-none" />
    </div>
  </div>
);

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, value, onChange, rows = 3 }) => (
  <div className="space-y-2 flex-1 w-full">
    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">{label}</label>
    <textarea
      rows={rows}
      className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#E8B923]/50 focus:bg-white/[0.02] transition-all text-white placeholder:text-neutral-800 hover:border-white/20 resize-none"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// --- COMPONENTE AUTOCOMPLETE ---
interface AutocompleteFieldProps {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({ label, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputValue = value || '';
  
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 flex-1 relative" ref={containerRef}>
      <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#E8B923]/50 focus:bg-white/[0.02] transition-all text-white placeholder:text-neutral-800 hover:border-white/20"
          placeholder={placeholder}
          value={inputValue} 
          onChange={(e) => {
            onChange(e.target.value); 
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
        />
        <Search size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
        
        <AnimatePresence>
          {isOpen && filteredOptions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 scrollbar-hide"
            >
              {filteredOptions.map((opt) => (
                <li
                  key={opt}
                  className="px-5 py-3 text-sm text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors flex items-center justify-between"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  <span>{opt}</span>
                  {inputValue === opt && <div className="w-1.5 h-1.5 rounded-full bg-[#E8B923]" />}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const NavItem: React.FC<NavItemProps> = ({ active, icon: Icon, label, onClick, color = "text-neutral-500" }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.95 }}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${active ? 'bg-[#E8B923] text-black shadow-[0_8px_20px_rgba(232,185,35,0.2)]' : `hover:bg-white/5 ${color}`
      }`}
  >
    <Icon size={20} className={active ? 'text-black' : 'group-hover:text-white transition-colors'} strokeWidth={active ? 2.5 : 2} />
    <span className="hidden md:block text-[13px] font-bold uppercase tracking-tight">{label}</span>
    {active && <motion.div layoutId="nav-pill" className="absolute left-[-1rem] w-2 h-8 bg-[#E8B923] rounded-r-full hidden md:block" />}
  </motion.button>
);

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon: Icon, trend, sub, color, subValue }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-[#080808] border border-white/5 p-4 rounded-[2.5rem] relative overflow-hidden group shadow-inner cursor-pointer"
  >
    <motion.div
      animate={{ rotate: [0, 5, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#E8B923]/5 to-transparent blur-2xl rounded-full"
    />
    <div className="flex justify-between items-start mb-6 relative z-10">
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="p-3.5 bg-neutral-900 rounded-2xl border border-white/10 group-hover:border-[#E8B923]/40 transition-colors"
      >
        <Icon size={22} className="text-[#E8B923]" />
      </motion.div>
      {trend && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-[10px] font-black px-2.5 py-1.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1 uppercase tracking-tighter"
        >
          <ArrowUpRight size={10} /> {trend}
        </motion.span>
      )}
    </div>
    <p className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1 relative z-10">{label}</p>
    <h3 className={`text-3xl font-black italic tracking-tighter ${color} relative z-10`}>{value}</h3>
    {sub && <p className="text-[10px] font-bold text-neutral-700 uppercase mt-1 tracking-widest relative z-10">{sub}</p>}
    {subValue && <p className="text-[9px] font-bold text-neutral-600 mt-1 relative z-10">{subValue}</p>}
  </motion.div>
);

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon: Icon, trend, trendValue, color }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    className={`bg-gradient-to-br ${color} border border-white/5 p-6 rounded-[2rem] relative overflow-hidden`}
  >
    <div className="absolute top-0 right-0 p-12 opacity-10">
      <Icon size={80} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className="text-white" />
        <p className="text-xs font-bold text-neutral-400 uppercase">{label}</p>
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-3xl font-black text-white">{value}</h3>
        <span className="text-sm font-bold text-neutral-400 mb-1">{unit}</span>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend === 'up' ? (
            <ArrowUpRight size={14} className="text-green-500" />
          ) : trend === 'down' ? (
            <ArrowDownRight size={14} className="text-green-500" />
          ) : (
            <Activity size={14} className="text-neutral-500" />
          )}
          <span className={`text-xs font-bold ${trend === 'stable' ? 'text-neutral-500' : 'text-green-500'}`}>
            {trendValue || 'Estable'}
          </span>
        </div>
      )}
    </div>
  </motion.div>
);

// ===== 2. VISTAS DEL DASHBOARD =====

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stock }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-8">
    <div>
      <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">ANALÍTICA <span className="text-[#E8B923]">AVANZADA</span></h2>
      <p className="text-neutral-500 text-sm mt-1 uppercase font-bold tracking-widest">Insights y métricas profundas</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-4">
        <h3 className="text-lg font-black uppercase mb-6 text-[#E8B923]">Top Performers</h3>
        <div className="space-y-4">
          {stock
            .sort((a, b) => ((b.interesados || 0) / (b.vistas || 1)) - ((a.interesados || 0) / (a.vistas || 1)))
            .slice(0, 5)
            .map((car, idx) => (
              <motion.div
                key={car.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#E8B923]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8B923]/10 flex items-center justify-center">
                    <Award size={16} className="text-[#E8B923]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{car.marca} {car.modelo}</p>
                    <p className="text-xs text-neutral-500">{(((car.interesados || 0) / (car.vistas || 1)) * 100).toFixed(1)}% conversión</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-green-500">{car.interesados || 0} leads</p>
                  <p className="text-xs text-neutral-500">{car.vistas || 0} vistas</p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-4">
        <h3 className="text-lg font-black uppercase mb-6 text-[#E8B923]">Necesitan Atención</h3>
        <div className="space-y-4">
          {stock
            .filter((c) => c.estado === 'Disponible' && (c.diasStock || 0) > 20)
            .slice(0, 5)
            .map((car, idx) => (
              <motion.div
                key={car.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#E8B923]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8B923]/10 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-[#E8B923]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{car.marca} {car.modelo}</p>
                    <p className="text-xs text-neutral-500">{car.diasStock || 0} días en stock</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">{car.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
                  <p className="text-xs text-[#E8B923]">Considerar descuento</p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const InventoryView: React.FC<InventoryViewProps> = ({ stock, onEdit, onDelete }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="w-full space-y-8"
  >
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">
          ELITE STOCK <span className="text-[#E8B923]">LIST</span>
        </h2>
        <p className="text-neutral-500 text-sm mt-1 uppercase font-bold tracking-[0.2em]">
          Control total sobre unidades y precios
        </p>
      </div>
    </div>

    <div className="bg-[#080808] border border-white/5 overflow-hidden shadow-2xl w-full rounded-3xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.03] text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em] border-b border-white/5">
              <th className="p-4">Detalle Unidad</th>
              <th className="p-4">Estatus & Historial</th>
              <th className="p-4">Métricas</th>
              <th className="p-4">Valoración</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {stock.map((car) => {
              const lastPrice = car.precioHistorial?.[car.precioHistorial.length - 2]?.price;
              const priceTrend = lastPrice ? (car.precio < lastPrice ? 'down' : car.precio > lastPrice ? 'up' : 'stable') : 'stable';

              return (
                <motion.tr
                  key={car.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="group border-l-4 border-l-transparent hover:border-l-[#E8B923] transition-all"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-24 h-16 rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-[#E8B923]/50 transition-all shadow-lg relative"
                      >
                        {car.imagenes && car.imagenes.length > 0 ? (
                          <AutoCarousel images={car.imagenes} interval={3500} />
                        ) : (
                          <img 
                            src={car.imagen || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-bold text-white uppercase">
                          {car.ano}
                        </div>
                      </motion.div>
                      <div>
                        <h4 className="font-black text-base text-white italic leading-tight">
                          {car.marca} <span className="text-[#E8B923]">{car.modelo}</span>
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-neutral-500">{car.patente || 'S/P'}</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-700" />
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">{car.km.toLocaleString()} KM</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                          car.estado === 'Disponible' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-[#E8B923]/10 text-[#E8B923] border-[#E8B923]/20'
                        }`}>
                          {car.estado}
                        </span>
                        {priceTrend === 'down' && <span className="p-1 bg-blue-500/20 text-blue-500 rounded-md"><History size={10} /></span>}
                      </div>
                      <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{car.tipoVenta} • {car.vendedor}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center bg-white/5 p-2 rounded-xl border border-white/5 w-16">
                        <p className="text-xs font-black text-white">{car.vistas}</p>
                        <p className="text-[8px] text-neutral-600 uppercase font-bold">Vistas</p>
                      </div>
                      <div className="text-center bg-[#E8B923]/5 p-2 rounded-xl border border-[#E8B923]/10 w-16">
                        <p className="text-xs font-black text-[#E8B923]">{car.interesados}</p>
                        <p className="text-[8px] text-neutral-600 uppercase font-bold">Leads</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-sm text-white">
                          {car.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                        </p>
                        {priceTrend === 'down' ? <ArrowDownRight size={14} className="text-green-500" /> : priceTrend === 'up' ? <ArrowUpRight size={14} className="text-[#E8B923]" /> : null}
                      </div>
                      <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-tighter">Est. Com: {car.comisionEstimada?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(car)}
                        className="p-3 bg-neutral-900 border border-white/5 rounded-2xl hover:bg-[#E8B923] hover:text-black transition-all shadow-xl text-white"
                      >
                        <Edit3 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(car.id)}
                        className="p-3 bg-neutral-900 border border-white/5 rounded-2xl hover:bg-[#DAA520] hover:text-black transition-all shadow-xl text-white"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </motion.div>
);

const VehicleForm: React.FC<VehicleFormProps> = ({ car, onCancel, onSubmit }) => {
  // --- CORRECCIÓN 2: Eliminamos el useEffect problemático y usamos valores iniciales directos ---
  // Si 'car' existe al montar, lo usamos. Si no, usamos los defaults.
  const [formData, setFormData] = useState<Partial<Vehiculo>>(car || {
    marca: 'Chevrolet', 
    modelo: '', version: '', precio: 0, km: 0, ano: currentYear,
    transmision: 'Automática', combustible: 'Gasolina', 
    carroceria: 'SUV', puertas: 5, pasajeros: 5, motor: '', 
    techo: false, asientos: 'Cuero',
    tipoVenta: 'Propio', estado: 'Disponible', imagen: '', imagenes: [], 
    patente: '', color: 'Blanco', vistas: 0, interesados: 0, diasStock: 0, 
    comisionEstimada: 0, precioHistorial: [], vendedor: 'Admin Elite',
    financiable: true, valorPie: 0, aire: true, neumaticos: 'Nuevos', llaves: 2,
    obs: '', hotspots: [] 
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [tempHotspotCoords, setTempHotspotCoords] = useState<{ x: number, y: number } | null>(null);
  const [hotspotLabel, setHotspotLabel] = useState('');
  const [hotspotDetail, setHotspotDetail] = useState('');
  const imagePreviewRef = useRef<HTMLDivElement>(null);

  const comisionEstimada = useMemo(() => {
    return formData.precio ? Math.round(formData.precio * 0.02) : 0;
  }, [formData.precio]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(ev.target?.result) {
          const newImage = ev.target.result as string;
          setFormData(prev => {
            const currentImages = prev.imagenes || [];
            const isFirst = currentImages.length === 0 && !prev.imagen;
            return {
              ...prev,
              imagen: isFirst ? newImage : prev.imagen,
              imagenes: [...currentImages, newImage]
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!formData.imagenes || formData.imagenes.length === 0) return;
    if (!imagePreviewRef.current) return;

    const rect = imagePreviewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setTempHotspotCoords({ x: xPercent, y: yPercent });
    setHotspotLabel('');
    setHotspotDetail('');
  };

  const handleAddHotspot = () => {
    if (!tempHotspotCoords || !hotspotLabel || !hotspotDetail) {
      alert("Debes completar la etiqueta y el detalle del punto.");
      return;
    }

    const newHotspot: Hotspot = {
      id: Date.now().toString(),
      x: tempHotspotCoords.x,
      y: tempHotspotCoords.y,
      label: hotspotLabel.toUpperCase(),
      detail: hotspotDetail,
      imageIndex: activeImageIndex
    };

    setFormData(prev => ({
      ...prev,
      hotspots: [...(prev.hotspots || []), newHotspot]
    }));
    setTempHotspotCoords(null);
    setHotspotLabel('');
    setHotspotDetail('');
  };

  const handleDeleteHotspot = (idToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      hotspots: (prev.hotspots || []).filter(spot => spot.id !== idToDelete)
    }));
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => {
      const newImages = (prev.imagenes || []).filter((_, idx) => idx !== indexToRemove);
      const newHotspots = (prev.hotspots || [])
        .filter(h => h.imageIndex !== indexToRemove)
        .map(h => ({
          ...h,
          imageIndex: (h.imageIndex ?? 0) > indexToRemove ? (h.imageIndex ?? 0) - 1 : h.imageIndex
        }));
      
      return {
        ...prev,
        imagenes: newImages,
        imagen: newImages.length > 0 ? newImages[0] : '', 
        hotspots: newHotspots
      };
    });
    if (activeImageIndex >= indexToRemove && activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marca || !formData.modelo || !formData.precio || !formData.ano) {
      alert('Por favor completa los campos obligatorios: Marca, Modelo, Año y Precio.');
      return;
    }
    
    const vehiculoCompleto: Vehiculo = {
      id: car?.id || 0, // 0 para indicar nuevo si no existe ID
      marca: formData.marca,
      modelo: formData.modelo,
      version: formData.version || '',
      ano: formData.ano || currentYear,
      precio: formData.precio,
      km: formData.km || 0,
      duenos: formData.duenos || 1,
      traccion: formData.traccion || 'Delantera',
      transmision: formData.transmision || 'Automática',
      cilindrada: formData.cilindrada || '2.0L',
      combustible: formData.combustible || 'Gasolina',
      carroceria: formData.carroceria || 'SUV',
      puertas: formData.puertas || 5,
      pasajeros: formData.pasajeros || 5,
      motor: formData.motor || '',
      techo: formData.techo || false,
      asientos: formData.asientos || 'Tela',
      tipoVenta: (formData.tipoVenta as 'Propio' | 'Consignado') || 'Propio',
      vendedor: formData.vendedor || 'Admin Elite',
      financiable: formData.financiable ?? true,
      valorPie: formData.valorPie || 0,
      aire: formData.aire ?? true,
      neumaticos: formData.neumaticos || 'Buenos',
      llaves: formData.llaves || 2,
      obs: formData.obs || '',
      imagenes: formData.imagenes || [],
      estado: (formData.estado as 'Disponible' | 'Vendido' | 'Reservado') || 'Disponible',
      diasStock: formData.diasStock || 0,
      vistas: formData.vistas || 0,
      interesados: formData.interesados || 0,
      patente: formData.patente || '',
      color: formData.color || 'Blanco',
      comisionEstimada,
      precioHistorial: car?.precioHistorial || [{ date: new Date().toISOString().split('T')[0], price: formData.precio || 0 }],
      imagen: formData.imagen || '',
      hotspots: formData.hotspots || []
    };

    onSubmit(vehiculoCompleto);
  };

  const currentImage = formData.imagenes && formData.imagenes.length > 0 
    ? formData.imagenes[activeImageIndex] 
    : formData.imagen;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            className="p-4 bg-neutral-900 rounded-3xl border border-white/5 hover:border-[#E8B923]/40 hover:text-[#E8B923] transition-all shadow-xl"
          >
            <ArrowLeft size={24} className="text-white" />
          </motion.button>
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">
              {car ? 'Gestión de Unidad' : 'Nueva Adquisición'}
            </h2>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Ficha Técnica Completa</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          <FormSection title="Identidad & Clasificación" icon={Car} color="text-[#E8B923]">
            <div className="grid grid-cols-2 gap-6">
              <AutocompleteField 
                label="Marca" 
                value={formData.marca} 
                options={CAR_BRANDS} 
                placeholder="Buscar..."
                onChange={(v) => setFormData({ ...formData, marca: v })} 
              />
              <Field label="Modelo" value={formData.modelo} onChange={(v) => setFormData({ ...formData, modelo: v })} />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <Field label="Versión (Opcional)" value={formData.version} onChange={(v) => setFormData({ ...formData, version: v })} />
               <SelectField 
                label="Carrocería" 
                value={formData.carroceria} 
                options={['SUV', 'Sedán', 'Hatchback', 'Coupé', 'Camioneta', 'Convertible', 'Station Wagon', 'Van', 'Pickup', 'Furgón']} 
                onChange={(v) => setFormData({ ...formData, carroceria: v })} 
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <SelectField 
                label="Año" 
                value={formData.ano?.toString()} 
                options={YEARS} 
                onChange={(v) => setFormData({ ...formData, ano: parseInt(v) || currentYear })} 
              />
              
              <Field 
                label="Patente" 
                value={formData.patente} 
                onChange={(v) => setFormData({ ...formData, patente: v.toUpperCase() })} 
              />
              
              <AutocompleteField 
                label="Color" 
                value={formData.color} 
                options={CAR_COLORS} 
                placeholder="Escribir..."
                onChange={(v) => setFormData({ ...formData, color: v })} 
              />
            </div>
          </FormSection>

          <FormSection title="Estrategia Comercial" icon={DollarSign} color="text-green-500">
            <div className="grid grid-cols-2 gap-6">
              <Field 
                label="Precio Lista ($)" 
                type="number" 
                value={formData.precio} 
                onChange={(v) => {
                  const newPrice = parseInt(v) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    precio: newPrice,
                    valorPie: Math.round(newPrice * 0.20)
                  }));
                }} 
              />
              <Field 
                label="Pie Mínimo Sugerido ($)" 
                type="number" 
                value={formData.valorPie} 
                onChange={(v) => setFormData({ ...formData, valorPie: parseInt(v) || 0 })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <Field label="Vendedor Asignado" value={formData.vendedor} onChange={(v) => setFormData({ ...formData, vendedor: v })} />
               <SelectField label="Financiamiento" value={formData.financiable ? 'Sí' : 'No'} options={['Sí', 'No']} onChange={(v) => setFormData({ ...formData, financiable: v === 'Sí' })} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <SelectField 
                label="Modalidad" 
                value={formData.tipoVenta} 
                options={['Propio', 'Consignado']} 
                onChange={(v) => setFormData({ ...formData, tipoVenta: v as 'Propio' | 'Consignado' })} 
              />
              <SelectField 
                label="Estatus" 
                value={formData.estado} 
                options={['Disponible', 'Reservado', 'Vendido']} 
                onChange={(v) => setFormData({ ...formData, estado: v as 'Disponible' | 'Reservado' | 'Vendido' })} 
              />
            </div>
          </FormSection>

          <FormSection title="Especificaciones Técnicas" icon={ShieldCheck} color="text-blue-500">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Odómetro (KM)" type="number" value={formData.km} onChange={(v) => setFormData({ ...formData, km: parseInt(v) || 0 })} />
              <Field label="Motor / Cilindrada" value={formData.motor} onChange={(v) => setFormData({ ...formData, motor: v })} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <SelectField label="Transmisión" value={formData.transmision} options={['Automática', 'Mecánica', 'PDK', 'DSG', 'CVT']} onChange={(v) => setFormData({ ...formData, transmision: v })} />
              <SelectField label="Combustible" value={formData.combustible} options={['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico']} onChange={(v) => setFormData({ ...formData, combustible: v })} />
            </div>
             <div className="grid grid-cols-3 gap-4">
               <Field label="Puertas" type="number" value={formData.puertas} onChange={(v) => setFormData({ ...formData, puertas: parseInt(v) || 5 })} />
               <Field label="Pasajeros" type="number" value={formData.pasajeros} onChange={(v) => setFormData({ ...formData, pasajeros: parseInt(v) || 5 })} />
               <Field label="Dueños" type="number" value={formData.duenos} onChange={(v) => setFormData({ ...formData, duenos: parseInt(v) || 1 })} />
            </div>
             <div className="grid grid-cols-2 gap-6">
               <SelectField label="Tapiz / Asientos" value={formData.asientos} options={['Cuero', 'Tela', 'Alcántara', 'Mixto']} onChange={(v) => setFormData({ ...formData, asientos: v })} />
               <SelectField label="Techo Solar" value={formData.techo ? 'Sí' : 'No'} options={['Sí', 'No']} onChange={(v) => setFormData({ ...formData, techo: v === 'Sí' })} />
            </div>
          </FormSection>

           <FormSection title="Detalles & Observaciones" icon={Activity} color="text-orange-500">
              <div className="grid grid-cols-2 gap-6 mb-4">
                 <SelectField label="Estado Neumáticos" value={formData.neumaticos} options={['Nuevos', 'Buenos', 'Medios', 'Gastados']} onChange={(v) => setFormData({ ...formData, neumaticos: v })} />
                 <Field label="Nº de Llaves" type="number" value={formData.llaves} onChange={(v) => setFormData({ ...formData, llaves: parseInt(v) || 2 })} />
              </div>
              <TextAreaField 
                label="Observaciones Generales (Visible para clientes)" 
                value={formData.obs} 
                onChange={(v) => setFormData({ ...formData, obs: v })} 
                rows={4}
              />
           </FormSection>

          <div className="lg:col-span-2">
            <FormSection title="Galería y Puntos de Interés" icon={ImageIcon} color="text-purple-500">
              <div className="space-y-4">
                
                <div className="flex gap-2">
                  <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 cursor-pointer bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all">
                    <ImagePlus size={16} className="text-blue-400" /> <span>+ Fotos Exterior</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </motion.label>
                  <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 cursor-pointer bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all">
                    <ImagePlus size={16} className="text-orange-400" /> <span>+ Fotos Interior</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </motion.label>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                        Editor de Puntos (Foto {activeImageIndex + 1} de {formData.imagenes?.length || 0})
                      </label>
                      {formData.imagenes && formData.imagenes.length > 0 && (
                        <span className="text-[9px] text-[#E8B923] font-bold animate-pulse">Click en la foto para agregar punto</span>
                      )}
                    </div>

                  <div ref={imagePreviewRef} onClick={handleImageClick} className="aspect-[16/9] bg-neutral-900 border border-white/5 rounded-[2rem] overflow-hidden relative group cursor-crosshair shadow-2xl">
                    {currentImage ? (
                      <>
                        <img src={currentImage} className="w-full h-full object-cover pointer-events-none select-none" alt="Preview" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none" />
                        
                        {formData.imagenes && formData.imagenes.length > 1 && (
                          <>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev > 0 ? prev - 1 : (formData.imagenes?.length || 1) - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-[#E8B923] hover:text-black transition-colors z-40">
                              <ChevronLeft size={20} />
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev < (formData.imagenes?.length || 1) - 1 ? prev + 1 : 0); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-[#E8B923] hover:text-black transition-colors z-40">
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-700 pointer-events-none">
                        <ImageIcon size={48} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4">Sube fotos para comenzar</p>
                      </div>
                    )}

                    {formData.hotspots?.filter(h => h.imageIndex === activeImageIndex).map((spot) => (
                      <div key={spot.id} className="absolute w-5 h-5 bg-[#E8B923]/90 border-2 border-white rounded-full shadow-[0_0_15px_rgba(232,185,35,0.8)] transform -translate-x-1/2 -translate-y-1/2 z-20 group/spot cursor-pointer hover:scale-125 transition-transform" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteHotspot(spot.id); }} className="absolute -top-4 -right-4 bg-neutral-900 text-[#E8B923] rounded-full p-1 opacity-0 group-hover/spot:opacity-100 transition-all scale-75 hover:scale-100 border border-[#E8B923]/30">
                            <Trash2 size={12} />
                          </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/90 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover/spot:opacity-100 pointer-events-none z-50">
                          {spot.label}
                        </div>
                      </div>
                    ))}

                    {tempHotspotCoords && (
                      <div className="absolute w-5 h-5 bg-yellow-400 border-2 border-white rounded-full shadow-[0_0_15px_yellow] animate-bounce transform -translate-x-1/2 -translate-y-1/2 z-30" style={{ left: `${tempHotspotCoords.x}%`, top: `${tempHotspotCoords.y}%` }} />
                    )}
                  </div>

                  {formData.imagenes && formData.imagenes.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                      {formData.imagenes.map((img, idx) => (
                        <div key={idx} className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeImageIndex === idx ? 'border-[#E8B923] scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`} onClick={() => setActiveImageIndex(idx)}>
                          <img src={img} className="w-full h-full object-cover" alt="" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-0 right-0 p-0.5 bg-black/50 text-white hover:text-[#E8B923] hover:bg-black">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {tempHotspotCoords && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 p-5 bg-gradient-to-r from-neutral-900 to-neutral-900/50 border border-[#E8B923]/20 rounded-2xl space-y-4 relative shadow-xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#E8B923] rounded-l-2xl"/>
                        <h4 className="text-xs font-black uppercase text-white flex items-center gap-2">
                          <Target size={16} className="text-[#E8B923]" /> Detalle del Punto (En Foto {activeImageIndex + 1})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <Field label="Etiqueta (Ej: Fibra de Carbono)" value={hotspotLabel} onChange={setHotspotLabel} />
                          <Field label="Descripción Detallada" value={hotspotDetail} onChange={setHotspotDetail} />
                          <div className="flex gap-2">
                              <button type="button" onClick={handleAddHotspot} className="flex-1 bg-[#E8B923] hover:bg-[#DAA520] text-black font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#E8B923]/20">
                                  <PlusCircle size={16}/> Guardar
                              </button>
                              <button type="button" onClick={() => setTempHotspotCoords(null)} className="bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-all">
                                  Cancelar
                              </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FormSection>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-10">
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-[#E8B923] text-black font-black py-5 rounded-[2rem] shadow-2xl shadow-[#E8B923]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm italic uppercase">
            {car ? 'CONFIRMAR ACTUALIZACIÓN' : 'INGRESAR VEHÍCULO'}
          </motion.button>
          <motion.button type="button" onClick={onCancel} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-12 bg-neutral-900 border border-white/5 font-bold rounded-[2rem] text-neutral-500 hover:text-white transition-all text-sm">
            DESCARTAR
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// ===== 3. PANTALLAS (LoginScreen, LionsEliteDashboard) =====

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        onLogin();
      } else {
        setError('Credenciales incorrectas');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#E8B923]/5 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[#A37A00]/5 blur-[150px] rounded-full"
        />
      </div>

      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="absolute top-4 left-8 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group z-20"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Volver al Catálogo</span>
        </motion.button>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#080808] border border-white/5 overflow-hidden shadow-2xl w-full rounded-[2rem] p-8">
          <motion.div
            className="text-center mb-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="inline-flex p-6 rounded-[2rem] bg-gradient-to-br from-[#DAA520] to-[#E8B923] text-black mb-6 shadow-2xl shadow-[#E8B923]/40 relative overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <Zap size={48} fill="black" className="relative z-10" />
            </motion.div>
            <h1 className="text-5xl font-black italic tracking-tighter text-white mb-2">
              LIONS <span className="text-[#E8B923]">ELITE</span>
            </h1>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em]">
              Sistema de Gestión Automotriz
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-4">
                Usuario
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-[1.5rem] p-5 pl-12 text-sm focus:border-[#E8B923]/50 outline-none transition-all placeholder:text-neutral-800 text-white group-hover:border-white/20"
                  placeholder="admin"
                  disabled={isLoading}
                />
                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#E8B923] transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-4">
                Contraseña
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-[1.5rem] p-5 pl-12 text-sm focus:border-[#E8B923]/50 outline-none transition-all placeholder:text-neutral-800 text-white group-hover:border-white/20"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#E8B923] transition-colors" />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
                >
                  <AlertTriangle size={18} className="text-red-500" />
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#DAA520] to-[#E8B923] text-black font-black py-6 rounded-[1.5rem] shadow-2xl shadow-[#E8B923]/20 hover:shadow-[#E8B923]/40 transition-all mt-8 uppercase italic tracking-tighter text-lg relative overflow-hidden disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Zap size={24} />
                </motion.div>
              ) : (
                'Acceder al Sistema'
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-center text-[9px] text-neutral-700 font-bold uppercase tracking-widest mb-2">
              Demo Credentials
            </p>
            <div className="flex justify-center gap-4 text-[10px] text-neutral-600">
              <span>Usuario: <span className="text-[#E8B923]">admin</span></span>
              <span>•</span>
              <span>Pass: <span className="text-[#E8B923]">admin</span></span>
            </div>
          </div>

          <p className="text-center mt-6 text-[9px] text-neutral-700 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck size={12} className="text-green-500" />
            Conexión Segura SSL/TLS
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const LionsEliteDashboard: React.FC<DashboardProps> = ({
  stock,
  notifications,
  onAdd,
  onUpdate,
  onDelete,
  onBack,
  onLogout,
}) => {
  const [view, setView] = useState<'overview' | 'inventory' | 'form' | 'analytics'>('overview');
  const [filterText, setFilterText] = useState('');
  const [editingCar, setEditingCar] = useState<Vehiculo | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const stats = useMemo(() => {
    if (!stock) return { 
        totalValue: 0, avgDays: 0, leads: 0, count: 0, totalComission: 0, 
        available: 0, sold: 0, totalViews: 0, avgPrice: 0, conversionRate: '0' 
    };

    const available = stock.filter((c) => c.estado !== 'Vendido');
    const sold = stock.filter((c) => c.estado === 'Vendido');
    const totalValue = available.reduce((acc, c) => acc + c.precio, 0);
    const avgDays = Math.round(stock.reduce((acc, c) => acc + (c.diasStock || 0), 0) / (stock.length || 1));
    const leads = stock.reduce((acc, c) => acc + (c.interesados || 0), 0);
    const totalComission = available.reduce((acc, c) => acc + (c.comisionEstimada || 0), 0);
    const totalViews = stock.reduce((acc, c) => acc + (c.vistas || 0), 0);
    const avgPrice = totalValue / (available.length || 1);
    const conversionRate = ((sold.length / stock.length) * 100).toFixed(1);

    return {
      totalValue,
      avgDays,
      leads,
      count: stock.length,
      totalComission,
      available: available.length,
      sold: sold.length,
      totalViews,
      avgPrice,
      conversionRate
    };
  }, [stock]);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-[#E8B923]/30">
      <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-[#080808] border-r border-white/5 z-50 transition-all flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-10 h-10 bg-[#E8B923] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(232,185,35,0.2)]"
          >
            <Zap size={22} className="text-black fill-black" />
          </motion.div>
          <span className="hidden md:block font-black text-xl tracking-tighter italic text-white">LIONS <span className="text-[#E8B923]">ELITE</span></span>
        </div>

        <nav className="mt-8 px-4 space-y-1.5 flex-1">
          <NavItem active={view === 'overview'} icon={BarChart3} label="Dashboard" onClick={() => setView('overview')} />
          <NavItem active={view === 'inventory'} icon={Car} label="Inventario" onClick={() => setView('inventory')} />
          <NavItem active={view === 'form'} icon={PlusCircle} label="Publicar" onClick={() => { setEditingCar(null); setView('form'); }} />
          <NavItem active={view === 'analytics'} icon={LineChart} label="Analítica" onClick={() => setView('analytics')} />
          <div className="py-4"><div className="h-px bg-white/5 mx-2" /></div>
          {onBack && (
            <NavItem active={false} icon={ArrowLeft} label="Catálogo" onClick={onBack} color="text-blue-500/70" />
          )}
          <NavItem active={false} icon={LogOut} label="Cerrar Sesión" onClick={onLogout} color="text-red-500/70" />
        </nav>

        <div className="p-4 md:p-6 bg-white/[0.02] border-t border-white/5">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DAA520] to-[#E8B923] border border-yellow-400/20 flex items-center justify-center text-black font-bold"
            >
              A
            </motion.div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-white">Admin Elite</p>
              <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="pl-20 md:pl-64 transition-all min-h-screen flex flex-col">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <h1 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">
              System Status: Online
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
              <input
                placeholder="Buscar unidad o patente..."
                className="bg-neutral-900/50 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-xs outline-none focus:border-[#E8B923]/40 w-80 transition-all placeholder:text-neutral-700"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-neutral-900 rounded-2xl border border-white/5 hover:border-[#E8B923]/30 transition-all relative"
              >
                <Bell size={18} className="text-neutral-400" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-2 right-2 w-2 h-2 bg-[#E8B923] rounded-full border-2 border-black"
                />
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl p-4 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Notificaciones</h4>
                      <span className="text-[10px] text-[#E8B923] font-bold">{notifications.length} Nuevas</span>
                    </div>
                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <motion.div
                          key={n.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="p-3 bg-white/5 rounded-2xl flex gap-3 items-start border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <div className={`p-2 rounded-xl ${n.type === 'price' ? 'bg-blue-500/10 text-blue-500' :
                              n.type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                                'bg-[#E8B923]/10 text-[#E8B923]'
                            }`}>
                            {n.type === 'price' ? <TrendingUp size={14} /> :
                              n.type === 'warning' ? <AlertTriangle size={14} /> :
                                <Zap size={14} />}
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-neutral-200">{n.text}</p>
                            <p className="text-[9px] text-neutral-500 mt-0.5">{n.time} atrás</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="w-full space-y-10">
          <AnimatePresence mode="wait">
            {view === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="p-4 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KpiCard label="Valor del Inventario" value={`$${(stats.totalValue / 1000000).toFixed(1)}M`} icon={Wallet} trend="+5.2%" color="text-white" subValue={`${stats.available} unidades`} />
                  <KpiCard label="Comisión Proyectada" value={`$${(stats.totalComission / 1000000).toFixed(1)}M`} icon={Percent} trend="+1.1%" color="text-[#E8B923]" subValue="Este mes" />
                  <KpiCard label="Tasa de Conversión" value={`${stats.conversionRate}%`} icon={Target} sub="Performance" color="text-green-500" subValue={`${stats.sold} vendidos`} />
                  <KpiCard label="Engagement Total" value={stats.totalViews} icon={Eye} sub="Vistas" color="text-blue-500" subValue={`${stats.leads} leads`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard label="Rotación Media" value={`${stats.avgDays}`} unit="días" icon={Clock} trend="down" trendValue="15%" color="from-purple-500/10 to-purple-600/5" />
                  <StatCard label="Precio Promedio" value={`$${(stats.avgPrice / 1000000).toFixed(1)}`} unit="M" icon={DollarSign} trend="up" trendValue="8%" color="from-green-500/10 to-green-600/5" />
                  <StatCard label="Stock Activo" value={`${stats.available}`} unit="unidades" icon={Package} trend="stable" color="from-blue-500/10 to-blue-600/5" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="xl:col-span-2 bg-[#080808] border border-white/5 rounded-[2rem] p-4 shadow-inner">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="text-xl font-black italic tracking-tighter">RENDIMIENTO DE UNIDADES</h3>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Análisis de conversión por vistas</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase hover:bg-white/10 transition-colors border border-white/5">
                          Exportar
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {stock.slice(0, 5).map((car, idx) => {
                        const conversion = Math.round(((car.interesados || 0) / (car.vistas || 1)) * 100);
                        const lastPrice = car.precioHistorial?.[car.precioHistorial.length - 2]?.price;
                        const hasDropped = lastPrice && car.precio < lastPrice;

                        return (
                          <motion.div key={car.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} className="group relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 border border-white/5 relative">
                                  {car.imagenes && car.imagenes.length > 0 ? (
                                    <AutoCarousel images={car.imagenes} interval={3500} />
                                  ) : (
                                    <img src={car.imagen || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={`${car.marca} ${car.modelo}`} />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div>
                                  <p className="font-black text-sm text-neutral-200 italic">{car.marca} {car.modelo}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-tighter">{car.vistas} Vistas</span>
                                    <span className="text-[9px] font-bold text-[#E8B923]/70 uppercase tracking-tighter">• {car.interesados} Leads</span>
                                    {hasDropped && (
                                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-[8px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                                        <ArrowDownRight size={10} /> Oportunidad
                                      </motion.span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-mono font-bold">{car.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
                                <p className={`text-[9px] font-bold uppercase tracking-widest ${conversion > 10 ? 'text-green-500' : 'text-neutral-500'}`}>Tasa: {conversion}%</p>
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(conversion * 5, 100)}%` }} transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }} className={`h-full rounded-full ${conversion > 10 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-neutral-700'}`} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-0 right-0 p-20 bg-blue-500/5 blur-[80px] rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 mb-8">Composición Activa</h3>

                    <div className="w-48 h-48 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-neutral-900" />
                        <motion.circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} initial={{ strokeDashoffset: 502 }} animate={{ strokeDashoffset: 150 }} transition={{ duration: 1.5, ease: "easeOut" }} className="text-[#E8B923]" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="text-3xl font-black italic tracking-tighter">
                          70<span className="text-[#E8B923]">%</span>
                        </motion.p>
                        <p className="text-[10px] font-black uppercase text-neutral-500">Stock Propio</p>
                      </div>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-neutral-900/50 p-4 rounded-3xl border border-white/5 hover:border-[#E8B923]/30 transition-all cursor-pointer">
                        <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Propio</p>
                        <p className="text-lg font-black text-white italic">{stock.filter((c) => c.tipoVenta === 'Propio').length}u</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="bg-neutral-900/50 p-4 rounded-3xl border border-white/5 hover:border-[#E8B923]/30 transition-all cursor-pointer">
                        <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Consig.</p>
                        <p className="text-lg font-black text-white italic">{stock.filter((c) => c.tipoVenta === 'Consignado').length}u</p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'inventory' && (
              <InventoryView stock={stock} onEdit={(car) => { setEditingCar(car); setView('form'); }} onDelete={onDelete} />
            )}

            {view === 'form' && (
              <VehicleForm
                key={editingCar ? editingCar.id : 'new'} // Esta key es crucial para limpiar el formulario al cambiar de modo
                car={editingCar}
                onCancel={() => setView('inventory')}
                onSubmit={(data) => {
                  if (editingCar) {
                    onUpdate(data);
                  } else {
                    onAdd(data);
                  }
                  setView('inventory');
                }}
              />
            )}

            {view === 'analytics' && (
              <AnalyticsView stock={stock} stats={stats} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// ===== 4. EXPORT DEFAULT =====

export default function SellerPortal({ stock, onAdd, onUpdate, onDelete, onBack }: SellerPortalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications] = useState<Notification[]>([
    { id: 1, text: 'Baja de precio detectada en vehículo premium', type: 'price', time: '2h' },
    { id: 2, text: 'Nueva oferta recibida por BMW M4', type: 'lead', time: '5h' },
    { id: 3, text: 'Stock crítico en SUV compactos', type: 'warning', time: '1d' },
  ]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} onBack={onBack} />;
  }

  return (
    <LionsEliteDashboard
      stock={stock}
      notifications={notifications}
      onAdd={onAdd}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onBack={onBack}
      onLogout={() => setIsLoggedIn(false)}
    />
  );
}