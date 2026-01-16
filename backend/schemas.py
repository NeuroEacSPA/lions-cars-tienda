from pydantic import BaseModel
from typing import List, Optional, Any

# Sub-modelos para estructuras complejas
class PrecioHistorialItem(BaseModel):
    date: str
    price: int

class HotspotItem(BaseModel):
    id: str
    x: float
    y: float
    label: str
    detail: str
    imageIndex: Optional[int] = 0

# Base Schema (compartido para crear y leer)
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
    cilindrada: Optional[str] = None
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
    imagenes: List[str] = []
    imagen: str
    estado: str
    diasStock: int
    vistas: int
    interesados: int
    patente: str
    color: str
    comisionEstimada: int
    precioHistorial: List[PrecioHistorialItem] = []
    hotspots: List[HotspotItem] = []

class VehiculoCreate(VehiculoBase):
    pass

class Vehiculo(VehiculoBase):
    id: int

    class Config:
        from_attributes = True # Antes orm_mode