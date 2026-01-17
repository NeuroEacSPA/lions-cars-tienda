// Define esto donde tengas tus interfaces
export interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  version?: string;
  ano: number;
  precio: number;
  km: number;
  duenos: number; // NUEVO
  
  // Especificaciones
  traccion?: string; // NUEVO (4x2, 4x4, etc)
  transmision: string;
  cilindrada?: string; // String (ej: "2.0L")
  combustible: string;
  carroceria: string;
  puertas: number; // Ahora editable
  pasajeros: number; // Ahora editable
  motor?: string; // Opcional, pero se envía
  techo: boolean;
  asientos: string;
  
  // Venta y Estado
  tipoVenta: 'Propio' | 'Consignado';
  vendedor: string;
  financiable: boolean;
  valorPie: number;
  estado: 'Disponible' | 'Reservado' | 'Vendido';
  
  // Detalles
  aire: boolean;
  neumaticos: string;
  llaves: number;
  obs: string;
  patente?: string; // Mantenemos patente (aunque sea interna)
  color: string;
  
  // Métricas y Media
  diasStock?: number;
  vistas?: number;
  interesados?: number;
  comisionEstimada?: number;
  imagenes: string[];
  imagen?: string;
  precioHistorial?: { date: string; price: number }[];
  hotspots?: any[];
}