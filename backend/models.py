from sqlalchemy import Column, Integer, String, Boolean, Float, JSON
from database import Base

class VehiculoDB(Base):
    __tablename__ = "vehiculos"

    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String, index=True)
    modelo = Column(String, index=True)
    version = Column(String, nullable=True)
    ano = Column(Integer)
    precio = Column(Integer)
    km = Column(Integer)
    duenos = Column(Integer)
    traccion = Column(String, nullable=True)
    transmision = Column(String)
    cilindrada = Column(String, nullable=True)
    combustible = Column(String)
    carroceria = Column(String)
    puertas = Column(Integer)
    pasajeros = Column(Integer)
    motor = Column(String, nullable=True)
    techo = Column(Boolean, default=False)
    asientos = Column(String)
    tipoVenta = Column(String) # 'Propio' | 'Consignado'
    vendedor = Column(String)
    financiable = Column(Boolean, default=True)
    valorPie = Column(Integer)
    aire = Column(Boolean, default=True)
    neumaticos = Column(String)
    llaves = Column(Integer)
    obs = Column(String)
    
    # Campos complejos guardados como JSON
    imagenes = Column(JSON, default=[]) # Lista de strings URL/Base64
    imagen = Column(String) # Imagen principal
    estado = Column(String) # 'Disponible' | 'Reservado' | 'Vendido'
    diasStock = Column(Integer, default=0)
    vistas = Column(Integer, default=0)
    interesados = Column(Integer, default=0)
    patente = Column(String)
    color = Column(String)
    comisionEstimada = Column(Integer)
    
    # Estructuras complejas
    precioHistorial = Column(JSON, default=[])
    hotspots = Column(JSON, default=[])