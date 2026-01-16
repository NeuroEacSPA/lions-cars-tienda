// src/services/api.ts

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
  version?: string;
  ano: number;
  precio: number;
  km: number;
  duenos: number;
  traccion?: string;
  transmision: string;
  cilindrada?: string;
  combustible: string;
  carroceria: string;
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
  imagen: string;
  estado: 'Disponible' | 'Reservado' | 'Vendido';
  diasStock: number;
  vistas: number;
  interesados: number;
  patente: string;
  color: string;
  comisionEstimada: number;
  precioHistorial: { date: string; price: number }[];
  hotspots: Hotspot[];
}

const API_URL = 'http://127.0.0.1:8000';

export const carService = {
  getAll: async (): Promise<Vehiculo[]> => {
    const response = await fetch(`${API_URL}/autos`);
    if (!response.ok) throw new Error('Error al cargar autos');
    return response.json();
  },

  create: async (car: Omit<Vehiculo, 'id'>): Promise<Vehiculo> => {
    const response = await fetch(`${API_URL}/autos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    });
    return response.json();
  },

  update: async (car: Vehiculo): Promise<Vehiculo> => {
    const response = await fetch(`${API_URL}/autos/${car.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/autos/${id}`, {
      method: 'DELETE',
    });
  }
};