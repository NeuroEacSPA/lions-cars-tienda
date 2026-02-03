import sqlite3
import shutil
import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# --- CONFIGURACIÓN CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "lions_cars.db"
# RUTA ABSOLUTA DONDE SE GUARDARÁN LAS FOTOS (Debe coincidir con la config de Nginx)
UPLOAD_DIR = "/home/neuro/lions-cars-tienda/uploads"

# Asegurarse de que la carpeta base exista
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- MODELOS DE DATOS ---

class Hotspot(BaseModel):
    id: str
    x: float
    y: float
    label: str
    detail: str
    imageIndex: Optional[int] = 0

class Vehiculo(BaseModel):
    id: Optional[int] = None
    marca: str
    modelo: str
    version: Optional[str] = ""
    ano: int
    precio: int
    km: int
    duenos: int
    traccion: Optional[str] = ""
    transmision: str
    cilindrada: Optional[str] = ""
    combustible: str
    carroceria: str
    puertas: int
    pasajeros: int
    motor: Optional[str] = ""
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
    imagenes: List[str]
    imagen: str
    estado: str
    diasStock: int
    vistas: int
    interesados: int
    patente: str
    color: str
    comisionEstimada: int
    precioHistorial: List[dict]
    hotspots: List[Hotspot]

class Brand(BaseModel):
    name: str

class Color(BaseModel):
    name: str
    hex: Optional[str] = None

class User(BaseModel):
    username: str
    password: str
    role: Optional[str] = "vendedor"

class LoginRequest(BaseModel):
    username: str
    password: str

