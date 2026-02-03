import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import {
  Car, PlusCircle, LogOut, Wallet, Search, ArrowLeft,
  Image as ImageIcon, Edit3, DollarSign, Trash2,
  Zap, BarChart3, Clock, ShieldCheck, ChevronRight, ChevronLeft, ArrowUpRight,
  ArrowDownRight, Bell, History, Target, Percent, Eye, Users, Award, Lock,
  Activity, Package, AlertTriangle, LineChart, ImagePlus, Settings, CheckCircle, X,
  Armchair, TrendingUp, PieChart as PieIcon, BarChart2, Menu, Loader2 // <--- IMPORTANTE: 'Menu' agregado
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- LIBRERÍA DE GRÁFICOS (RECHARTS) ---
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadialBarChart, RadialBar, ScatterChart, Scatter
} from 'recharts';

// --- IMPORTACIÓN DE SERVICIOS (Simulada para mantener integridad) ---
import { carService } from '../services/api';
import type { Vehiculo, Hotspot, Brand, Color, User } from '../services/api';

// --- ESTILOS ---
const GOLD_MAIN = '#E8B923';
const GLASS_BG = "bg-[#080808]/90 backdrop-blur-xl border border-white/5";

// ===== LISTAS MAESTRAS (FALLBACK) =====
const CAR_COLORS = ["Blanco", "Blanco Perla", "Negro", "Negro Mate", "Gris Plata", "Gris Grafito", "Gris Oscuro", "Azul", "Rojo", "Verde", "Amarillo", "Naranja", "Beige", "Café", "Bronce", "Dorado", "Morado", "Violeta", "Celeste", "Turquesa", "Titanio", "Otro"];
const CAR_BRANDS = ["Abarth", "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Buick", "BYD", "Cadillac", "Changan", "Chery", "Chevrolet", "Chrysler", "Citroën", "Cupra", "Dacia", "Dodge", "Ferrari", "Fiat", "Ford", "GAC", "Geely", "GMC", "Haval", "Honda", "Hyundai", "Infiniti", "Isuzu", "JAC", "Jaguar", "Jeep", "Jetour", "Kia", "Lamborghini", "Land Rover", "Lexus", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault", "Rolls-Royce", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo", "Otro"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: (currentYear + 1) - 2000 + 1 }, (_, i) => (currentYear + 1 - i).toString());

// ===== INTERFACES =====
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }
interface Notification { id: number; text: string; type: 'price' | 'lead' | 'warning'; time: string; }
interface Stats {
  totalValue: number; avgDays: number; leads: number; count: number;
  totalComission: number; available: number; sold: number; totalViews: number;
  avgPrice: number; conversionRate: string;
}

// Props para componentes
interface ViewProps { stock: Vehiculo[]; }
interface DashboardViewProps extends ViewProps { stats: Stats; }
interface AnalyticsViewProps extends ViewProps { stats: Stats; }
interface InventoryViewProps extends ViewProps { onEdit: (car: Vehiculo) => void; onDelete: (id: number) => void; }
interface VehicleFormProps { car: Vehiculo | null; onCancel: () => void; onSubmit: (data: Vehiculo) => void; }
interface SettingsViewProps { showToast: (msg: string, type: 'success' | 'error' | 'info') => void; }
interface LoginScreenProps { onLogin: () => void; onBack?: () => void; }

interface SellerPortalProps {
  stock: Vehiculo[];
  onBack?: () => void;
  onAdd: (car: Vehiculo) => void;
  onUpdate: (car: Vehiculo) => void;
  onDelete: (id: number) => void;
}

// Interfaces UI
interface NavItemProps { active: boolean; icon: React.ElementType; label: string; onClick: () => void; color?: string; }
interface KpiCardProps { label: string; value: string | number; icon: React.ElementType; trend?: string; sub?: string; color: string; subValue?: string; }
interface StatCardProps { label: string; value: string; unit: string; icon: React.ElementType; trend?: 'up' | 'down' | 'stable'; trendValue?: string; color: string; }
interface FieldProps { label: string; value: string | number | undefined; onChange: (value: string) => void; type?: string; readOnly?: boolean; }
interface SelectFieldProps { label: string; value: string | undefined; options: string[]; onChange: (value: string) => void; }
interface TextAreaFieldProps { label: string; value: string | undefined; onChange: (value: string) => void; rows?: number; }
interface FormSectionProps { title: string; icon: React.ElementType; color: string; children: React.ReactNode; }
interface AutocompleteFieldProps { label: string; value: string | undefined; options: string[]; onChange: (value: string) => void; placeholder?: string; }

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number | string;
    name: string;
    payload?: Record<string, unknown>;
    dataKey?: string;
  }>;
  label?: string;
}

interface DashboardProps {
  stock: Vehiculo[];
  notifications: Notification[];
  onAdd: (car: Vehiculo) => void;
  onUpdate: (car: Vehiculo) => void;
  onDelete: (id: number) => void;
  onBack?: () => void;
  onLogout: () => void;
}

// ===== COMPONENTES UI GLOBALES =====

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: number) => void }) => (
  <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none max-w-[90vw] md:max-w-md">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div key={toast.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl w-full ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : toast.type === 'error' ? <X size={20} /> : <Bell size={20} />}
          <span className="text-sm font-bold truncate">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-auto opacity-50 hover:opacity-100 flex-shrink-0"><X size={16} /></button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = typeof data.value === 'number' ? data.value.toLocaleString() : data.value;
    const prefix = data.name === 'ventas' || data.name === 'monto' || data.name === 'Precio' ? '$' : '';

    return (
      <div className="bg-black/90 border border-[#E8B923]/30 p-3 rounded-xl backdrop-blur-md shadow-2xl">
        <p className="text-[#E8B923] text-xs font-bold mb-1">{label || data.name}</p>
        <p className="text-white text-xs font-mono">
          {prefix}{value}
        </p>
      </div>
    );
  }
  return null;
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon: Icon, trend, sub, color, subValue }) => (
  <motion.div whileHover={{ scale: 1.05, y: -5 }} className="bg-[#080808] border border-white/5 p-4 rounded-[2.5rem] relative overflow-hidden group shadow-inner cursor-pointer w-full">
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-3.5 bg-neutral-900 rounded-2xl border border-white/10 group-hover:border-[#E8B923]/40 transition-colors`}>
        <Icon size={22} className="text-[#E8B923]" />
      </div>
      {trend && <span className="text-[10px] font-black px-2.5 py-1.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1 uppercase tracking-tighter"><ArrowUpRight size={10} /> {trend}</span>}
    </div>
    <p className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1 relative z-10">{label}</p>
    <h3 className={`text-2xl md:text-3xl font-black italic tracking-tighter ${color} relative z-10 truncate`}>{value}</h3>
    {sub && <p className="text-[10px] font-bold text-neutral-700 uppercase mt-1 tracking-widest relative z-10">{sub}</p>}
    {subValue && <p className="text-[9px] font-bold text-neutral-600 mt-1 relative z-10">{subValue}</p>}
  </motion.div>
);

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon: Icon, trend, trendValue, color }) => (
  <motion.div whileHover={{ scale: 1.02, y: -5 }} className={`bg-gradient-to-br ${color} border border-white/5 p-6 rounded-[2rem] relative overflow-hidden w-full`}>
    <div className="absolute top-0 right-0 p-12 opacity-10"><Icon size={80} /></div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2"><Icon size={18} className="text-white" /><p className="text-xs font-bold text-neutral-400 uppercase">{label}</p></div>
      <div className="flex flex-wrap items-end gap-2"><h3 className="text-2xl md:text-3xl font-black text-white">{value}</h3><span className="text-sm font-bold text-neutral-400 mb-1">{unit}</span></div>
      {trend && <div className="mt-2 flex items-center gap-1">{trend === 'up' ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-green-500" />}<span className={`text-xs font-bold ${trend === 'stable' ? 'text-neutral-500' : 'text-green-500'}`}>{trendValue || 'Estable'}</span></div>}
    </div>
  </motion.div>
);

const AutoCarousel = ({ images, interval = 3000 }: { images: string[], interval?: number }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (!images || images.length === 0) return;
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), interval);
    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img key={currentIndex} src={images[currentIndex]} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"; }} />
      </AnimatePresence>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, idx) => (
          <motion.div key={idx} animate={{ width: currentIndex === idx ? 24 : 6, backgroundColor: currentIndex === idx ? GOLD_MAIN : 'rgba(255,255,255,0.5)' }} className="h-1.5 rounded-full transition-all" />
        ))}
      </div>
    </div>
  );
};

