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

export interface Brand { id: number; name: string; }
export interface Color { id: number; name: string; hex?: string; }
export interface User { id: number; username: string; password?: string; role: string; }

// --- CONFIGURACIÓN DE LA URL (Automática) ---
// Si 'npm run build' (Producción/VPS) -> Usa https://lionscars.cl/api
// Si 'npm run dev' (Tu PC) -> Usa http://localhost:8000/api
const API_URL = import.meta.env.PROD 
  ? "https://lionscars.cl/api" 
  : "http://localhost:8000/api";

export const carService = {
  // --- NUEVA FUNCIÓN: SUBIR IMAGEN ---
  // Esta función envía el archivo físico al backend y devuelve la URL pública
  uploadImage: async (file: File, marca: string, modelo: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('marca', marca);
    formData.append('modelo', modelo);

    // Nota: No poner 'Content-Type': 'application/json' aquí. 
    // fetch lo maneja solo cuando es FormData.
    const r = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!r.ok) {
        throw new Error("Error al subir la imagen al servidor");
    }

    const data = await r.json();
    return data.url; // Retorna ej: "https://lionscars.cl/uploads/toyota_yaris/foto.jpg"
  },

  // --- AUTOS ---
  // --- AUTOS ---
  getAll: async (): Promise<Vehiculo[]> => {
    const r = await fetch(`${API_URL}/autos`);
    const data = await r.json();
    
    // AQUÍ ORDENAMOS: b.id - a.id pone el ID más alto (el más nuevo) primero
    return data.sort((a: Vehiculo, b: Vehiculo) => b.id - a.id);
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