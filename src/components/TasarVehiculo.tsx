import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import Drawer from '@mui/material/Drawer'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Alert from '@mui/material/Alert'
import useMediaQuery from '@mui/material/useMediaQuery'
import CircularProgress from '@mui/material/CircularProgress'

import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import SpeedIcon from '@mui/icons-material/Speed'
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'
import SettingsIcon from '@mui/icons-material/Settings'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import PaletteIcon from '@mui/icons-material/Palette'
import BoltIcon from '@mui/icons-material/Bolt'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ShieldIcon from '@mui/icons-material/Shield'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SavingsIcon from '@mui/icons-material/Savings'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import GppBadIcon from '@mui/icons-material/GppBad'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ReportIcon from '@mui/icons-material/Report'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EventIcon from '@mui/icons-material/Event'
import FingerPrintIcon from '@mui/icons-material/Fingerprint'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import PublicIcon from '@mui/icons-material/Public'

// ── THEME ─────────────────────────────────────────────────────────────────────
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#C8102E', light: '#ff3352', dark: '#8f0020', contrastText: '#fff' },
    secondary: { main: '#E8B923', contrastText: '#000' },
    background: { default: '#0a0a0c', paper: '#131316' },
    success: { main: '#22c55e' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    text: { primary: '#ffffff', secondary: '#71717a' },
  },
  typography: { fontFamily: '"Urbanist","Inter",system-ui,sans-serif', fontWeightBold: 800 },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, fontSize: '0.68rem', borderRadius: 14 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, fontSize: '0.65rem', minHeight: 44 } } },
    MuiTabs: { styleOverrides: { indicator: { backgroundColor: '#C8102E', height: 2 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 8, height: 5, backgroundColor: 'rgba(255,255,255,0.05)' }, bar: { borderRadius: 8 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24, backgroundImage: 'none', backgroundColor: '#0d0d10', border: '1px solid rgba(255,255,255,0.07)' } } },
    MuiDrawer: { styleOverrides: { paper: { borderRadius: '24px 24px 0 0', backgroundImage: 'none', backgroundColor: '#0d0d10', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 14, fontSize: '0.75rem' } } },
  },
})

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface VehicleData {
  licensePlate: string; dvLicensePlate?: string; version?: string; mileage?: number
  color?: string; year?: number; vinNumber?: string; engineNumber?: string; engine?: string
  fuel?: string; transmission?: string; doors?: number; urlImage?: string; rtDate?: string
  rtResult?: string; rtResultGas?: string; horsePower?: number; torque?: number
  fuelRange?: number; traction?: string; monthRT?: string
  model: { name: string; typeVehicle?: { name?: string; category?: string }; brand: { name: string } }
}
interface AppraisalData {
  vehicleId: string
  informacionFiscal: { codigo?: string; permiso: string; tasacion: number; ano_info_fiscal: number }
  precioUsado: { precio: number; banda_max: number; banda_min: number }
  precioRetoma: number
  vehicle: VehicleData
}
interface StolenRecord { marca?: string; modelo?: string; color?: string; patente?: string; roboLugar?: string; fechaRobo?: string }
interface RecallRecord { campaignCode?: string; brand?: string; model?: string; salesPeriod?: string; pdfUrl?: string; urlDetalle?: string }
interface VinData { vin?: string; year?: number; manufacturer?: { name?: string; region?: string; country?: string } }

interface AllData {
  appraisal: AppraisalData | null
  stolen: StolenRecord[] | null      // null = not stolen, array = stolen records
  recalls: RecallRecord[] | null     // null = none, array = recall records
  vin: VinData | null
  errors: Record<string, string>
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
const API = 'https://chile.getapi.cl'
const KEY = 'd31fe07a-88c0-4dab-b8b8-9c45fbf5a24b'
const H = { 'X-Api-Key': KEY }
const clp = (n: number) => n ? `$${Math.round(n).toLocaleString('es-CL')}` : '—'
const cap = (s = '') => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '—'
const fmt = (val: string) => {
  const c = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (c.length <= 2) return c
  if (c.length <= 4) return c.slice(0,2) + ' ✪ ' + c.slice(2)
  return c.slice(0,2) + ' ✪ ' + c.slice(2,4) + ' • ' + c.slice(4,6)
}
const raw = (s: string) => s.replace(/[^A-Z0-9]/g, '')

// ── UI PIECES ─────────────────────────────────────────────────────────────────
function Plate({ plate, size='md' }: { plate: string; size?: 'sm'|'md'|'lg' }) {
  const c = { sm:{h:44,w:120,t:14,b:6,bw:2.5}, md:{h:58,w:160,t:17,b:7,bw:3}, lg:{h:74,w:240,t:26,b:8,bw:4} }[size]
  return (
    <div style={{ height:c.h, width:c.w, border:`${c.bw}px solid #000`, borderRadius:5, backgroundColor:'#fff', position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.5)', flexShrink:0 }}>
      <div style={{ position:'absolute', inset:2, border:'1px solid #d1d5db', borderRadius:2, pointerEvents:'none' }} />
      <span style={{ fontFamily:'"Arial Black",sans-serif', fontWeight:900, fontSize:c.t, color:'#000', letterSpacing:'0.06em', textTransform:'uppercase', zIndex:1, marginTop:4 }}>{fmt(plate)}</span>
      <span style={{ position:'absolute', bottom:5, fontFamily:'"Arial Black",sans-serif', fontWeight:900, fontSize:c.b, color:'#000', letterSpacing:'0.4em', textTransform:'uppercase' }}>CHILE</span>
    </div>
  )
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string|number }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'11px 13px', cursor:'default', transition:'border-color 0.2s' }}
      onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(200,16,46,0.3)')}
      onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.06)')}>
      <div style={{ display:'flex', alignItems:'center', gap:6, color:'#71717a', marginBottom:7 }}>{icon}<span style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.12em' }}>{label}</span></div>
      <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{String(value??'—')}</span>
    </div>
  )
}

