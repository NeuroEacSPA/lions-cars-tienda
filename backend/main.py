from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, get_db

# Al actualizar modelos, recreamos tablas (en dev es seguro, en prod usar Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lions Cars API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RUTAS DE VEHÍCULOS (Ya existían) ---
@app.get("/autos", response_model=List[schemas.Vehiculo])
def obtener_autos(db: Session = Depends(get_db)):
    return db.query(models.VehiculoDB).order_by(models.VehiculoDB.id.desc()).all()

@app.post("/autos", response_model=schemas.Vehiculo)
def crear_auto(auto: schemas.VehiculoCreate, db: Session = Depends(get_db)):
    db_auto = models.VehiculoDB(**auto.model_dump())
    db.add(db_auto)
    db.commit()
    db.refresh(db_auto)
    return db_auto

@app.put("/autos/{auto_id}", response_model=schemas.Vehiculo)
def actualizar_auto(auto_id: int, auto_update: schemas.VehiculoCreate, db: Session = Depends(get_db)):
    db_auto = db.query(models.VehiculoDB).filter(models.VehiculoDB.id == auto_id).first()
    if not db_auto:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    update_data = auto_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_auto, key, value)
    db.commit()
    db.refresh(db_auto)
    return db_auto

@app.delete("/autos/{auto_id}")
def eliminar_auto(auto_id: int, db: Session = Depends(get_db)):
    db_auto = db.query(models.VehiculoDB).filter(models.VehiculoDB.id == auto_id).first()
    if not db_auto:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    db.delete(db_auto)
    db.commit()
    return {"mensaje": "Vehículo eliminado"}

# --- RUTAS DE GESTIÓN (NUEVAS) ---

# 1. Marcas
@app.get("/brands", response_model=List[schemas.Brand])
def get_brands(db: Session = Depends(get_db)):
    return db.query(models.BrandDB).order_by(models.BrandDB.name).all()

@app.post("/brands", response_model=schemas.Brand)
def create_brand(brand: schemas.BrandBase, db: Session = Depends(get_db)):
    db_brand = models.BrandDB(name=brand.name)
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)
    return db_brand

@app.delete("/brands/{id}")
def delete_brand(id: int, db: Session = Depends(get_db)):
    db_obj = db.query(models.BrandDB).filter(models.BrandDB.id == id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return {"ok": True}

# 2. Colores
@app.get("/colors", response_model=List[schemas.Color])
def get_colors(db: Session = Depends(get_db)):
    return db.query(models.ColorDB).order_by(models.ColorDB.name).all()

@app.post("/colors", response_model=schemas.Color)
def create_color(color: schemas.ColorBase, db: Session = Depends(get_db)):
    db_color = models.ColorDB(name=color.name, hex=color.hex)
    db.add(db_color)
    db.commit()
    db.refresh(db_color)
    return db_color

@app.delete("/colors/{id}")
def delete_color(id: int, db: Session = Depends(get_db)):
    db_obj = db.query(models.ColorDB).filter(models.ColorDB.id == id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return {"ok": True}

# 3. Usuarios
@app.get("/users", response_model=List[schemas.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.UserDB).all()

@app.post("/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # En un sistema real, aquí hashearías la contraseña
    db_user = models.UserDB(username=user.username, password=user.password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login")
def login(user: schemas.UserBase, db: Session = Depends(get_db)):
    db_user = db.query(models.UserDB).filter(models.UserDB.username == user.username, models.UserDB.password == user.password).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    return {"status": "ok", "user": db_user.username, "role": db_user.role}

@app.delete("/users/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):
    db_obj = db.query(models.UserDB).filter(models.UserDB.id == id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return {"ok": True}