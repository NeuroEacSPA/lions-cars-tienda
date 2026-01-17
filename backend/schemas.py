from pydantic import BaseModel
from typing import List, Optional, Any, Dict

# --- SCHEMAS AUXILIARES (Marcas, Colores, Usuarios) ---
class BrandBase(BaseModel):
    name: str

class Brand(BrandBase):
    id: int
    class Config:
        from_attributes = True

class ColorBase(BaseModel):
    name: str
    hex: Optional[str] = None

class Color(ColorBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    password: str 

class UserCreate(UserBase):
    role: str = "vendedor"

class User(UserBase):
    id: int
    role: str
    class Config:
        from_attributes = True

# --- SCHEMA PRINCIPAL: VEHÍCULO ---

class VehiculoBase(BaseModel):
    marca: str
    modelo: str
    version: Optional[str] = None
    ano: int
    precio: int
    km: int
    duenos: int = 1  # <--- NUEVO
    
    # Especificaciones
    traccion: Optional[str] = "4x2" # <--- NUEVO
    transmision: str
    cilindrada: Optional[str] = None
    combustible: str
    carroceria: str
    puertas: int = 5    # <--- NUEVO
    pasajeros: int = 5  # <--- NUEVO
    motor: Optional[str] = None
    techo: bool = False
    asientos: str
    
    # Venta
    tipoVenta: str
    vendedor: str
    financiable: bool = True
    valorPie: int
    estado: str = "Disponible"
    
    # Detalles
    aire: bool = True
    neumaticos: str
    llaves: int
    obs: Optional[str] = ""
    patente: Optional[str] = None # Opcional, pero se acepta
    color: str
    
    # Métricas
    diasStock: int = 0
    vistas: int = 0
    interesados: int = 0
    comisionEstimada: int = 0

    # JSONs (Imágenes y Hotspots)
    imagenes: List[str] = []
    imagen: Optional[str] = None
    precioHistorial: List[Dict[str, Any]] = []
    hotspots: List[Dict[str, Any]] = []

class VehiculoCreate(VehiculoBase):
    pass

class Vehiculo(VehiculoBase):
    id: int
    class Config:
        from_attributes = True # Esto permite leer desde SQLAlchemy