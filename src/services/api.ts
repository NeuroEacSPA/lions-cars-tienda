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
  cilindrada?: string; // NUEVO
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

export interface Brand { id: number; name: string; }
export interface Color { id: number; name: string; hex?: string; }
export interface User { id: number; username: string; password?: string; role: string; }

const API_URL = 'http://127.0.0.1:8000';

export const carService = {
  // --- AUTOS ---
  getAll: async (): Promise<Vehiculo[]> => {
    const r = await fetch(`${API_URL}/autos`); return r.json();
  },
  create: async (car: Omit<Vehiculo, 'id'>): Promise<Vehiculo> => {
    const r = await fetch(`${API_URL}/autos`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(car) }); return r.json();
  },
  update: async (car: Vehiculo): Promise<Vehiculo> => {
    const r = await fetch(`${API_URL}/autos/${car.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(car) }); return r.json();
  },
  delete: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/autos/${id}`, { method: 'DELETE' });
  },

  // --- CONFIGURACIÓN ---
  getBrands: async (): Promise<Brand[]> => { const r = await fetch(`${API_URL}/brands`); return r.json(); },
  createBrand: async (name: string) => { await fetch(`${API_URL}/brands`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name}) }); },
  deleteBrand: async (id: number) => { await fetch(`${API_URL}/brands/${id}`, { method: 'DELETE' }); },

  getColors: async (): Promise<Color[]> => { const r = await fetch(`${API_URL}/colors`); return r.json(); },
  createColor: async (name: string, hex?: string) => { await fetch(`${API_URL}/colors`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name, hex}) }); },
  deleteColor: async (id: number) => { await fetch(`${API_URL}/colors/${id}`, { method: 'DELETE' }); },

  getUsers: async (): Promise<User[]> => { const r = await fetch(`${API_URL}/users`); return r.json(); },
  createUser: async (u: Omit<User, 'id'>) => { await fetch(`${API_URL}/users`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(u) }); },
  deleteUser: async (id: number) => { await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }); },
  
  login: async (username: string, password: string): Promise<boolean> => {
      const r = await fetch(`${API_URL}/login`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username, password}) });
      return r.ok;
  }
};