# --- BASE DE DATOS ---
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS vehiculos (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS brands (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)''')
    c.execute('''CREATE TABLE IF NOT EXISTS colors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, hex TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)''')
    try:
        c.execute("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)", ("admin", "admin", "admin"))
    except: pass
    conn.commit()
    conn.close()

init_db()

# --- ENDPOINTS ---

# NUEVO ENDPOINT PARA SUBIR IMÁGENES
@app.post("/api/upload")
async def upload_image(
    file: UploadFile = File(...), 
    marca: str = Form(...), 
    modelo: str = Form(...)
):
    """
    Recibe un archivo + marca + modelo.
    Guarda el archivo en: /uploads/marca_modelo/filename.ext
    Devuelve la URL pública.
    """
    try:
        # 1. Limpiar nombres para crear carpeta (ej: "Toyota Corolla" -> "toyota_corolla")
        clean_folder = f"{marca.strip()}_{modelo.strip()}".lower().replace(" ", "_")
        
        # 2. Crear la ruta completa de la carpeta
        target_folder = os.path.join(UPLOAD_DIR, clean_folder)
        os.makedirs(target_folder, exist_ok=True) # Crea la carpeta si no existe

        # 3. Manejo de nombre de archivo y duplicados
        filename = file.filename.replace(" ", "_") # Quitar espacios del nombre del archivo
        file_location = os.path.join(target_folder, filename)

        # Si el archivo ya existe, le agregamos un número (ej: auto_1.jpg)
        base_name, extension = os.path.splitext(filename)
        counter = 1
        while os.path.exists(file_location):
            filename = f"{base_name}_{counter}{extension}"
            file_location = os.path.join(target_folder, filename)
            counter += 1

        # 4. Guardar el archivo físicamente
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 5. Generar la URL pública (HTTPS)
        # Nginx mapea /uploads/ -> UPLOAD_DIR
        public_url = f"https://lionscars.cl/uploads/{clean_folder}/{filename}"
        
        return {"url": public_url}

    except Exception as e:
        print(f"Error subiendo imagen: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 1. AUTOS
@app.get("/api/autos")
def get_autos():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM vehiculos")
    rows = c.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        try:
            car_data = json.loads(row["data"])
            car_data["id"] = row["id"]
            results.append(car_data)
        except:
            continue
    return results

@app.post("/api/autos")
def create_auto(auto: Vehiculo):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Ahora 'auto.imagenes' ya debe venir con URLs reales desde el frontend
    json_data = auto.json(exclude={"id"})
    c.execute("INSERT INTO vehiculos (data) VALUES (?)", (json_data,))
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    return {**auto.dict(), "id": new_id}

@app.put("/api/autos/{item_id}")
def update_auto(item_id: int, auto: Vehiculo):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    json_data = auto.json(exclude={"id"})
    c.execute("UPDATE vehiculos SET data = ? WHERE id = ?", (json_data, item_id))
    conn.commit()
    conn.close()
    return {**auto.dict(), "id": item_id}

@app.delete("/api/autos/{item_id}")
def delete_auto(item_id: int):
    # Opcional: Aquí podrías agregar lógica para borrar también las fotos del disco si quisieras
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM vehiculos WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return {"message": "Eliminado"}

# 2. CONFIGURACIÓN (Marcas, Colores, Usuarios)
@app.get("/api/brands")
def get_brands():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM brands").fetchall()
    conn.close()
    return [{"id": r["id"], "name": r["name"]} for r in rows]

@app.post("/api/brands")
def create_brand(brand: Brand):
    conn = sqlite3.connect(DB_NAME)
    try:
        conn.execute("INSERT INTO brands (name) VALUES (?)", (brand.name,))
        conn.commit()
    except: pass
    conn.close()
    return {"message": "OK"}

@app.delete("/api/brands/{id}")
def delete_brand(id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM brands WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}

@app.get("/api/colors")
def get_colors():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM colors").fetchall()
    conn.close()
    return [{"id": r["id"], "name": r["name"], "hex": r["hex"]} for r in rows]

@app.post("/api/colors")
def create_color(color: Color):
    conn = sqlite3.connect(DB_NAME)
    try:
        conn.execute("INSERT INTO colors (name, hex) VALUES (?, ?)", (color.name, color.hex))
        conn.commit()
    except: pass
    conn.close()
    return {"message": "OK"}

@app.delete("/api/colors/{id}")
def delete_color(id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM colors WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}

@app.get("/api/users")
def get_users():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT id, username, role FROM users").fetchall()
    conn.close()
    return [{"id": r["id"], "username": r["username"], "role": r["role"]} for r in rows]

@app.post("/api/users")
def create_user(user: User):
    conn = sqlite3.connect(DB_NAME)
    try:
        conn.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", (user.username, user.password, user.role))
        conn.commit()
    except: pass
    conn.close()
    return {"message": "OK"}

@app.delete("/api/users/{id}")
def delete_user(id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM users WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}

@app.post("/api/login")
def login(creds: LoginRequest):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ? AND password = ?", (creds.username, creds.password))
    user = c.fetchone()
    conn.close()
    if user:
        return {"status": "ok", "role": user["role"]}
    else:
        raise HTTPException(status_code=401, detail="Error")

# 3. MÉTRICAS - Incrementar vistas
@app.post("/api/autos/{item_id}/view")
def increment_view(item_id: int):
    """Incrementa el contador de vistas cuando alguien ve un vehículo"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Obtener el vehículo actual
    c.execute("SELECT * FROM vehiculos WHERE id = ?", (item_id,))
    row = c.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Parsear y actualizar vistas
    car_data = json.loads(row["data"])
    car_data["vistas"] = car_data.get("vistas", 0) + 1
    
    # Guardar
    c.execute("UPDATE vehiculos SET data = ? WHERE id = ?", (json.dumps(car_data), item_id))
    conn.commit()
    conn.close()
    
    return {"vistas": car_data["vistas"]}

# 4. MÉTRICAS - Incrementar interesados
@app.post("/api/autos/{item_id}/interested")
def increment_interested(item_id: int):
    """Incrementa el contador de interesados cuando alguien hace clic en contactar"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Obtener el vehículo actual
    c.execute("SELECT * FROM vehiculos WHERE id = ?", (item_id,))
    row = c.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Parsear y actualizar interesados
    car_data = json.loads(row["data"])
    car_data["interesados"] = car_data.get("interesados", 0) + 1
    
    # Guardar
    c.execute("UPDATE vehiculos SET data = ? WHERE id = ?", (json.dumps(car_data), item_id))
    conn.commit()
    conn.close()
    
    return {"interesados": car_data["interesados"]}

# 5. MÉTRICAS - Resetear todas las métricas
@app.post("/api/autos/reset-metrics")
def reset_all_metrics():
    """Resetea vistas e interesados de todos los vehículos a 0"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Obtener todos los vehículos
    c.execute("SELECT * FROM vehiculos")
    rows = c.fetchall()
    
    updated_count = 0
    for row in rows:
        car_data = json.loads(row["data"])
        car_data["vistas"] = 0
        car_data["interesados"] = 0
        
        c.execute("UPDATE vehiculos SET data = ? WHERE id = ?", (json.dumps(car_data), row["id"]))
        updated_count += 1
    
    conn.commit()
    conn.close()
    
    return {"message": f"Métricas reseteadas en {updated_count} vehículos"}