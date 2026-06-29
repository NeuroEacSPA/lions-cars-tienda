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
  slug?: string;
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
  vendedor_id?: number;
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
export interface Vendor { id: number; nombre: string; telefono: string; }
export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  username: string;
  role: 'admin' | 'vendedor' | 'owner';
  activo: boolean;
  creado_en: string;
}

export interface ActivityLogEntry {
  id: number;
  user_id: number;
  username: string;
  nombre: string;
  action: string;
  entity_name: string;
  details: string | null;
  created_at: string;
}

// --- CONFIGURACIÓN DE LA URL (Automática) ---
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `${window.location.protocol}//${window.location.host}/api`;
};

const API_URL = getApiUrl();

export const carService = {

  // --- UPLOAD DE IMAGEN ---
  uploadImage: async (file: File, marca: string, modelo: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('marca', marca);
    formData.append('modelo', modelo);

    const r = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!r.ok) throw new Error('Error al subir la imagen al servidor');
    const data = await r.json();
    return data.url;
  },

  // --- AUTOS ---
  getAll: async (): Promise<Vehiculo[]> => {
    const r = await fetch(`${API_URL}/autos`);
    const data = await r.json();
    // Más nuevo primero
    return data.sort((a: Vehiculo, b: Vehiculo) => b.id - a.id);
  },

  // Buscar por slug — usado para SEO (/autos/toyota-hilux-2023-14)
  getBySlug: async (slug: string): Promise<Vehiculo> => {
    const r = await fetch(`${API_URL}/autos/slug/${slug}`);
    if (!r.ok) throw new Error('Vehículo no encontrado');
    return r.json();
  },

  // Buscar por ID numérico — fallback para links viejos (/vehiculo/:id)
  getById: async (id: number): Promise<Vehiculo> => {
    const r = await fetch(`${API_URL}/autos/${id}`);
    if (!r.ok) throw new Error('Vehículo no encontrado');
    return r.json();
  },

  create: async (car: Omit<Vehiculo, 'id'>): Promise<Vehiculo> => {
    const r = await fetch(`${API_URL}/autos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    });
    if (!r.ok) throw new Error(`Error ${r.status} al crear vehículo`);
    return r.json();
  },

  update: async (car: Vehiculo): Promise<Vehiculo> => {
    const r = await fetch(`${API_URL}/autos/${car.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    });
    if (!r.ok) throw new Error(`Error ${r.status} al actualizar vehículo`);
    return r.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/autos/${id}`, { method: 'DELETE' });
  },

  // --- MARCAS ---
  getBrands: async (): Promise<Brand[]> => {
    const r = await fetch(`${API_URL}/brands`);
    return r.json();
  },
  createBrand: async (name: string) => {
    await fetch(`${API_URL}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  },
  deleteBrand: async (id: number) => {
    await fetch(`${API_URL}/brands/${id}`, { method: 'DELETE' });
  },

  // --- COLORES ---
  getColors: async (): Promise<Color[]> => {
    const r = await fetch(`${API_URL}/colors`);
    return r.json();
  },
  createColor: async (name: string, hex?: string) => {
    await fetch(`${API_URL}/colors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, hex }),
    });
  },
  deleteColor: async (id: number) => {
    await fetch(`${API_URL}/colors/${id}`, { method: 'DELETE' });
  },

  // --- VENDEDORES ---
  getVendors: async (): Promise<Vendor[]> => {
    const r = await fetch(`${API_URL}/vendors`);
    if (!r.ok) throw new Error(`Error obteniendo vendedores: ${r.status}`);
    return r.json();
  },

  // --- USUARIOS ---
  getUsers: async (): Promise<User[]> => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${API_URL}/users`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!r.ok) {
      if (r.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/';
        return [];
      }
      throw new Error(`Error al obtener usuarios: ${r.status}`);
    }
    return r.json();
  },

  createUser: async (u: Omit<User, 'id' | 'activo' | 'creado_en'> & { password: string }) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(u),
    });
    if (!r.ok) throw new Error(`Error al crear usuario: ${r.status}`);
  },

  updateUser: async (id: number, updates: Partial<Omit<User, 'id' | 'activo' | 'creado_en'> & { password?: string }>) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    });
    if (!r.ok) throw new Error(`Error al actualizar usuario: ${r.status}`);
  },

  deleteUser: async (id: number) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!r.ok) throw new Error(`Error al eliminar usuario: ${r.status}`);
  },

  toggleUser: async (id: number): Promise<{ activo: boolean }> => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${API_URL}/users/${id}/toggle`, {
      method: 'PATCH',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!r.ok) throw new Error(`Error al cambiar estado: ${r.status}`);
    return r.json();
  },

  updateProfile: async (data: { nombre?: string; email?: string; telefono?: string }) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.detail || 'Error al actualizar perfil');
    }
    return r.json();
  },

  changePassword: async (current_password: string, new_password: string) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${API_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ current_password, new_password }),
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.detail || 'Error al cambiar contraseña');
    }
    return r.json();
  },

  login: async (username: string, password: string): Promise<boolean> => {
    const r = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return r.ok;
  },

  // --- MÉTRICAS ---
  incrementView: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/autos/${id}/view`, { method: 'POST' });
  },

  incrementInterested: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/autos/${id}/interested`, { method: 'POST' });
  },

  resetMetrics: async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    await fetch(`${API_URL}/autos/reset-metrics`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  },

  // --- ACTIVITY LOG ---
  logActivity: async (action: string, entityName: string, details?: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    await fetch(`${API_URL}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action, entity_name: entityName, details: details || null }),
    }).catch(() => {});
  },

  getActivity: async (): Promise<ActivityLogEntry[]> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return [];
    const r = await fetch(`${API_URL}/activity`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!r.ok) return [];
    return r.json();
  },
};