from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, get_db

# Crea las tablas automáticamente al iniciar
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lions Cars API")

# IMPORTANTE: Configurar CORS para permitir que tu frontend (React) hable con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Ajusta el puerto de tu React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RUTAS ---

@app.get("/autos", response_model=List[schemas.Vehiculo])
def leer_autos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    autos = db.query(models.VehiculoDB).offset(skip).limit(limit).all()
    return autos

@app.get("/autos/{auto_id}", response_model=schemas.Vehiculo)
def leer_auto_por_id(auto_id: int, db: Session = Depends(get_db)):
    auto = db.query(models.VehiculoDB).filter(models.VehiculoDB.id == auto_id).first()
    if auto is None:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return auto

@app.post("/autos", response_model=schemas.Vehiculo)
def crear_auto(auto: schemas.VehiculoCreate, db: Session = Depends(get_db)):
    # Convertimos el esquema Pydantic a Modelo SQLAlchemy
    # .dict() o .model_dump() dependiendo de la versión de Pydantic
    db_auto = models.VehiculoDB(**auto.model_dump()) 
    db.add(db_auto)
    db.commit()
    db.refresh(db_auto)
    return db_auto

@app.put("/autos/{auto_id}", response_model=schemas.Vehiculo)
def actualizar_auto(auto_id: int, auto_update: schemas.VehiculoCreate, db: Session = Depends(get_db)):
    db_auto = db.query(models.VehiculoDB).filter(models.VehiculoDB.id == auto_id).first()
    if db_auto is None:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Actualizar campos
    for key, value in auto_update.model_dump().items():
        setattr(db_auto, key, value)
    
    db.commit()
    db.refresh(db_auto)
    return db_auto

@app.delete("/autos/{auto_id}")
def eliminar_auto(auto_id: int, db: Session = Depends(get_db)):
    db_auto = db.query(models.VehiculoDB).filter(models.VehiculoDB.id == auto_id).first()
    if db_auto is None:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    db.delete(db_auto)
    db.commit()
    return {"mensaje": "Vehículo eliminado correctamente"}