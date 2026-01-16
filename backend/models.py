from sqlalchemy import Column, Integer, String, Boolean, JSON, Float
from database import Base

# --- CONFIGURACIONES DEL SISTEMA ---
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String) # En prod usar hashing
    role = Column(String, default="vendedor") # admin | vendedor

class BrandDB(Base):
    __tablename__ = "brands"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class ColorDB(Base):
    __tablename__ = "colors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    hex = Column(String, nullable=True) # Para mostrar el color visualmente

# --- MODELO VEHÍCULO (Ya incluye cilindrada) ---
class VehiculoDB(Base):
    __tablename__ = "vehiculos"
    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String, index=True)
    modelo = Column(String, index=True)
    version = Column(String, nullable=True)
    ano = Column(Integer)
    precio = Column(Integer)
    km = Column(Integer)
    duenos = Column(Integer, default=1)
    
    # Especificaciones
    traccion = Column(String, nullable=True)
    transmision = Column(String)
    cilindrada = Column(String, nullable=True) # <--- AQUÍ ESTÁ LA CILINDRADA
    combustible = Column(String)
    carroceria = Column(String)
    puertas = Column(Integer)
    pasajeros = Column(Integer)
    motor = Column(String, nullable=True)
    techo = Column(Boolean, default=False)
    asientos = Column(String)
    
    # Venta
    tipoVenta = Column(String)
    vendedor = Column(String)
    financiable = Column(Boolean, default=True)
    valorPie = Column(Integer)
    estado = Column(String, default="Disponible")
    
    # Detalles
    aire = Column(Boolean, default=True)
    neumaticos = Column(String)
    llaves = Column(Integer)
    obs = Column(String)
    patente = Column(String, nullable=True)
    color = Column(String)
    
    # Métricas
    diasStock = Column(Integer, default=0)
    vistas = Column(Integer, default=0)
    interesados = Column(Integer, default=0)
    comisionEstimada = Column(Integer, default=0)

    # JSONs
    imagenes = Column(JSON, default=[]) 
    imagen = Column(String, nullable=True)
    precioHistorial = Column(JSON, default=[])
    hotspots = Column(JSON, default=[])