const FormSection: React.FC<FormSectionProps> = ({ title, icon: Icon, color, children }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${GLASS_BG} overflow-hidden shadow-2xl w-full rounded-3xl p-6 relative`}>
    <div className={`absolute top-0 right-0 p-12 bg-current opacity-[0.02] blur-3xl ${color}`} />
    <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-6 ${color} relative z-10`}>
      <Icon size={18} /> {title}
    </h3>
    <div className="relative z-10 space-y-6">{children}</div>
  </motion.div>
);

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = "text", readOnly = false }) => (
  <div className="space-y-2 flex-1 w-full">
    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} readOnly={readOnly} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#E8B923]/50 focus:bg-white/[0.02] transition-all text-white placeholder:text-neutral-800 hover:border-white/20 disabled:opacity-50" value={value || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange }) => (
  <div className="space-y-2 flex-1 w-full">
    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#E8B923]/50 focus:bg-white/[0.02] transition-all appearance-none cursor-pointer text-white hover:border-white/20" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt} value={opt} className="bg-black">{opt}</option>)}
      </select>
      <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-neutral-600 pointer-events-none" />
    </div>
  </div>
);

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, value, onChange, rows = 3 }) => (
  <div className="space-y-2 flex-1 w-full">
    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">{label}</label>
    <textarea rows={rows} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#E8B923]/50 focus:bg-white/[0.02] transition-all text-white placeholder:text-neutral-800 hover:border-white/20 resize-none" value={value || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({ label, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputValue = value || '';
  
  // FIX: Agregamos "opt &&" para evitar crash si vienen nulos desde la BD
  const filteredOptions = options.filter(opt => opt && opt.toLowerCase().includes(inputValue.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 flex-1 relative w-full" ref={containerRef}>
      <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#E8B923]/50 focus:bg-white/[0.02] transition-all text-white placeholder:text-neutral-800 hover:border-white/20"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
        />
        <Search size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
        <AnimatePresence>
          {isOpen && filteredOptions.length > 0 && (
            <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 right-0 top-full mt-2 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 scrollbar-hide">
              {filteredOptions.map((opt) => (
                <li key={opt} className="px-5 py-3 text-sm text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors flex items-center justify-between" onClick={() => { onChange(opt); setIsOpen(false); }}>
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
  <motion.button onClick={onClick} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} className={`w-full flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl transition-all group relative ${active ? 'bg-[#E8B923] text-black shadow-[0_8px_20px_rgba(232,185,35,0.2)]' : `hover:bg-white/5 ${color}`}`}>
    <Icon size={20} className={active ? 'text-black' : 'group-hover:text-white transition-colors'} strokeWidth={active ? 2.5 : 2} />
    <span className="md:hidden lg:block text-[13px] font-bold uppercase tracking-tight block">{label}</span>
    {active && <motion.div layoutId="nav-pill" className="absolute left-[-1rem] w-2 h-8 bg-[#E8B923] rounded-r-full hidden md:block" />}
  </motion.button>
);


// ===== VISTAS (DASHBOARD, ANALYTICS, INVENTORY, ETC) =====

// 1. DASHBOARD VIEW
const DashboardOverview: React.FC<DashboardViewProps> = ({ stats, stock }) => {
  const brandData = useMemo(() => {
    const counts: Record<string, number> = {};
    stock.forEach((car: Vehiculo) => { counts[car.marca] = (counts[car.marca] || 0) + 1; });

    interface BrandItem { name: string; value: number; }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a: BrandItem, b: BrandItem) => b.value - a.value);
  }, [stock]);

  const agingData = useMemo(() => {
    let fresh = 0, mid = 0, old = 0;
    stock.forEach((c: Vehiculo) => {
      const days = c.diasStock || 0;
      if (days <= 30) fresh++; else if (days <= 60) mid++; else old++;
    });
    return [
      { name: '0-30 días', cantidad: fresh, fill: '#10b981' },
      { name: '31-60 días', cantidad: mid, fill: '#E8B923' },
      { name: '60+ días', cantidad: old, fill: '#ef4444' }
    ];
  }, [stock]);

  const targetData = [{ name: 'Meta', value: 100, fill: '#333' }, { name: 'Logrado', value: 75, fill: '#E8B923' }];
  const COLORS = ['#E8B923', '#FFF', '#3b82f6', '#10b981', '#6366f1'];
  const trendData = [{ name: 'Ene', ventas: 24000000 }, { name: 'Feb', ventas: 13980000 }, { name: 'Mar', ventas: 48000000 }, { name: 'Abr', ventas: 39080000 }, { name: 'May', ventas: 48000000 }, { name: 'Jun', ventas: 38000000 }];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Valor Inventario", value: stats.totalValue.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', notation: 'compact' }), icon: Wallet, color: "text-white" },
          { label: "Unidades Activas", value: stats.available, icon: Car, color: "text-blue-500" },
          { label: "Vistas Totales", value: stats.totalViews, icon: Eye, color: "text-green-500" },
          { label: "Comisión Est.", value: stats.totalComission.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', notation: 'compact' }), icon: Percent, color: "text-[#E8B923]" },
        ].map((kpi, idx) => (<KpiCard key={idx} {...kpi} trend="+2.5%" sub="vs mes anterior" />))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${GLASS_BG} col-span-1 lg:col-span-2 rounded-3xl p-6 min-h-[300px] flex flex-col`}>
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><Activity size={18} className="text-[#E8B923]" /> Tendencia de Ingresos</h3>
          <div className="flex-1 w-full h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs><linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E8B923" stopOpacity={0.3} /><stop offset="95%" stopColor="#E8B923" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#555" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000000}M`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E8B923', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="ventas" stroke="#E8B923" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${GLASS_BG} rounded-3xl p-6 flex flex-col relative overflow-hidden`}>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Target size={16} className="text-red-500" /> META MENSUAL</h3>
          <div className="flex-1 min-h-[200px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={targetData}>
                <RadialBar background dataKey="value" cornerRadius={30} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-black text-white">75%</span><span className="text-[10px] text-neutral-500 uppercase tracking-widest">Logrado</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${GLASS_BG} rounded-3xl p-6 flex flex-col`}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><PieIcon size={16} className="text-blue-500" /> DISTRIBUCIÓN MARCAS</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={brandData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {brandData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${GLASS_BG} rounded-3xl p-6 flex flex-col`}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-orange-500" /> ANTIGÜEDAD STOCK</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" tick={{ fontSize: 10 }} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={30}>
                  {agingData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 2. ANALYTICS VIEW
const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stock, stats }) => {
  const bodyTypePriceData = useMemo(() => {
    const groups: Record<string, { total: number, count: number }> = {};
    stock.forEach((c: Vehiculo) => {
      if (!groups[c.carroceria]) groups[c.carroceria] = { total: 0, count: 0 };
      groups[c.carroceria].total += c.precio;
      groups[c.carroceria].count += 1;
    });

    interface BodyItem { name: string; value: number; }

    return Object.entries(groups)
      .map(([name, data]) => ({ name, value: Math.round(data.total / data.count) }))
      .sort((a: BodyItem, b: BodyItem) => b.value - a.value);
  }, [stock]);

  const scatterData = useMemo(() => stock.map((c: Vehiculo) => ({ x: c.precio, y: c.diasStock || 0, z: 1, name: `${c.marca} ${c.modelo}` })), [stock]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Rotación Media" value={`${stats.avgDays}`} unit="días" icon={Clock} trend="down" trendValue="15%" color="from-purple-500/10 to-purple-600/5" />
        <StatCard label="Precio Promedio" value={`${(stats.avgPrice / 1000000).toFixed(1)}`} unit="M" icon={DollarSign} trend="up" trendValue="8%" color="from-green-500/10 to-green-600/5" />
        <StatCard label="Stock Activo" value={`${stats.available}`} unit="unidades" icon={Package} trend="stable" color="from-blue-500/10 to-blue-600/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${GLASS_BG} rounded-[2.5rem] p-6 flex flex-col min-h-[400px]`}>
          <h3 className="text-lg font-black uppercase mb-6 text-white flex items-center gap-2"><BarChart2 size={18} className="text-[#E8B923]" /> Valoración por Segmento</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bodyTypePriceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#555" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val / 1000000}M`} />
                <YAxis dataKey="name" type="category" stroke="#fff" tick={{ fontSize: 11, fontWeight: 'bold' }} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" fill="#E8B923" radius={[0, 4, 4, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${GLASS_BG} rounded-[2.5rem] p-6 flex flex-col min-h-[400px]`}>
          <div className="mb-4">
            <h3 className="text-lg font-black uppercase text-white flex items-center gap-2"><TrendingUp size={18} className="text-blue-500" /> Matriz de Eficiencia</h3>
            <p className="text-[10px] text-neutral-500">Eje X: Precio | Eje Y: Días en Stock</p>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="x" name="Precio" unit="$" stroke="#555" tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000000}M`} />
                <YAxis type="number" dataKey="y" name="Días" unit="d" stroke="#555" tick={{ fontSize: 10 }} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  content={(props: any) => {
                    const { active, payload } = props;
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as { name: string; x: number; y: number };
                      return (
                        <div className="bg-black/90 border border-blue-500/30 p-3 rounded-xl backdrop-blur-md">
                          <p className="text-white text-xs font-bold">{data.name}</p>
                          <p className="text-blue-400 text-xs">Precio: ${payload[0].value?.toLocaleString()}</p>
                          {payload[1] && (<p className="text-neutral-400 text-xs">Días: {payload[1].value}</p>)}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Autos" data={scatterData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${GLASS_BG} rounded-[2.5rem] p-4`}>
          <h3 className="text-lg font-black uppercase mb-6 text-[#E8B923]">Top Performers (Vistas/Leads)</h3>
          <div className="space-y-4">
            {(() => {
              const topPerformers = stock
                .filter((c: Vehiculo) => (c.vistas || 0) > 0)
                .sort((a: Vehiculo, b: Vehiculo) => {
                  const convA = (a.interesados || 0) / (a.vistas || 1);
                  const convB = (b.interesados || 0) / (b.vistas || 1);
                  if (convB !== convA) return convB - convA;
                  return (b.vistas || 0) - (a.vistas || 0);
                })
                .slice(0, 5);

              if (topPerformers.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Eye size={48} className="text-neutral-700 mb-4" />
                    <p className="text-sm font-bold text-neutral-500 mb-2">Sin datos de rendimiento</p>
                    <p className="text-xs text-neutral-600 max-w-xs">
                      Los vehículos comenzarán a aparecer aquí cuando reciban vistas e interesados desde el catálogo público.
                    </p>
                  </div>
                );
              }

              return topPerformers.map((car) => (
                <div key={car.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#E8B923]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8B923]/10 flex items-center justify-center flex-shrink-0"><Award size={16} className="text-[#E8B923]" /></div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-white truncate">{car.marca} {car.modelo}</p>
                      <p className="text-xs text-neutral-500">
                        {car.vistas > 0 ? `${(((car.interesados || 0) / car.vistas) * 100).toFixed(1)}% conversión` : 'Sin vistas'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-mono font-bold text-green-500">{car.interesados || 0} leads</p>
                    <p className="text-xs text-neutral-500">{car.vistas || 0} vistas</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
        <div className={`${GLASS_BG} rounded-[2.5rem] p-4`}>
          <h3 className="text-lg font-black uppercase mb-6 text-red-500 flex items-center gap-2"><AlertTriangle size={18} className="text-red-500" /> Necesitan Atención (+20 días)</h3>
          <div className="space-y-4">
            {(() => {
              const needsAttention = stock.filter((c: Vehiculo) => c.estado === 'Disponible' && (c.diasStock || 0) > 20).slice(0, 5);
              
              if (needsAttention.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle size={48} className="text-green-600 mb-4" />
                    <p className="text-sm font-bold text-green-500 mb-2">¡Excelente rotación!</p>
                    <p className="text-xs text-neutral-600 max-w-xs">
                      No hay vehículos con más de 20 días en stock. Tu inventario está rotando eficientemente.
                    </p>
                  </div>
                );
              }

              return needsAttention.map((car) => (
                <div key={car.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0"><AlertTriangle size={16} className="text-red-500" /></div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-white truncate">{car.marca} {car.modelo}</p>
                      <p className="text-xs text-neutral-500">{car.diasStock || 0} días en stock</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-mono font-bold text-white">{car.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
                    <p className="text-xs text-[#E8B923]">Considerar descuento</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

 // Asegúrate de importar AlertTriangle arriba en tu archivo:
// import { ..., AlertTriangle } from 'lucide-react';

// 3. SETTINGS VIEW
const SettingsView: React.FC<SettingsViewProps> = ({ showToast }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Estados para los formularios existentes
  const [newBrand, setNewBrand] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'vendedor' });

  // 1. NUEVO ESTADO PARA EL BOTÓN DE OPTIMIZACIÓN
  const [isOptimizing, setIsOptimizing] = useState(false); // <--- NUEVO
  const [isSimulating, setIsSimulating] = useState(false); // <--- NUEVO PARA SIMULACIÓN
  const [isResetting, setIsResetting] = useState(false); // <--- NUEVO PARA RESETEO

  useEffect(() => {
    const loadData = async () => {
      try {
        const [b, c, u] = await Promise.all([carService.getBrands(), carService.getColors(), carService.getUsers()]);
        setBrands(b); setColors(c); setUsers(u);
      } catch { console.error("Error cargando configuración, usando defaults."); }
    };
    loadData();
  }, []);

  const addBrand = async () => { if (newBrand) { await carService.createBrand(newBrand); setNewBrand(''); showToast('Marca agregada', 'success'); } };
  const delBrand = async (id: number) => { await carService.deleteBrand(id); showToast('Marca eliminada', 'info'); };
  const addColor = async () => { if (newColor) { await carService.createColor(newColor); setNewColor(''); showToast('Color agregado', 'success'); } };
  const delColor = async (id: number) => { await carService.deleteColor(id); showToast('Color eliminado', 'info'); };
  const addUser = async () => { if (newUser.username && newUser.password) { await carService.createUser(newUser as User); setNewUser({ username: '', password: '', role: 'vendedor' }); showToast('Usuario creado', 'success'); } };
  const delUser = async (id: number) => { await carService.deleteUser(id); showToast('Usuario eliminado', 'info'); };

  // 2. NUEVA LÓGICA DE OPTIMIZACIÓN MASIVA (INICIO) --->
  const handleEmergencyOptimize = async () => {
    if (!window.confirm("⚠️ ATENCIÓN: Esto procesará TODAS las imágenes de la base de datos para reducir su peso.\n\nEste proceso puede tardar unos minutos.\n¿Estás seguro de continuar?")) return;
    
    setIsOptimizing(true);
    showToast("Iniciando optimización masiva...", "info");

    // Función auxiliar interna para comprimir Base64
    const compressBase64 = (base64: string): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000; // Calidad segura
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Comprimir a WebP calidad 0.6
             resolve(canvas.toDataURL('image/webp', 0.6));
          } else {
             resolve(base64);
          }
        };
        img.onerror = () => resolve(base64); // Si falla, devolver original
      });
    };

    try {
      // 1. Traemos todos los autos
      const allCars = await carService.getAll(); 
      let processedCount = 0;
      
      for (const car of allCars) {
        let modified = false;
        const newImages = [];

        // 2. Revisamos sus imágenes
        if (car.imagenes && car.imagenes.length > 0) {
          for (const img of car.imagenes) {
              // Solo comprimir si es base64 y es muy pesado (>300kb de texto aprox)
              if (img.startsWith('data:image') && img.length > 300000) { 
                  const optimized = await compressBase64(img);
                  newImages.push(optimized);
                  modified = true;
              } else {
                  newImages.push(img);
              }
          }
        }

        // 3. Si optimizamos algo, guardamos en base de datos
        if (modified) {
          await carService.update({ ...car, imagenes: newImages });
          processedCount++;
        }
      }
      showToast(`¡Listo! Se optimizaron ${processedCount} vehículos.`, "success");
    } catch (error) {
      console.error(error);
      showToast("Error durante la optimización.", "error");
    } finally {
      setIsOptimizing(false);
    }
  };
  // <--- NUEVA LÓGICA DE OPTIMIZACIÓN MASIVA (FIN)

  // 3. NUEVA FUNCIÓN: SIMULAR DATOS DE MÉTRICAS (INICIO) --->
  const handleSimulateMetrics = async () => {
    if (!window.confirm("🎲 SIMULACIÓN DE DATOS\n\nEsto agregará vistas e interesados aleatorios a todos los vehículos disponibles.\n\n¿Continuar?")) return;
    
    setIsSimulating(true);
    showToast("Simulando métricas...", "info");

    try {
      const allCars = await carService.getAll();
      let updatedCount = 0;

      for (const car of allCars) {
        if (car.estado === 'Disponible') {
          // Generar números aleatorios realistas
          const randomViews = Math.floor(Math.random() * 150) + 10; // Entre 10 y 160 vistas
          const randomInterested = Math.floor(Math.random() * (randomViews * 0.3)); // Hasta 30% de conversión
          
          // Actualizar el vehículo
          await carService.update({
            ...car,
            vistas: (car.vistas || 0) + randomViews,
            interesados: (car.interesados || 0) + randomInterested
          });
          
          updatedCount++;
        }
      }

      showToast(`✅ ${updatedCount} vehículos actualizados. Recargando...`, "success");
      
      // Recargar la página después de 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast("Error durante la simulación", "error");
      setIsSimulating(false);
    }
  };
  // <--- NUEVA FUNCIÓN: SIMULAR DATOS DE MÉTRICAS (FIN)

  // 4. NUEVA FUNCIÓN: RESETEAR MÉTRICAS (INICIO) --->
  const handleResetMetrics = async () => {
    if (!window.confirm("⚠️ RESETEAR MÉTRICAS\n\nEsto pondrá en CERO las vistas e interesados de TODOS los vehículos.\n\n¿Estás seguro?")) return;
    
    setIsResetting(true);
    showToast("Reseteando métricas...", "info");

    try {
      await carService.resetMetrics();
      showToast("✅ Todas las métricas fueron reseteadas a 0. Recargando...", "success");
      
      // Recargar la página después de 1 segundo para que el usuario vea el mensaje
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast("Error al resetear métricas", "error");
      setIsResetting(false);
    }
  };
  // <--- NUEVA FUNCIÓN: RESETEAR MÉTRICAS (FIN)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 p-4">
      <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white">CONFIGURACIÓN <span className="text-[#E8B923]">SISTEMA</span></h2>
      
      {/* CAMBIO EN EL GRID: 
          Originalmente era 'md:grid-cols-3'. 
          Puedes dejarlo así (la tarjeta roja bajará a la siguiente fila) 
          o cambiarlo a 'md:grid-cols-2 lg:grid-cols-4' para que quepan todos.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* MARCAS */}
        <div className={`${GLASS_BG} rounded-3xl p-6`}>
          <h3 className="text-sm font-bold text-[#E8B923] mb-4 flex items-center gap-2"><Award size={16} /> GESTIÓN MARCAS</h3>
          <div className="flex gap-2 mb-4">
            <input className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white w-full" placeholder="Nueva Marca" value={newBrand} onChange={e => setNewBrand(e.target.value)} />
            <button onClick={addBrand} className="bg-[#E8B923] text-black p-2 rounded-xl flex-shrink-0"><PlusCircle size={16} /></button>
          </div>
          <div className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {brands.map(b => (<div key={b.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg hover:bg-white/10"><span className="text-xs text-white">{b.name}</span><button onClick={() => delBrand(b.id)} className="text-neutral-500 hover:text-red-500"><Trash2 size={12} /></button></div>))}
          </div>
        </div>

        {/* COLORES */}
        <div className={`${GLASS_BG} rounded-3xl p-6`}>
          <h3 className="text-sm font-bold text-blue-500 mb-4 flex items-center gap-2"><ImagePlus size={16} /> GESTIÓN COLORES</h3>
          <div className="flex gap-2 mb-4">
            <input className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white w-full" placeholder="Nuevo Color" value={newColor} onChange={e => setNewColor(e.target.value)} />
            <button onClick={addColor} className="bg-blue-500 text-white p-2 rounded-xl flex-shrink-0"><PlusCircle size={16} /></button>
          </div>
          <div className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {colors.map(c => (<div key={c.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg hover:bg-white/10"><span className="text-xs text-white">{c.name}</span><button onClick={() => delColor(c.id)} className="text-neutral-500 hover:text-red-500"><Trash2 size={12} /></button></div>))}
          </div>
        </div>

        {/* USUARIOS */}
        <div className={`${GLASS_BG} rounded-3xl p-6`}>
          <h3 className="text-sm font-bold text-green-500 mb-4 flex items-center gap-2"><Users size={16} /> GESTIÓN USUARIOS</h3>
          <div className="space-y-2 mb-4">
            <input className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white w-full" placeholder="Usuario" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
            <input className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white w-full" type="password" placeholder="Contraseña" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <button onClick={addUser} className="w-full bg-green-500 text-black font-bold text-xs py-2 rounded-xl">CREAR USUARIO</button>
          </div>
          <div className="h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {users.map(u => (<div key={u.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg hover:bg-white/10"><span className="text-xs text-white">{u.username} <span className="text-neutral-500">({u.role})</span></span><button onClick={() => delUser(u.id)} className="text-neutral-500 hover:text-red-500"><Trash2 size={12} /></button></div>))}
          </div>
        </div>

        {/* 3. NUEVA TARJETA: ZONA DE PELIGRO (INICIO) ---> */}
        <div className={`${GLASS_BG} rounded-3xl p-6 border border-red-500/20 bg-red-500/5`}>
          <h3 className="text-sm font-bold text-red-500 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} /> MANTENIMIENTO
          </h3>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Herramientas de optimización y pruebas del sistema.
          </p>
          <div className="space-y-3">
             <button 
              onClick={handleEmergencyOptimize} 
              disabled={isOptimizing}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isOptimizing 
                  ? 'bg-neutral-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white'
              }`}
            >
              {isOptimizing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    OPTIMIZANDO...
                  </>
              ) : (
                  'OPTIMIZAR IMÁGENES DB'
              )}
            </button>

            <button 
              onClick={handleSimulateMetrics} 
              disabled={isSimulating}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isSimulating 
                  ? 'bg-neutral-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/50 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {isSimulating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    SIMULANDO...
                  </>
              ) : (
                  '🎲 SIMULAR MÉTRICAS'
              )}
            </button>

            <button 
              onClick={handleResetMetrics} 
              disabled={isResetting}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isResetting 
                  ? 'bg-neutral-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-orange-500/10 text-orange-500 border border-orange-500/50 hover:bg-orange-500 hover:text-white'
              }`}
            >
              {isResetting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    RESETEANDO...
                  </>
              ) : (
                  '🔄 RESETEAR MÉTRICAS'
              )}
            </button>
          </div>
        </div>
        {/* <--- NUEVA TARJETA: ZONA DE PELIGRO (FIN) */}

      </div>
    </motion.div>
  );
};

// 4. INVENTORY VIEW
const InventoryView: React.FC<InventoryViewProps> = ({ stock, onEdit, onDelete }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-8">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div><h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-white">ELITE STOCK <span className="text-[#E8B923]">LIST</span></h2><p className="text-neutral-500 text-xs md:text-sm mt-1 uppercase font-bold tracking-[0.2em]">Control total sobre unidades y precios</p></div>
    </div>
    <div className={`${GLASS_BG} overflow-hidden shadow-2xl w-full rounded-3xl`}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white/[0.03] text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em] border-b border-white/5"><th className="p-4">Detalle Unidad</th><th className="p-4">Estatus & Historial</th><th className="p-4">Métricas</th><th className="p-4">Valoración</th><th className="p-4 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {stock.map((car) => {
              const lastPrice = car.precioHistorial?.[car.precioHistorial.length - 2]?.price;
              const priceTrend = lastPrice ? (car.precio < lastPrice ? 'down' : car.precio > lastPrice ? 'up' : 'stable') : 'stable';
              return (
                <motion.tr key={car.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} className="group border-l-4 border-l-transparent hover:border-l-[#E8B923] transition-all">
                  <td className="p-4">
                    <div className="flex items-center gap-6">
                      <motion.div whileHover={{ scale: 1.1 }} className="w-24 h-16 rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-[#E8B923]/50 transition-all shadow-lg relative flex-shrink-0">
                        {car.imagenes && car.imagenes.length > 0 ? <AutoCarousel images={car.imagenes} interval={3500} /> : <img src={car.imagen || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'} alt="" className="w-full h-full object-cover" />}
                        <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-bold text-white uppercase">{car.ano}</div>
                      </motion.div>
                      <div>
                        <h4 className="font-black text-base text-white italic leading-tight">{car.marca} <span className="text-[#E8B923]">{car.modelo}</span></h4>
                        <div className="flex items-center gap-2 mt-1"><span className="text-[10px] font-mono text-neutral-500">{car.patente || 'S/P'}</span><span className="w-1 h-1 rounded-full bg-neutral-700" /><span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">{car.km.toLocaleString()} KM</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${car.estado === 'Disponible' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-[#E8B923]/10 text-[#E8B923] border-[#E8B923]/20'}`}>{car.estado}</span>{priceTrend === 'down' && <span className="p-1 bg-blue-500/20 text-blue-500 rounded-md"><History size={10} /></span>}</div>
                      <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{car.tipoVenta} • {car.vendedor}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center bg-white/5 p-2 rounded-xl border border-white/5 w-16"><p className="text-xs font-black text-white">{car.vistas}</p><p className="text-[8px] text-neutral-600 uppercase font-bold">Vistas</p></div>
                      <div className="text-center bg-[#E8B923]/5 p-2 rounded-xl border border-[#E8B923]/10 w-16"><p className="text-xs font-black text-[#E8B923]">{car.interesados}</p><p className="text-[8px] text-neutral-600 uppercase font-bold">Leads</p></div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2"><p className="font-mono font-bold text-sm text-white">{car.precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>{priceTrend === 'down' ? <ArrowDownRight size={14} className="text-green-500" /> : priceTrend === 'up' ? <ArrowUpRight size={14} className="text-[#E8B923]" /> : null}</div>
                      <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-tighter">Est. Com: {car.comisionEstimada?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(car)} className="p-3 bg-neutral-900 border border-white/5 rounded-2xl hover:bg-[#E8B923] hover:text-black transition-all shadow-xl text-white"><Edit3 size={16} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(car.id)} className="p-3 bg-neutral-900 border border-white/5 rounded-2xl hover:bg-[#DAA520] hover:text-black transition-all shadow-xl text-white"><Trash2 size={16} /></motion.button>
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

// 5. VEHICLE FORM (CORREGIDO)
const VehicleForm: React.FC<VehicleFormProps> = ({ car, onCancel, onSubmit }) => {
  const [brandOptions, setBrandOptions] = useState<string[]>(CAR_BRANDS);
  const [colorOptions, setColorOptions] = useState<string[]>(CAR_COLORS);
  // Estado para saber si se está subiendo una imagen
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brands = await carService.getBrands();
        if (brands && brands.length > 0) setBrandOptions(brands.map(b => b.name));
        const colors = await carService.getColors();
        if (colors && colors.length > 0) setColorOptions(colors.map(c => c.name));
      } catch { /* Fallback */ }
    };
    fetchData();
  }, []);

  // INICIALIZACIÓN DEL ESTADO (Incluye nuevos campos del backend)
  const [formData, setFormData] = useState<Partial<Vehiculo>>(car || {
    marca: 'Chevrolet', modelo: '', version: '', precio: 0, km: 0, ano: currentYear,
    transmision: 'Automática', traccion: '4x2', combustible: 'Gasolina', carroceria: 'SUV',
    puertas: 5, pasajeros: 5, duenos: 1, motor: '', cilindrada: '',
    techo: false, asientos: 'Cuero', tipoVenta: 'Propio', estado: 'Disponible',
    imagen: '', imagenes: [], patente: '', color: 'Blanco',
    vistas: 0, interesados: 0, diasStock: 0, comisionEstimada: 0,
    precioHistorial: [], vendedor: 'Admin Elite', financiable: true, valorPie: 0,
    aire: true, neumaticos: 'Nuevos', llaves: 2, obs: '', hotspots: []
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [tempHotspotCoords, setTempHotspotCoords] = useState<{ x: number, y: number } | null>(null);
  const [hotspotLabel, setHotspotLabel] = useState('');
  const [hotspotDetail, setHotspotDetail] = useState('');
  const imagePreviewRef = useRef<HTMLDivElement>(null);

  // Manejo de Imágenes
  // --- FUNCIÓN DE CARGA OPTIMIZADA ---
  // --- FUNCIÓN DE CARGA AL VPS ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validación vital: Marca y Modelo deben existir para crear la carpeta
    if (!formData.marca || !formData.modelo) {
        alert("⚠️ ATENCIÓN: Por favor escribe la MARCA y el MODELO antes de subir fotos.\nEl sistema necesita estos datos para crear la carpeta correcta en el servidor.");
        return;
    }

    setIsUploading(true); // Activamos el spinner

    try {
        const uploadedUrls: string[] = [];
        
        // Subimos archivo por archivo
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Llamamos al servicio que creamos en api.ts
            const url = await carService.uploadImage(file, formData.marca, formData.modelo);
            uploadedUrls.push(url);
        }

        // Guardamos las URLs que nos devolvió el servidor (https://lionscars.cl/uploads/...)
        setFormData(prev => ({
            ...prev,
            imagen: (!prev.imagenes || prev.imagenes.length === 0) ? uploadedUrls[0] : prev.imagen,
            imagenes: [...(prev.imagenes || []), ...uploadedUrls]
        }));

    } catch (error) {
        console.error("Error subiendo imágenes", error);
        alert("Hubo un error al subir las imágenes. Revisa que el backend esté corriendo.");
    } finally {
        setIsUploading(false); // Desactivamos el spinner
        e.target.value = ''; // Limpiamos el input por si quieres subir la misma foto de nuevo
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = (prev.imagenes || []).filter((_, i) => i !== index);
      const newActiveIndex = activeImageIndex >= newImages.length ? Math.max(0, newImages.length - 1) : activeImageIndex;
      setActiveImageIndex(newActiveIndex);
      return { ...prev, imagenes: newImages, imagen: newImages[0] || '' };
    });
  };

  // Manejo de Hotspots
  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!formData.imagenes || formData.imagenes.length === 0) return;
    if (!imagePreviewRef.current) return;
    const rect = imagePreviewRef.current.getBoundingClientRect();
    setTempHotspotCoords({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const handleAddHotspot = () => {
    if (!tempHotspotCoords || !hotspotLabel) return;
    const newSpot: Hotspot = {
      id: Date.now().toString(),
      x: tempHotspotCoords.x,
      y: tempHotspotCoords.y,
      label: hotspotLabel,
      detail: hotspotDetail,
      imageIndex: activeImageIndex
    };
    setFormData(prev => ({ ...prev, hotspots: [...(prev.hotspots || []), newSpot] }));
    setTempHotspotCoords(null); setHotspotLabel(''); setHotspotDetail('');
  };

  const handleDeleteHotspot = (idToDelete: string) => {
    setFormData(prev => ({ ...prev, hotspots: (prev.hotspots || []).filter(spot => spot.id !== idToDelete) }));
  };

  // SUBMIT (Blindado contra errores 422 y NaN)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marca || !formData.modelo) {
        alert("La Marca y el Modelo son obligatorios.");
        return;
    }

    onSubmit({
      ...formData,
      id: car?.id || 0,
      // Parseamos todo a número explícitamente, usando 0 como fallback
      precio: Number(formData.precio) || 0,
      km: Number(formData.km) || 0,
      valorPie: Number(formData.valorPie) || 0,
      llaves: Number(formData.llaves) || 0,
      duenos: Number(formData.duenos) || 1,
      puertas: Number(formData.puertas) || 5,
      pasajeros: Number(formData.pasajeros) || 5,
      
      comisionEstimada: Math.round((Number(formData.precio) || 0) * 0.02),
      precioHistorial: car?.precioHistorial || [{ date: new Date().toISOString().split('T')[0], price: Number(formData.precio) || 0 }],
      imagenes: formData.imagenes || [],
      hotspots: formData.hotspots || []
    } as Vehiculo);
  };

  const currentImage = formData.imagenes?.[activeImageIndex] || formData.imagen;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white">{car ? 'GESTIÓN DE UNIDAD' : 'NUEVA ADQUISICIÓN'}</h2>
        <button onClick={onCancel} className="px-6 py-2 bg-neutral-900 border border-white/10 rounded-full text-white hover:bg-white/5 w-full md:w-auto">CANCELAR</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECCIÓN 1: IDENTIDAD */}
        <FormSection title="Identidad & Clasificación" icon={Car} color="text-[#E8B923]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AutocompleteField label="Marca" value={formData.marca} options={brandOptions} placeholder="Buscar..." onChange={(v) => setFormData({ ...formData, marca: v })} />
            <Field label="Modelo" value={formData.modelo} onChange={(v) => setFormData({ ...formData, modelo: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Versión" value={formData.version} onChange={(v) => setFormData({ ...formData, version: v })} />
            <SelectField label="Carrocería" value={formData.carroceria} options={['SUV', 'Sedán', 'Hatchback', 'Camioneta', 'Coupé', 'Furgon']} onChange={(v) => setFormData({ ...formData, carroceria: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField label="Año" value={formData.ano?.toString()} options={YEARS} onChange={(v) => setFormData({ ...formData, ano: parseInt(v) })} />
            {/* Patente: Se deja visible porque es importante para el backend */}
            <Field label="Patente" value={formData.patente} onChange={(v) => setFormData({ ...formData, patente: v.toUpperCase() })} />
            <AutocompleteField label="Color" value={formData.color} options={colorOptions} placeholder="Buscar..." onChange={(v) => setFormData({ ...formData, color: v })} />
          </div>
        </FormSection>

        {/* SECCIÓN 2: ESTRATEGIA COMERCIAL */}
        <FormSection title="Estrategia Comercial" icon={DollarSign} color="text-green-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field 
                label="Precio" type="number" value={formData.precio} 
                onChange={(v) => {
                    const val = v === '' ? 0 : parseInt(v);
                    setFormData({ ...formData, precio: val, valorPie: Math.round(val * 0.2) });
                }} 
            />
            <Field 
                label="Pie Mínimo" type="number" value={formData.valorPie} 
                onChange={(v) => setFormData({ ...formData, valorPie: v === '' ? 0 : parseInt(v) })} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Modalidad" value={formData.tipoVenta} options={['Propio', 'Consignado']} onChange={(v) => setFormData({ ...formData, tipoVenta: v as 'Propio' | 'Consignado' })} />
            <SelectField label="Estatus" value={formData.estado} options={['Disponible', 'Reservado', 'Vendido']} onChange={(v) => setFormData({ ...formData, estado: v as 'Disponible' | 'Reservado' | 'Vendido' })} />
          </div>
        </FormSection>

        {/* SECCIÓN 3: ESPECIFICACIONES TÉCNICAS (ACTUALIZADA) */}
        <FormSection title="Especificaciones Técnicas" icon={ShieldCheck} color="text-blue-500">
          
          {/* Motor y Cilindrada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Motor" value={formData.motor} onChange={(v) => setFormData({ ...formData, motor: v })} />
            <Field label="Cilindrada (Ej: 2.0L)" value={formData.cilindrada} onChange={(v) => setFormData({ ...formData, cilindrada: v })} />
          </div>

          {/* Transmisión y Tracción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Transmisión" value={formData.transmision} options={['Automática', 'Mecánica', 'CVT', 'DCT']} onChange={(v) => setFormData({ ...formData, transmision: v })} />
            <SelectField label="Tracción" value={formData.traccion || '4x2'} options={['4x2', '4x4', 'AWD', 'RWD', 'FWD']} onChange={(v) => setFormData({ ...formData, traccion: v })} />
          </div>

          {/* Kilometraje y Dueños */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Odómetro (KM)" type="number" value={formData.km} onChange={(v) => setFormData({ ...formData, km: v === '' ? 0 : parseInt(v) })} />
            <Field label="Dueños" type="number" value={formData.duenos} onChange={(v) => setFormData({ ...formData, duenos: v === '' ? 1 : parseInt(v) })} />
          </div>

          {/* Combustible y Techo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Combustible" value={formData.combustible} options={['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico']} onChange={(v) => setFormData({ ...formData, combustible: v })} />
            <SelectField label="Techo Solar" value={formData.techo ? 'Sí' : 'No'} options={['Sí', 'No']} onChange={(v) => setFormData({ ...formData, techo: v === 'Sí' })} />
          </div>

          {/* Puertas y Pasajeros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Field label="Puertas" type="number" value={formData.puertas} onChange={(v) => setFormData({ ...formData, puertas: v === '' ? 5 : parseInt(v) })} />
             <Field label="Pasajeros" type="number" value={formData.pasajeros} onChange={(v) => setFormData({ ...formData, pasajeros: v === '' ? 5 : parseInt(v) })} />
          </div>

          <div className="mt-4">
            <TextAreaField label="Observaciones" value={formData.obs} onChange={(v) => setFormData({ ...formData, obs: v })} rows={3} />
          </div>
          
          <div className="mt-4">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Activity size={14} /> Detalles Adicionales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Estado Neumáticos" value={formData.neumaticos} options={['Nuevos', 'Buenos', 'Medios', 'Gastados']} onChange={(v) => setFormData({ ...formData, neumaticos: v })} />
              <Field label="Nº de Llaves" type="number" value={formData.llaves} onChange={(v) => setFormData({ ...formData, llaves: v === '' ? 0 : parseInt(v) })} />
            </div>
          </div>
        </FormSection>

        {/* SECCIÓN 4: GALERÍA */}
        <FormSection title="Galería & Puntos" icon={ImageIcon} color="text-purple-500">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Botón Fotos Exterior */}
              <label className={`cursor-pointer bg-neutral-900 border border-white/10 hover:border-[#E8B923] border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-[#E8B923]/20 transition-colors">
                  {isUploading ? <Loader2 size={24} className="text-[#E8B923] animate-spin" /> : <Car size={24} className="text-white group-hover:text-[#E8B923]" />}
                </div>
                <span className="text-xs font-bold text-neutral-400 group-hover:text-white uppercase tracking-wider text-center">
                    {isUploading ? 'Subiendo...' : 'Fotos Exterior'}
                </span>
                <input type="file" multiple className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>

              {/* Botón Fotos Interior */}
              <label className={`cursor-pointer bg-neutral-900 border border-white/10 hover:border-[#E8B923] border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-[#E8B923]/20 transition-colors">
                  {isUploading ? <Loader2 size={24} className="text-[#E8B923] animate-spin" /> : <Armchair size={24} className="text-white group-hover:text-[#E8B923]" />}
                </div>
                <span className="text-xs font-bold text-neutral-400 group-hover:text-white uppercase tracking-wider text-center">
                    {isUploading ? 'Subiendo...' : 'Fotos Interior'}
                </span>
                <input type="file" multiple className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>

            <div ref={imagePreviewRef} onClick={handleImageClick} className="aspect-video bg-neutral-900 rounded-2xl overflow-hidden relative cursor-crosshair border border-white/10">
              {currentImage ? (
                <>
                  <img src={currentImage} className="w-full h-full object-contain pointer-events-none" />
                  {formData.imagenes && formData.imagenes.length > 1 && (
                    <>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev > 0 ? prev - 1 : (formData.imagenes?.length || 1) - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-[#E8B923] hover:text-black transition-colors z-40"><ChevronLeft size={20} /></button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev < (formData.imagenes?.length || 1) - 1 ? prev + 1 : 0); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-[#E8B923] hover:text-black transition-colors z-40"><ChevronRight size={20} /></button>
                    </>
                  )}
                  {formData.hotspots?.filter(h => h.imageIndex === activeImageIndex).map(spot => (
                    <div key={spot.id} className="absolute w-5 h-5 bg-[#E8B923]/90 border-2 border-white rounded-full shadow-[0_0_15px_rgba(232,185,35,0.8)] transform -translate-x-1/2 -translate-y-1/2 z-20 group/spot cursor-pointer hover:scale-125 transition-transform" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteHotspot(spot.id); }} className="absolute -top-4 -right-4 bg-neutral-900 text-[#E8B923] rounded-full p-1 opacity-0 group-hover/spot:opacity-100 transition-all scale-75 hover:scale-100 border border-[#E8B923]/30"><Trash2 size={12} /></button>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/90 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover/spot:opacity-100 pointer-events-none z-50">{spot.label}</div>
                    </div>
                  ))}
                  {tempHotspotCoords && (
                    <div className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-pulse border-2 border-white" style={{ left: `${tempHotspotCoords.x}%`, top: `${tempHotspotCoords.y}%`, transform: 'translate(-50%, -50%)' }} />
                  )}
                </>
              ) : <div className="h-full flex items-center justify-center text-neutral-600 flex-col gap-2"><ImageIcon size={48} /><p className="text-xs uppercase tracking-widest font-bold">Sin imágenes seleccionadas</p></div>}
            </div>

            {formData.imagenes && formData.imagenes.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {formData.imagenes.map((img, i) => (
                  <div key={i} onClick={() => setActiveImageIndex(i)} className={`w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeImageIndex === i ? 'border-[#E8B923] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i) }} className="absolute top-0 right-0 bg-black/70 p-1 hover:bg-red-500 transition-colors"><Trash2 size={10} className="text-white" /></button>
                  </div>
                ))}
              </div>
            )}

            {tempHotspotCoords && (
              <div className="bg-neutral-900 p-4 rounded-xl border border-white/10 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-[#E8B923] flex items-center gap-2"><Target size={14} /> Nuevo Punto de Interés</h4>
                <Field label="Etiqueta" value={hotspotLabel} onChange={setHotspotLabel} />
                <Field label="Detalle" value={hotspotDetail} onChange={setHotspotDetail} />
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddHotspot} className="flex-1 bg-[#E8B923] text-black font-bold py-2 rounded-lg text-xs hover:bg-[#c9a01b] transition-colors">GUARDAR PUNTO</button>
                  <button type="button" onClick={() => setTempHotspotCoords(null)} className="flex-1 bg-white/10 text-white font-bold py-2 rounded-lg text-xs hover:bg-white/20 transition-colors">CANCELAR</button>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <motion.button 
          whileHover={{ scale: 1.01 }} 
          whileTap={{ scale: 0.99 }} 
          type="submit" 
          disabled={isUploading} 
          className={`w-full font-black py-5 rounded-[2rem] shadow-xl hover:shadow-[#E8B923]/20 transition-all ${isUploading ? 'bg-neutral-800 text-gray-500 cursor-not-allowed' : 'bg-[#E8B923] text-black'}`}
        >
          {isUploading ? 'ESPERA, SUBIENDO IMÁGENES...' : (car ? 'GUARDAR CAMBIOS' : 'PUBLICAR UNIDAD')}
        </motion.button>
      </form>
    </motion.div>
  );
};

// 6. LOGIN SCREEN
const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack }) => {
  const [u, setU] = useState(''); const [p, setP] = useState('');
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ok = await carService.login(u, p);
      if (ok) onLogin(); else alert("Credenciales incorrectas (Prueba: admin/admin)");
    } catch { alert("Error conexión con el servidor"); }
  };
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#E8B923]/5 blur-[150px] rounded-full" />
      <motion.form initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onSubmit={handleLogin} className={`${GLASS_BG} w-full max-w-sm p-8 rounded-[2rem] relative z-10`}>
        <div className="text-center mb-10">
          <Zap size={48} className="mx-auto text-[#E8B923] mb-4" fill="#E8B923" />
          <h1 className="text-4xl font-black italic text-white tracking-tighter">LIONS <span className="text-[#E8B923]">ELITE</span></h1>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <input className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#E8B923]/50 transition-all" placeholder="Usuario" value={u} onChange={e => setU(e.target.value)} />
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          </div>
          <div className="relative">
            <input className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#E8B923]/50 transition-all" type="password" placeholder="Contraseña" value={p} onChange={e => setP(e.target.value)} />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          </div>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-[#DAA520] to-[#E8B923] text-black font-bold py-4 rounded-2xl mt-8 hover:scale-[1.02] transition-transform">ACCEDER</button>
        {onBack && <button type="button" onClick={onBack} className="w-full text-center text-neutral-500 text-xs mt-4 hover:text-white">Volver al Catálogo</button>}
      </motion.form>
    </div>
  );
};

// 7. MAIN COMPONENT (DASHBOARD WRAPPER CORREGIDO PARA RESPONSIVE)
const LionsEliteDashboard: React.FC<DashboardProps> = ({
  stock,
  notifications,
  onAdd,
  onUpdate,
  onDelete,
  onBack,
  onLogout,
}) => {
  const [view, setView] = useState<'overview' | 'inventory' | 'form' | 'settings' | 'analytics'>('overview');
  const [filterText, setFilterText] = useState('');
  const [editingCar, setEditingCar] = useState<Vehiculo | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const stats = useMemo(() => {
    if (!stock) return { totalValue: 0, avgDays: 0, leads: 0, count: 0, totalComission: 0, available: 0, sold: 0, totalViews: 0, avgPrice: 0, conversionRate: '0' };
    const available = stock.filter((c) => c.estado !== 'Vendido');
    const sold = stock.filter((c) => c.estado === 'Vendido');
    const totalValue = available.reduce((acc, c) => acc + c.precio, 0);
    const avgDays = Math.round(stock.reduce((acc, c) => acc + (c.diasStock || 0), 0) / (stock.length || 1));
    const leads = stock.reduce((acc, c) => acc + (c.interesados || 0), 0);
    const totalComission = available.reduce((acc, c) => acc + (c.comisionEstimada || 0), 0);
    const totalViews = stock.reduce((acc, c) => acc + (c.vistas || 0), 0);
    const avgPrice = totalValue / (available.length || 1);
    const conversionRate = ((sold.length / stock.length) * 100).toFixed(1);
    return { totalValue, avgDays, leads, count: stock.length, totalComission, available: available.length, sold: sold.length, totalViews, avgPrice, conversionRate };
  }, [stock]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#E8B923] selection:text-black overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* --- OVERLAY PARA MÓVIL --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR RESPONSIVE (DRAWER) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#080808] border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        w-72 md:w-20 lg:w-64
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 h-20 flex items-center justify-between md:justify-center lg:justify-start border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-[#E8B923] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(232,185,35,0.2)] flex-shrink-0"><Zap size={22} className="text-black fill-black" /></div>
            <span className="font-black text-xl italic md:hidden lg:block whitespace-nowrap">LIONS <span className="text-[#E8B923]">ELITE</span></span>
          </div>
          {/* Botón cerrar visible solo en móvil */}
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-neutral-400 hover:text-white"><X size={24} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          <NavItem active={view === 'overview'} icon={BarChart3} label="Dashboard" onClick={() => { setView('overview'); setMobileMenuOpen(false); }} />
          <NavItem active={view === 'inventory'} icon={Car} label="Inventario" onClick={() => { setView('inventory'); setMobileMenuOpen(false); }} />
          <NavItem active={view === 'form'} icon={PlusCircle} label="Publicar" onClick={() => { setEditingCar(null); setView('form'); setMobileMenuOpen(false); }} />
          <NavItem active={view === 'analytics'} icon={LineChart} label="Analítica" onClick={() => { setView('analytics'); setMobileMenuOpen(false); }} />
          <NavItem active={view === 'settings'} icon={Settings} label="Configuración" onClick={() => { setView('settings'); setMobileMenuOpen(false); }} />
          <div className="h-px bg-white/5 my-4 mx-2" />
          {onBack && <NavItem active={false} icon={ArrowLeft} label="Volver Catálogo" onClick={onBack} color="text-blue-500/70" />}
          <NavItem active={false} icon={LogOut} label="Cerrar Sesión" onClick={onLogout} color="text-red-500/70" />
        </nav>

        <div className="p-4 border-t border-white/5 md:hidden lg:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-[#E8B923]">AD</div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Admin User</p>
            <p className="text-[10px] text-neutral-500 truncate">Gerente Ventas</p>
          </div>
        </div>
      </aside>

      <main className={`
        transition-all duration-300 min-h-screen flex flex-col
        pl-0 md:pl-20 lg:pl-64
      `}>
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* BOTÓN HAMBURGUESA PARA MÓVIL */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-white bg-white/5 rounded-lg active:scale-95 transition-all"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hidden sm:block">System Online</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="bg-neutral-900 border border-white/5 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-neutral-400 hidden sm:flex">
              <Search size={14} />
              <input
                className="bg-transparent outline-none text-white placeholder:text-neutral-500 w-24 md:w-32"
                placeholder="Buscar..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            {/* Botón lupa para móvil */}
            <button className="sm:hidden p-2 text-neutral-400"><Search size={20} /></button>

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 bg-neutral-900 rounded-full hover:bg-white/10 transition-colors relative">
                <Bell size={18} className="text-neutral-400" />
                {notifications.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#E8B923] rounded-full border-2 border-[#050505]" />}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-4 w-72 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right">
                    <div className="p-4 border-b border-white/5 bg-white/5"><h4 className="text-xs font-bold text-[#E8B923] uppercase tracking-widest">Notificaciones</h4></div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-4 hover:bg-white/5 border-b border-white/5 last:border-0 flex gap-3 transition-colors cursor-pointer">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'price' ? 'bg-green-500/10 text-green-500' : n.type === 'warning' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {n.type === 'price' ? <TrendingUp size={14} /> : n.type === 'warning' ? <AlertTriangle size={14} /> : <Bell size={14} />}
                          </div>
                          <div><p className="text-xs font-medium text-white leading-tight">{n.text}</p><p className="text-[10px] text-neutral-500 mt-1">{n.time}</p></div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            {view === 'overview' && (
              <DashboardOverview key="overview" stats={stats} stock={stock} />
            )}

            {view === 'settings' && <SettingsView key="settings" showToast={showToast} />}

            {view === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InventoryView stock={stock} onEdit={(car) => { setEditingCar(car); setView('form'); }} onDelete={onDelete} />
              </motion.div>
            )}

            {view === 'form' && (
              <VehicleForm
                key={editingCar ? editingCar.id : 'new'}
                car={editingCar}
                onCancel={() => setView('inventory')}
                onSubmit={(d) => {
                  if (editingCar) onUpdate(d); else onAdd(d);
                  setView('inventory');
                  showToast(editingCar ? 'Vehículo actualizado' : 'Vehículo creado', 'success');
                }}
              />
            )}

            {view === 'analytics' && <AnalyticsView stock={stock} stats={stats} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

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