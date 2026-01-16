from pydantic import BaseModel
from typing import List, Optional

# --- SCHEMAS DE CONFIGURACIÓN ---
class UserBase(BaseModel):
    username: str
    password: str
    role: str = "vendedor"

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

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

# --- SCHEMAS DE VEHÍCULO (Igual que antes pero confirmando cilindrada) ---
class Hotspot(BaseModel):
    id: str
    x: float
    y: float
    label: str
    detail: str
    imageIndex: Optional[int] = 0

class PrecioHistorialItem(BaseModel):
    date: str
    price: int

class VehiculoBase(BaseModel):
    marca: str
    modelo: str
    version: Optional[str] = None
    ano: int
    precio: int
    km: int
    duenos: int
    traccion: Optional[str] = None
    transmision: str
    cilindrada: Optional[str] = None # <--- CONFIRMADO
    combustible: str
    carroceria: str
    puertas: int
    pasajeros: int
    motor: Optional[str] = None
    techo: bool
    asientos: str
    tipoVenta: str
    vendedor: str
    financiable: bool
    valorPie: int
    aire: bool
    neumaticos: str
    llaves: int
    obs: str
    estado: str
    patente: str
    color: str
    diasStock: int = 0
    vistas: int = 0
    interesados: int = 0
    comisionEstimada: int = 0
    imagenes: List[str] = []
    imagen: Optional[str] = ""
    precioHistorial: List[PrecioHistorialItem] = []
    hotspots: List[Hotspot] = []

class VehiculoCreate(VehiculoBase):
    pass

class Vehiculo(VehiculoBase):
    id: int
    class Config:
        from_attributes = True