function PriceBar({ min, max, value }: { min:number; max:number; value:number }) {
  const pct = Math.min(100, Math.max(0, ((value-min)/(max-min||1))*100))
  return (
    <div style={{ position:'relative', paddingBottom:26 }}>
      <LinearProgress variant="determinate" value={pct} sx={{ '& .MuiLinearProgress-bar': { background:'linear-gradient(90deg,#8f0020,#C8102E,#ff3352)' } }} />
      <div style={{ position:'absolute', left:`${pct}%`, top:-5, transform:'translateX(-50%)', width:16, height:16, borderRadius:'50%', background:'#fff', border:'2.5px solid #C8102E', boxShadow:'0 0 12px rgba(200,16,46,0.7)' }} />
      <div style={{ display:'flex', justifyContent:'space-between', position:'absolute', bottom:0, left:0, right:0 }}>
        <div><p style={{ margin:0, fontSize:8, color:'#52525b' }}>Mín</p><p style={{ margin:0, fontSize:9, color:'#71717a', fontWeight:700 }}>{clp(min)}</p></div>
        <div style={{ textAlign:'right' }}><p style={{ margin:0, fontSize:8, color:'#52525b' }}>Máx</p><p style={{ margin:0, fontSize:9, color:'#71717a', fontWeight:700 }}>{clp(max)}</p></div>
      </div>
    </div>
  )
}

// ── TAB PANELS ────────────────────────────────────────────────────────────────
function TabFicha({ d }: { d: AllData }) {
  const v = d.appraisal?.vehicle
  if (!v) return null
  const brand = v.model.brand.name
  const model = v.model.name
  const specs = [
    { icon:<CalendarMonthIcon sx={{fontSize:14}}/>, label:'Año', value:v.year },
    { icon:<SpeedIcon sx={{fontSize:14}}/>, label:'Kilometraje', value:v.mileage?`${v.mileage.toLocaleString('es-CL')} km`:'—' },
    { icon:<PaletteIcon sx={{fontSize:14}}/>, label:'Color', value:cap(v.color) },
    { icon:<LocalGasStationIcon sx={{fontSize:14}}/>, label:'Combustible', value:cap(v.fuel) },
    { icon:<SettingsIcon sx={{fontSize:14}}/>, label:'Transmisión', value:cap(v.transmission) },
    { icon:<BoltIcon sx={{fontSize:14}}/>, label:'Motor', value:v.engine?`${v.engine} cc`:'—' },
    ...(v.doors?[{ icon:<DirectionsCarIcon sx={{fontSize:14}}/>, label:'Puertas', value:`${v.doors}p` }]:[]),
    ...(v.traction?[{ icon:<SettingsIcon sx={{fontSize:14}}/>, label:'Tracción', value:v.traction }]:[]),
    ...(v.horsePower?[{ icon:<BoltIcon sx={{fontSize:14}}/>, label:'Potencia', value:`${v.horsePower} HP` }]:[]),
    ...(v.torque?[{ icon:<BoltIcon sx={{fontSize:14}}/>, label:'Torque', value:`${v.torque} Nm` }]:[]),
    ...(v.fuelRange?[{ icon:<SpeedIcon sx={{fontSize:14}}/>, label:'Autonomía', value:`${v.fuelRange} km` }]:[]),
    ...(v.model.typeVehicle?.name?[{ icon:<DirectionsCarIcon sx={{fontSize:14}}/>, label:'Tipo', value:cap(v.model.typeVehicle.name) }]:[]),
  ]
  const rtPass = v.rtResult?.toUpperCase().includes('APROB')
  const rtFail = v.rtResult?.toUpperCase().includes('RECHAZ')

  return (
    <div style={{ padding:'20px 20px 24px' }}>
      {v.urlImage ? (
        <div style={{ borderRadius:16, overflow:'hidden', marginBottom:18, height:170, background:'#111', border:'1px solid rgba(255,255,255,0.05)' }}>
          <img src={v.urlImage} alt={`${brand} ${model}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      ) : (
        <div style={{ borderRadius:16, marginBottom:18, height:90, background:'rgba(200,16,46,0.04)', border:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', gap:14 }}>
          <DirectionsCarIcon sx={{ fontSize:38, color:'#27272a' }} />
          <div><p style={{ margin:0, fontSize:11, fontWeight:900, color:'#3f3f46', textTransform:'uppercase', letterSpacing:'0.1em' }}>{brand}</p><p style={{ margin:0, fontSize:10, color:'#27272a', marginTop:2 }}>{model}</p></div>
        </div>
      )}

      <p style={{ fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:900, marginBottom:10, marginTop:0 }}>Especificaciones Técnicas</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:16 }} className="specs-3col">
        <style>{`@media(min-width:420px){.specs-3col{grid-template-columns:repeat(3,1fr)!important}}`}</style>
        {specs.map((s,i)=><SpecCard key={i} icon={s.icon} label={s.label} value={s.value as string} />)}
      </div>

      {/* Revisión técnica */}
      {(v.rtDate||v.rtResult) && (
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
          <p style={{ fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.18em', fontWeight:900, marginBottom:10, marginTop:0, display:'flex', alignItems:'center', gap:6 }}>
            <ShieldIcon sx={{fontSize:11}}/> Revisión Técnica
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {v.rtResult&&<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><span style={{ fontSize:10, color:'#52525b' }}>Resultado</span>
              <Chip size="small" label={v.rtResult} icon={rtPass?<CheckCircleIcon/>:rtFail?<WarningAmberIcon/>:undefined} sx={{ bgcolor:rtPass?'rgba(34,197,94,0.1)':rtFail?'rgba(239,68,68,0.1)':'rgba(255,255,255,0.05)', color:rtPass?'#22c55e':rtFail?'#ef4444':'#a1a1aa', border:`1px solid ${rtPass?'rgba(34,197,94,0.25)':rtFail?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.08)'}`, fontSize:9 }} /></div>}
            {v.rtDate&&<><Divider sx={{borderColor:'rgba(255,255,255,0.04)'}}/><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>Vencimiento</span><span style={{fontSize:10,fontWeight:700,color:'#d4d4d8'}}>{v.rtDate}</span></div></>}
            {v.rtResultGas&&<><Divider sx={{borderColor:'rgba(255,255,255,0.04)'}}/><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>Control gases</span><span style={{fontSize:10,fontWeight:700,color:'#d4d4d8'}}>{v.rtResultGas}</span></div></>}
            {v.monthRT&&<><Divider sx={{borderColor:'rgba(255,255,255,0.04)'}}/><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>Mes renovación</span><span style={{fontSize:10,fontWeight:700,color:'#d4d4d8'}}>{v.monthRT}</span></div></>}
          </div>
        </div>
      )}

      {/* VIN + motor */}
      {(v.vinNumber||v.engineNumber) && (
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 16px' }}>
          <p style={{ fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.18em', fontWeight:900, marginBottom:10, marginTop:0, display:'flex', alignItems:'center', gap:6 }}><FingerPrintIcon sx={{fontSize:11}}/> Identificadores</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {v.vinNumber&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span style={{fontSize:10,color:'#52525b',flexShrink:0}}>VIN</span><span style={{fontSize:10,fontFamily:'monospace',color:'#a1a1aa',wordBreak:'break-all',textAlign:'right'}}>{v.vinNumber}</span></div>}
            {v.engineNumber&&<><Divider sx={{borderColor:'rgba(255,255,255,0.04)'}}/><div style={{display:'flex',justifyContent:'space-between',gap:8}}><span style={{fontSize:10,color:'#52525b',flexShrink:0}}>N° Motor</span><span style={{fontSize:10,fontFamily:'monospace',color:'#a1a1aa',textAlign:'right'}}>{v.engineNumber}</span></div></>}
          </div>
        </div>
      )}

      {/* VIN decoded info */}
      {d.vin && (
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 16px', marginTop:12 }}>
          <p style={{ fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.18em', fontWeight:900, marginBottom:10, marginTop:0, display:'flex', alignItems:'center', gap:6 }}><MergeTypeIcon sx={{fontSize:11}}/> Decodificación VIN</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {d.vin.manufacturer?.name&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>Fabricante</span><span style={{fontSize:10,fontWeight:700,color:'#d4d4d8'}}>{d.vin.manufacturer.name}</span></div>}
            {d.vin.manufacturer?.country&&<><Divider sx={{borderColor:'rgba(255,255,255,0.04)'}}/><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>País origen</span><span style={{fontSize:10,fontWeight:700,color:'#d4d4d8',display:'flex',alignItems:'center',gap:4}}><PublicIcon sx={{fontSize:11}}/>{d.vin.manufacturer.country}</span></div></>}
            {d.vin.year&&<><Divider sx={{borderColor:'rgba(255,255,255,0.04)'}}/><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>Año VIN</span><span style={{fontSize:10,fontWeight:700,color:'#d4d4d8'}}>{d.vin.year}</span></div></>}
          </div>
        </div>
      )}
    </div>
  )
}

function TabValoracion({ d }: { d: AllData }) {
  const ap = d.appraisal
  if (!ap) return null
  return (
    <div style={{ padding:'20px 20px 24px' }}>
      <p style={{ fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:900, marginBottom:12, marginTop:0, display:'flex', alignItems:'center', gap:6 }}><TrendingUpIcon sx={{fontSize:12}}/> Valoración de Mercado</p>
      <div style={{ background:'linear-gradient(135deg,rgba(200,16,46,0.12),rgba(200,16,46,0.04))', border:'1px solid rgba(200,16,46,0.2)', borderRadius:18, padding:'18px 20px', marginBottom:18 }}>
        <p style={{ margin:0, fontSize:9, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:4 }}>Precio sugerido de mercado</p>
        <p style={{ margin:0, fontSize:36, fontWeight:900, color:'#fff', lineHeight:1.1 }}>{clp(ap.precioUsado.precio)}</p>
        <p style={{ margin:0, fontSize:10, color:'#52525b', marginTop:6 }}>Precio de referencia para compraventa</p>
      </div>
      <div style={{ marginBottom:22 }}>
        <PriceBar min={ap.precioUsado.banda_min} max={ap.precioUsado.banda_max} value={ap.precioUsado.precio} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[
          { icon:<SavingsIcon sx={{fontSize:14}}/>, label:'Precio Retoma', val:clp(ap.precioRetoma), sub:'Precio de compra directa' },
          { icon:<AccountBalanceIcon sx={{fontSize:14}}/>, label:'Tasación SII', val:clp(ap.informacionFiscal.tasacion), sub:`Año ${ap.informacionFiscal.ano_info_fiscal}` },
        ].map(p=>(
          <div key={p.label} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, color:'#52525b', marginBottom:10 }}>{p.icon}<span style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em' }}>{p.label}</span></div>
            <p style={{ margin:0, fontSize:18, fontWeight:900, color:'#fff' }}>{p.val}</p>
            <p style={{ margin:0, fontSize:9, color:'#3f3f46', marginTop:4 }}>{p.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'14px 16px' }}>
        <p style={{ fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.18em', fontWeight:900, marginBottom:10, marginTop:0, display:'flex', alignItems:'center', gap:6 }}><ReceiptLongIcon sx={{fontSize:11}}/> Información Fiscal</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>N° Permiso circulación</span><span style={{fontSize:10,fontFamily:'monospace',fontWeight:700,color:'#d4d4d8'}}>{ap.informacionFiscal.permiso}</span></div>
          <Divider sx={{borderColor:'rgba(255,255,255,0.04)'}}/>
          <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>Año info fiscal</span><span style={{fontSize:10,fontWeight:700,color:'#d4d4d8'}}>{ap.informacionFiscal.ano_info_fiscal}</span></div>
          {ap.informacionFiscal.codigo&&<><Divider sx={{borderColor:'rgba(255,255,255,0.04)'}}/><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#52525b'}}>Código SII</span><span style={{fontSize:10,fontFamily:'monospace',color:'#d4d4d8'}}>{ap.informacionFiscal.codigo}</span></div></>}
        </div>
      </div>
    </div>
  )
}

function TabAlertas({ d, loading }: { d: AllData; loading: boolean }) {
  const isStolen = Array.isArray(d.stolen) && d.stolen.length > 0
  const hasRecalls = Array.isArray(d.recalls) && d.recalls.length > 0
  const stolenChecked = d.stolen !== undefined
  const recallChecked = d.recalls !== undefined

  return (
    <div style={{ padding:'20px 20px 24px' }}>

      {/* ── ROBO ── */}
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.18em', fontWeight:900, marginBottom:12, marginTop:0, display:'flex', alignItems:'center', gap:6 }}>
          <GppBadIcon sx={{fontSize:12}}/> Alerta de Robo
        </p>

        {loading && !stolenChecked ? (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14 }}>
            <CircularProgress size={16} sx={{ color:'#C8102E' }} />
            <span style={{ fontSize:11, color:'#52525b' }}>Verificando en base de datos...</span>
          </div>
        ) : isStolen ? (
          <div>
            <div style={{ background:'rgba(239,68,68,0.1)', border:'2px solid rgba(239,68,68,0.4)', borderRadius:16, padding:'18px 20px', marginBottom:12, animation:'pulse 2s infinite' }}>
              <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 20px 6px rgba(239,68,68,0.15)}}`}</style>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <ReportIcon sx={{ fontSize:28, color:'#ef4444' }} />
                <div>
                  <p style={{ margin:0, fontSize:14, fontWeight:900, color:'#ef4444' }}>⚠ VEHÍCULO ROBADO</p>
                  <p style={{ margin:0, fontSize:10, color:'#fca5a5', marginTop:3 }}>Este vehículo figura en el registro de robos</p>
                </div>
              </div>
              {d.stolen!.map((r,i)=>(
                <div key={i} style={{ background:'rgba(0,0,0,0.3)', borderRadius:12, padding:'12px 14px', marginTop:i>0?8:0 }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {r.marca&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#ef4444',opacity:0.7}}>Vehículo</span><span style={{fontSize:10,fontWeight:700,color:'#fca5a5'}}>{r.marca} {r.modelo}</span></div>}
                    {r.color&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'#ef4444',opacity:0.7}}>Color</span><span style={{fontSize:10,fontWeight:700,color:'#fca5a5'}}>{r.color}</span></div>}
                    {r.roboLugar&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:10,color:'#ef4444',opacity:0.7,display:'flex',alignItems:'center',gap:4}}><LocationOnIcon sx={{fontSize:11}}/>Lugar</span><span style={{fontSize:10,fontWeight:700,color:'#fca5a5'}}>{r.roboLugar}</span></div>}
                    {r.fechaRobo&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:10,color:'#ef4444',opacity:0.7,display:'flex',alignItems:'center',gap:4}}><EventIcon sx={{fontSize:11}}/>Fecha</span><span style={{fontSize:10,fontWeight:700,color:'#fca5a5'}}>{r.fechaRobo}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : stolenChecked ? (
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:14 }}>
            <VerifiedUserIcon sx={{ fontSize:22, color:'#22c55e' }} />
            <div>
              <p style={{ margin:0, fontSize:12, fontWeight:800, color:'#22c55e' }}>Sin registros de robo</p>
              <p style={{ margin:0, fontSize:10, color:'#4ade80', opacity:0.7, marginTop:2 }}>No figura en base de datos de robos</p>
            </div>
          </div>
        ) : d.errors.stolen ? (
          <Alert severity="warning" sx={{ fontSize:11 }}>{d.errors.stolen}</Alert>
        ) : null}
      </div>

      {/* ── RECALLS ── */}
      <div>
        <p style={{ fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.18em', fontWeight:900, marginBottom:12, marginTop:0, display:'flex', alignItems:'center', gap:6 }}>
          <WarningAmberIcon sx={{fontSize:12}}/> Recalls / Llamados a Revisión
        </p>

        {loading && !recallChecked ? (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14 }}>
            <CircularProgress size={16} sx={{ color:'#C8102E' }} />
            <span style={{ fontSize:11, color:'#52525b' }}>Verificando recalls...</span>
          </div>
        ) : hasRecalls ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, marginBottom:4 }}>
              <WarningAmberIcon sx={{ fontSize:16, color:'#f59e0b' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'#fbbf24' }}>{d.recalls!.length} recall{d.recalls!.length>1?'s':''} registrado{d.recalls!.length>1?'s':''}</span>
            </div>
            {d.recalls!.map((r,i)=>(
              <div key={i} style={{ background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:14, padding:'14px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <p style={{ margin:0, fontSize:12, fontWeight:800, color:'#fff' }}>{r.brand} {r.model}</p>
                    {r.campaignCode&&<p style={{ margin:0, fontSize:9, color:'#f59e0b', marginTop:3, fontFamily:'monospace' }}>Campaña: {r.campaignCode}</p>}
                  </div>
                </div>
                {r.salesPeriod&&<p style={{ margin:'0 0 10px', fontSize:10, color:'#71717a' }}>Período de venta: {r.salesPeriod}</p>}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {r.urlDetalle&&<Button size="small" variant="outlined" endIcon={<OpenInNewIcon sx={{fontSize:12}}/>} href={r.urlDetalle} target="_blank" sx={{ fontSize:'0.6rem', borderColor:'rgba(245,158,11,0.3)', color:'#f59e0b', '&:hover':{borderColor:'#f59e0b',bgcolor:'rgba(245,158,11,0.08)'} }}>Ver detalle</Button>}
                  {r.pdfUrl&&<Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon sx={{fontSize:12}}/>} href={r.pdfUrl} target="_blank" sx={{ fontSize:'0.6rem', borderColor:'rgba(239,68,68,0.3)', color:'#f87171', '&:hover':{borderColor:'#ef4444',bgcolor:'rgba(239,68,68,0.08)'} }}>PDF</Button>}
                </div>
              </div>
            ))}
          </div>
        ) : recallChecked ? (
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:14 }}>
            <CheckCircleIcon sx={{ fontSize:22, color:'#22c55e' }} />
            <div>
              <p style={{ margin:0, fontSize:12, fontWeight:800, color:'#22c55e' }}>Sin recalls registrados</p>
              <p style={{ margin:0, fontSize:10, color:'#4ade80', opacity:0.7, marginTop:2 }}>No hay llamados a revisión para este VIN</p>
            </div>
          </div>
        ) : d.errors.recall ? (
          <div style={{ padding:'12px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14 }}>
            <p style={{ margin:0, fontSize:11, color:'#52525b' }}>{d.errors.recall}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function ModalContent({ d, plate, loadingAlerts, onClose, onReset }: { d: AllData; plate: string; loadingAlerts: boolean; onClose:()=>void; onReset:()=>void }) {
  const [tab, setTab] = useState(0)
  const v = d.appraisal?.vehicle
  const brand = v?.model.brand.name || ''
  const model = v?.model.name || ''
  const isStolen = Array.isArray(d.stolen) && d.stolen.length > 0
  const hasRecalls = Array.isArray(d.recalls) && d.recalls.length > 0

  const alertBadge = (isStolen ? 2 : 0) + (hasRecalls ? 1 : 0)

  return (
    <div style={{ display:'flex', flexDirection:'column', maxHeight:'90vh', background:'#0d0d10' }}>
      <div style={{ display:'flex', justifyContent:'center', paddingTop:12, paddingBottom:4 }}>
        <div style={{ width:40, height:4, borderRadius:4, background:'rgba(255,255,255,0.15)' }} />
      </div>

      {/* Header */}
      <div style={{ padding:'14px 18px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'linear-gradient(to right,rgba(200,16,46,0.07),transparent)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, minWidth:0 }}>
            <Plate plate={plate} size="md" />
            <div style={{ minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <CheckCircleIcon sx={{ fontSize:12, color:'#22c55e' }} />
                <span style={{ fontSize:9, fontWeight:900, color:'#22c55e', textTransform:'uppercase', letterSpacing:'0.15em' }}>Vehículo encontrado</span>
              </div>
              <p style={{ margin:0, fontSize:17, fontWeight:900, color:'#fff', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{brand} {model}</p>
              <p style={{ margin:0, fontSize:11, color:'#52525b', marginTop:3 }}>{cap(v?.version)} · {v?.year}</p>
            </div>
          </div>
          <Tooltip title="Cerrar">
            <IconButton onClick={onClose} size="small" sx={{ color:'#52525b', border:'1px solid rgba(255,255,255,0.07)', '&:hover':{ color:'#fff', bgcolor:'rgba(255,255,255,0.06)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="fullWidth" sx={{ borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, minHeight:44 }}>
        <Tab label="Ficha" sx={{ color: tab===0?'#fff':'#52525b' }} />
        <Tab label="Valoración" sx={{ color: tab===1?'#fff':'#52525b' }} />
        <Tab label={<div style={{ display:'flex', alignItems:'center', gap:6 }}>
          Alertas
          {alertBadge>0&&<span style={{ background:isStolen?'#ef4444':'#f59e0b', color:'#fff', fontSize:9, fontWeight:900, padding:'1px 5px', borderRadius:99, minWidth:16, textAlign:'center' }}>{alertBadge}</span>}
          {loadingAlerts&&<CircularProgress size={10} sx={{ color:'#C8102E' }}/>}
        </div>} sx={{ color: tab===2?'#fff':'#52525b' }} />
      </Tabs>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', overscrollBehavior:'contain' }}>
        {tab===0&&<TabFicha d={d}/>}
        {tab===1&&<TabValoracion d={d}/>}
        {tab===2&&<TabAlertas d={d} loading={loadingAlerts}/>}
      </div>

      {/* Footer */}
      <div style={{ padding:'12px 18px 18px', borderTop:'1px solid rgba(255,255,255,0.06)', background:'#0a0a0c', display:'flex', gap:10, flexShrink:0 }}>
        <Button variant="contained" fullWidth startIcon={<WhatsAppIcon/>}
          href={`https://api.whatsapp.com/send?phone=56958016208&text=Hola! Quiero consignar mi ${brand} ${v?.year} patente ${plate}. Valor: ${clp(d.appraisal?.precioUsado.precio||0)}`}
          target="_blank" sx={{ flex:1, py:1.4, bgcolor:'#25D366', '&:hover':{bgcolor:'#1da851'}, boxShadow:'0 4px 20px rgba(37,211,102,0.2)' }}>
          Consignar
        </Button>
        <Button variant="outlined" startIcon={<RefreshIcon/>} onClick={onReset}
          sx={{ flexShrink:0, py:1.4, borderColor:'rgba(255,255,255,0.1)', color:'#71717a', '&:hover':{borderColor:'rgba(255,255,255,0.25)',color:'#fff',bgcolor:'rgba(255,255,255,0.04)'} }}>
          Otra
        </Button>
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function TasarVehiculo() {
  const [patente, setPatente] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [data, setData] = useState<AllData|null>(null)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const isMobile = useMediaQuery('(max-width:767px)')

  const search = async () => {
    const plate = raw(patente)
    if (plate.length < 6) return
    setError(''); setLoading(true); setData(null)

    try {
      // 1. Appraisal + Stolen in parallel
      const [apRes, stRes] = await Promise.allSettled([
        fetch(`${API}/v1/vehicles/appraisal/${plate}`, { headers: H }),
        fetch(`${API}/v1/vehicles/stolen/${plate}`, { headers: H }),
      ])

      let appraisal: AppraisalData | null = null
      let stolen: StolenRecord[] | null = undefined as unknown as null
      const errors: Record<string,string> = {}

      if (apRes.status==='fulfilled') {
        if (apRes.value.ok) {
          const j = await apRes.value.json()
          appraisal = j.data
        } else if (apRes.value.status === 429) {
          const j = await apRes.value.json().catch(()=>({data:{message:''}}))
          const secs = j?.data?.message?.match(/\d+/)?.[0] || '10'
          setError(`Demasiadas consultas. Espera ${secs}s e intenta de nuevo.`)
          setLoading(false); return
        } else if (apRes.value.status === 404) {
          setError('Patente no encontrada. Verifica e intenta de nuevo.')
          setLoading(false); return
        } else {
          const j = await apRes.value.json().catch(()=>null)
          setError(j?.data?.message || 'Error al consultar la API. Intenta de nuevo.')
          setLoading(false); return
        }
      } else {
        setError('Sin conexión. Verifica tu red e intenta de nuevo.')
        setLoading(false); return
      }

      if (stRes.status==='fulfilled') {
        const j = await stRes.value.json()
        stolen = (stRes.value.ok && Array.isArray(j.data) && j.data.length > 0) ? j.data : []
      } else {
        errors.stolen = 'No se pudo verificar estado de robo'
        stolen = []
      }

      const partial: AllData = { appraisal, stolen, recalls: undefined as unknown as null, vin: null, errors }
      setData(partial); setLoading(false); setShowModal(true)
      setLoadingAlerts(true)

      // 2. Recall + VIN decode in parallel (after we have VIN from appraisal)
      const vinNum = appraisal.vehicle.vinNumber
      const pendingCalls: Promise<void>[] = []

      if (vinNum) {
        pendingCalls.push(
          fetch(`${API}/v1/vehicles/recall/${vinNum}`, { headers: H })
            .then(async r => {
              const j = await r.json()
              const recalls = (r.ok && Array.isArray(j.data) && j.data.length > 0) ? j.data : []
              setData(prev => prev ? { ...prev, recalls } : prev)
            })
            .catch(() => {
              errors.recall = 'No se pudo verificar recalls'
              setData(prev => prev ? { ...prev, recalls: [], errors: { ...prev.errors, recall: errors.recall } } : prev)
            }),
          fetch(`${API}/v1/vehicles/vin/${vinNum}`, { headers: H })
            .then(async r => {
              if (r.ok) {
                const j = await r.json()
                setData(prev => prev ? { ...prev, vin: j.data } : prev)
              }
            })
            .catch(() => {})
        )
      } else {
        errors.recall = 'VIN no disponible para verificar recalls'
        setData(prev => prev ? { ...prev, recalls: [], errors: { ...prev.errors, recall: errors.recall } } : prev)
      }

      await Promise.allSettled(pendingCalls)
      setLoadingAlerts(false)

    } catch {
      setError('Error de conexión. Intenta nuevamente.')
      setLoading(false)
    }
  }

  const reset = () => { setShowModal(false); setData(null); setError(''); setPatente('') }
  const plate = raw(patente)

  const modalContent = data ? (
    <ModalContent d={data} plate={data.appraisal?.vehicle.licensePlate || plate} loadingAlerts={loadingAlerts}
      onClose={()=>setShowModal(false)} onReset={reset} />
  ) : null

  return (
    <ThemeProvider theme={muiTheme}>
      {/* Widget */}
      <div style={{ width:'100%', maxWidth:400, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(24px)', borderRadius:24, border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 24px 70px rgba(0,0,0,0.65)', overflow:'hidden' }}>

        <div style={{ padding:'18px 22px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ padding:10, background:'rgba(200,16,46,0.1)', borderRadius:12, border:'1px solid rgba(200,16,46,0.2)', display:'flex' }}><TrendingUpIcon sx={{ fontSize:18, color:'#C8102E' }} /></div>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:900, color:'#fff' }}>Tasar Vehículo</p>
              <p style={{ margin:0, fontSize:9, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.15em', marginTop:2 }}>Patente · Tasación · Robo · Recalls</p>
            </div>
          </div>
          {data&&<Tooltip title="Nueva consulta"><IconButton size="small" onClick={reset} sx={{ color:'#52525b', border:'1px solid rgba(255,255,255,0.07)', '&:hover':{color:'#fff',bgcolor:'rgba(255,255,255,0.06)'} }}><RefreshIcon fontSize="small"/></IconButton></Tooltip>}
        </div>

        {loading && (
          <div style={{ padding:'18px 22px 22px' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
              <Skeleton variant="rectangular" width={200} height={60} sx={{ borderRadius:'6px', bgcolor:'rgba(255,255,255,0.06)' }} />
            </div>
            <LinearProgress sx={{ borderRadius:8, mb:2, '& .MuiLinearProgress-bar':{background:'linear-gradient(90deg,#8f0020,#C8102E)'} }} />
            <Skeleton variant="text" sx={{ bgcolor:'rgba(255,255,255,0.04)', mb:1 }} />
            <Skeleton variant="text" width="60%" sx={{ bgcolor:'rgba(255,255,255,0.04)' }} />
          </div>
        )}

        {!loading && data?.appraisal && (
          <div style={{ padding:'16px 22px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <CheckCircleIcon sx={{ fontSize:14, color:'#22c55e' }} />
              <span style={{ fontSize:10, fontWeight:900, color:'#22c55e', textTransform:'uppercase', letterSpacing:'0.15em' }}>Tasación completada</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <Plate plate={data.appraisal.vehicle.licensePlate} size="sm" />
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:900, color:'#fff' }}>{data.appraisal.vehicle.model.brand.name}</p>
                <p style={{ margin:0, fontSize:11, color:'#52525b' }}>{data.appraisal.vehicle.year}</p>
              </div>
            </div>
            <div style={{ background:'rgba(200,16,46,0.08)', border:'1px solid rgba(200,16,46,0.15)', borderRadius:12, padding:'12px 16px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:10, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.1em' }}>Precio mercado</span>
              <span style={{ fontSize:20, fontWeight:900, color:'#fff' }}>{clp(data.appraisal.precioUsado.precio)}</span>
            </div>
            <Button variant="contained" color="primary" fullWidth endIcon={<ChevronRightIcon/>} onClick={()=>setShowModal(true)}
              sx={{ py:1.4, background:'linear-gradient(135deg,#C8102E,#8f0020)', '&:hover':{background:'linear-gradient(135deg,#e01535,#C8102E)',boxShadow:'0 6px 28px rgba(200,16,46,0.5)'} }}>
              Ver Informe Completo
            </Button>
          </div>
        )}

        {!loading && !data && (
          <div style={{ padding:'16px 22px 22px' }}>
            <p style={{ fontSize:10, color:'#52525b', marginBottom:16, lineHeight:1.7, textAlign:'center', margin:'0 0 16px' }}>
              Consulta ficha técnica, tasación, robo y recalls de cualquier vehículo.
            </p>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:76, width:240, background:'#fff', borderRadius:7, border:'4px solid #000', boxShadow:'0 10px 30px rgba(0,0,0,0.6)', overflow:'hidden', transition:'border-color 0.2s' }}
                onFocusCapture={e=>(e.currentTarget.style.borderColor='#C8102E')}
                onBlurCapture={e=>(e.currentTarget.style.borderColor='#000')}>
                <div style={{ position:'absolute', inset:2, border:'2px solid #d1d5db', borderRadius:2, pointerEvents:'none' }} />
                <input value={patente} onChange={e=>setPatente(fmt(e.target.value))} onKeyDown={e=>e.key==='Enter'&&search()}
                  placeholder="AB ✪ CD • 12" maxLength={13}
                  style={{ width:'100%', fontFamily:'"Arial Black",sans-serif', fontWeight:900, fontSize:24, letterSpacing:'0.06em', textAlign:'center', outline:'none', background:'transparent', border:'none', color:'#000', textTransform:'uppercase', zIndex:1, paddingBottom:16 }} />
                <span style={{ position:'absolute', bottom:8, fontFamily:'"Arial Black",sans-serif', fontWeight:900, fontSize:8, color:'#000', letterSpacing:'0.45em', textTransform:'uppercase' }}>CHILE</span>
              </div>
            </div>
            <Button variant="contained" color="primary" fullWidth startIcon={<SearchIcon/>} disabled={plate.length<6||loading} onClick={search}
              sx={{ py:1.4, background:'linear-gradient(135deg,#C8102E,#8f0020)', boxShadow:'0 4px 20px rgba(200,16,46,0.4)', '&:hover':{background:'linear-gradient(135deg,#e01535,#C8102E)',boxShadow:'0 6px 28px rgba(200,16,46,0.55)'}, '&.Mui-disabled':{background:'rgba(200,16,46,0.25)',color:'rgba(255,255,255,0.4)'} }}>
              Consultar Vehículo
            </Button>
            <AnimatePresence>
              {error&&<motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{marginTop:12}}>
                <div style={{ display:'flex', gap:8, padding:'10px 14px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12 }}>
                  <WarningAmberIcon sx={{ fontSize:14, color:'#ef4444', flexShrink:0 }}/>
                  <span style={{ fontSize:10, color:'#f87171', lineHeight:1.6 }}>{error}</span>
                </div>
              </motion.div>}
            </AnimatePresence>
            <p style={{ fontSize:9, color:'#27272a', marginTop:14, textAlign:'center' }}>Registro Civil · SII · Carabineros · SERNAC</p>
          </div>
        )}
      </div>

      {isMobile ? (
        <Drawer anchor="bottom" open={showModal} onClose={()=>setShowModal(false)} PaperProps={{ sx:{maxHeight:'93vh',bgcolor:'#0d0d10'} }}>
          {modalContent}
        </Drawer>
      ) : (
        <Dialog open={showModal} onClose={()=>setShowModal(false)} maxWidth="md" fullWidth PaperProps={{ sx:{maxHeight:'88vh'} }}>
          {modalContent}
        </Dialog>
      )}
    </ThemeProvider>
  )
}
