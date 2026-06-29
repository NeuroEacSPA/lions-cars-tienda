import sqlite3
import shutil
import os
import re
import io
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import timedelta
from PIL import Image
from security import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    hash_password, verify_password, create_access_token, decode_token
)

app = FastAPI(title="Lions Cars API", version="3.0")

# --- CONFIGURACIÓN CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "lions_cars.db"
UPLOAD_DIR = "/home/neuro/lions-cars-tienda/uploads"

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
    vendedor_id: Optional[int] = None
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

class LoginRequest(BaseModel):
    username: str
    password: str

# --- UTILIDADES ---

def generar_slug(marca: str, modelo: str, ano: int, uid: str) -> str:
    """Genera un slug URL-friendly único. Ej: toyota-hilux-2023-14"""
    base = f"{marca}-{modelo}-{ano}".lower()
    base = re.sub(r'[^a-z0-9-]', '-', base)
    base = re.sub(r'-+', '-', base).strip('-')
    return f"{base}-{uid}"

def optimizar_imagen(contenido: bytes, max_width: int = 1200) -> bytes:
    """
    Convierte cualquier imagen a WebP optimizado.
    - Redimensiona si supera max_width (conserva proporción)
    - Convierte modos incompatibles (RGBA, P) a RGB
    - Calidad 82: balance perfecto tamaño/calidad visual
    """
    img = Image.open(io.BytesIO(contenido))

    # Convertir modos incompatibles con WebP
    if img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGB")

    # Redimensionar solo si es más ancho que el límite
    if img.width > max_width:
        ratio = max_width / img.width
        nuevo_alto = int(img.height * ratio)
        img = img.resize((max_width, nuevo_alto), Image.LANCZOS)

    output = io.BytesIO()
    img.save(output, format="WEBP", quality=82, optimize=True)
    return output.getvalue()

# --- BASE DE DATOS ---

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    # Tablas base
    c.execute('''CREATE TABLE IF NOT EXISTS vehiculos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT,
        vendedor_id INTEGER,
        slug TEXT UNIQUE
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        hex TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefono TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'vendedor',
        activo BOOLEAN DEFAULT 1,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        nombre TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # Migraciones seguras (por si la DB ya existe)
    for columna, definicion in [
        ("vendedor_id", "INTEGER"),
        ("slug", "TEXT"),
    ]:
        try:
            c.execute(f"ALTER TABLE vehiculos ADD COLUMN {columna} {definicion}")
            print(f"✓ Columna '{columna}' agregada a vehiculos")
        except sqlite3.OperationalError:
            pass  # Ya existe

    # Usuario admin por defecto
    try:
        admin_password = hash_password("Admin123")
        c.execute(
            "INSERT OR IGNORE INTO users (nombre, email, telefono, username, password, role) VALUES (?, ?, ?, ?, ?, ?)",
            ("Administrador", "admin@lionscars.cl", "+56900000000", "admin", admin_password, "admin")
        )
    except Exception as e:
        print(f"Error creando admin: {e}")

    conn.commit()
    conn.close()

init_db()

# --- AUTENTICACIÓN ---

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token no proporcionado")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Formato de Authorization inválido")

    token_data = decode_token(token)
    if token_data is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")

    return {"username": token_data.username, "user_id": token_data.user_id, "role": token_data.role}

def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] not in ("admin", "owner"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores pueden acceder")
    return current_user

def get_owner_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    return current_user

# ============================================================
# ENDPOINTS
# ============================================================

# --- UPLOAD DE IMÁGENES (con optimización WebP automática) ---

@app.post("/api/upload")
async def upload_image(
    file: UploadFile = File(...),
    marca: str = Form(...),
    modelo: str = Form(...)
):
    """
    Sube una imagen, la convierte a WebP optimizado y la guarda.
    Reducción típica: de 3-5MB (WhatsApp) a 150-300KB.
    """
    try:
        clean_folder = f"{marca.strip()}_{modelo.strip()}".lower().replace(" ", "_")
        target_folder = os.path.join(UPLOAD_DIR, clean_folder)
        os.makedirs(target_folder, exist_ok=True)

        # Nombre único con UUID (evita colisiones y caracteres raros)
        unique_name = f"{uuid.uuid4().hex[:12]}.webp"
        file_location = os.path.join(target_folder, unique_name)

        # Leer, optimizar y guardar
        contenido = await file.read()
        webp_bytes = optimizar_imagen(contenido)

        with open(file_location, "wb") as f:
            f.write(webp_bytes)

        original_kb = len(contenido) // 1024
        optimizado_kb = len(webp_bytes) // 1024
        print(f"✓ Imagen optimizada: {original_kb}KB → {optimizado_kb}KB ({unique_name})")

        public_url = f"https://lionscars.cl/uploads/{clean_folder}/{unique_name}"
        return {"url": public_url, "original_kb": original_kb, "optimizado_kb": optimizado_kb}

    except Exception as e:
        print(f"Error subiendo imagen: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- VEHÍCULOS ---

def row_to_car(row) -> dict:
    """Convierte una fila de la DB a dict completo con id, slug y vendedor_id."""
    car_data = json.loads(row["data"])
    car_data["id"] = row["id"]
    car_data["vendedor_id"] = row["vendedor_id"]
    car_data["slug"] = row["slug"]
    return car_data

@app.get("/api/autos")
def get_autos():
    """Devuelve todos los vehículos disponibles."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM vehiculos").fetchall()
    conn.close()

    results = []
    for row in rows:
        try:
            results.append(row_to_car(row))
        except Exception:
            continue
    return results

@app.get("/api/autos/slug/{slug}")
def get_auto_by_slug(slug: str):
    """
    Devuelve un vehículo por su slug.
    Usado por el frontend para las URLs individuales (SEO).
    Ej: GET /api/autos/slug/toyota-hilux-2023-14
    """
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM vehiculos WHERE slug = ?", (slug,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    return row_to_car(row)

@app.get("/api/autos/{item_id}")
def get_auto(item_id: int):
    """Devuelve un vehículo por ID numérico."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM vehiculos WHERE id = ?", (item_id,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    return row_to_car(row)

@app.post("/api/autos")
def create_auto(auto: Vehiculo):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    json_data = auto.json(exclude={"id"})
    c.execute("INSERT INTO vehiculos (data, vendedor_id) VALUES (?, ?)", (json_data, auto.vendedor_id))
    new_id = c.lastrowid

    # Generar slug usando el ID real recién creado
    slug = generar_slug(auto.marca, auto.modelo, auto.ano, str(new_id))
    c.execute("UPDATE vehiculos SET slug = ? WHERE id = ?", (slug, new_id))

    conn.commit()
    conn.close()
    return {**auto.dict(), "id": new_id, "slug": slug}

@app.put("/api/autos/{item_id}")
def update_auto(item_id: int, auto: Vehiculo):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    json_data = auto.json(exclude={"id"})

    # Regenerar slug si cambiaron marca/modelo/año
    slug = generar_slug(auto.marca, auto.modelo, auto.ano, str(item_id))
    c.execute(
        "UPDATE vehiculos SET data = ?, vendedor_id = ?, slug = ? WHERE id = ?",
        (json_data, auto.vendedor_id, slug, item_id)
    )
    conn.commit()
    conn.close()
    return {**auto.dict(), "id": item_id, "slug": slug}

@app.delete("/api/autos/{item_id}")
def delete_auto(item_id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM vehiculos WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return {"message": "Eliminado"}


# --- MARCAS ---

@app.get("/api/brands")
def get_brands():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM brands ORDER BY name").fetchall()
    conn.close()
    return [{"id": r["id"], "name": r["name"]} for r in rows]

@app.post("/api/brands")
def create_brand(brand: Brand):
    conn = sqlite3.connect(DB_NAME)
    try:
        conn.execute("INSERT INTO brands (name) VALUES (?)", (brand.name,))
        conn.commit()
    except Exception:
        pass
    conn.close()
    return {"message": "OK"}

@app.delete("/api/brands/{id}")
def delete_brand(id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM brands WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}


# --- COLORES ---

@app.get("/api/colors")
def get_colors():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM colors ORDER BY name").fetchall()
    conn.close()
    return [{"id": r["id"], "name": r["name"], "hex": r["hex"]} for r in rows]

@app.post("/api/colors")
def create_color(color: Color):
    conn = sqlite3.connect(DB_NAME)
    try:
        conn.execute("INSERT INTO colors (name, hex) VALUES (?, ?)", (color.name, color.hex))
        conn.commit()
    except Exception:
        pass
    conn.close()
    return {"message": "OK"}

@app.delete("/api/colors/{id}")
def delete_color(id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM colors WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}


# --- USUARIOS ---

@app.get("/api/users")
def get_users(admin: dict = Depends(get_admin_user)):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    # owner solo visible para owners
    if admin["role"] == "owner":
        rows = conn.execute(
            "SELECT id, nombre, email, telefono, username, role, activo FROM users ORDER BY id"
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT id, nombre, email, telefono, username, role, activo FROM users WHERE role != 'owner' ORDER BY id"
        ).fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/users")
def create_user(user_data: dict, admin: dict = Depends(get_admin_user)):
    try:
        conn = sqlite3.connect(DB_NAME)
        required_fields = ["nombre", "email", "telefono", "username", "password", "role"]
        for field in required_fields:
            if field not in user_data or not user_data[field]:
                raise HTTPException(status_code=400, detail=f"Campo {field} es requerido")

        # Solo owner puede crear owners
        if user_data.get("role") == "owner" and admin["role"] != "owner":
            raise HTTPException(status_code=403, detail="No tienes permisos para ese rol")

        existing = conn.execute("SELECT id FROM users WHERE username=?", (user_data["username"],)).fetchone()
        if existing:
            conn.close()
            raise HTTPException(status_code=400, detail="El usuario ya existe")

        hashed_password = hash_password(user_data["password"])
        conn.execute(
            "INSERT INTO users (nombre, email, telefono, username, password, role, activo, creado_en) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))",
            (user_data["nombre"], user_data["email"], user_data["telefono"],
             user_data["username"], hashed_password, user_data.get("role", "vendedor"))
        )
        conn.commit()
        conn.close()
        return {"message": "Usuario creado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/users/{id}")
def update_user(id: int, user_data: dict, admin: dict = Depends(get_admin_user)):
    conn = sqlite3.connect(DB_NAME)
    try:
        # Proteger usuarios owner
        target = conn.execute("SELECT role FROM users WHERE id=?", (id,)).fetchone()
        if target and target[0] == "owner" and admin["role"] != "owner":
            conn.close()
            raise HTTPException(status_code=403, detail="No puedes modificar este usuario")

        update_fields = []
        update_values = []

        campo_map = {
            "nombre": "nombre=?",
            "email": "email=?",
            "telefono": "telefono=?",
            "username": "username=?",
            "role": "role=?",
        }
        for campo, sql in campo_map.items():
            if user_data.get(campo):
                # Solo owner puede asignar rol owner
                if campo == "role" and user_data[campo] == "owner" and admin["role"] != "owner":
                    continue
                update_fields.append(sql)
                update_values.append(user_data[campo])

        if user_data.get("password"):
            update_fields.append("password=?")
            update_values.append(hash_password(user_data["password"]))

        if not update_fields:
            conn.close()
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        update_values.append(id)
        conn.execute(f"UPDATE users SET {', '.join(update_fields)} WHERE id=?", update_values)
        conn.commit()
        conn.close()
        return {"message": "Usuario actualizado exitosamente"}
    except sqlite3.IntegrityError as e:
        conn.close()
        if "email" in str(e):
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
        elif "username" in str(e):
            raise HTTPException(status_code=400, detail="El usuario ya existe")
        raise HTTPException(status_code=400, detail="Error al actualizar")
    except HTTPException:
        raise
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/users/{id}/toggle")
def toggle_user(id: int, admin: dict = Depends(get_admin_user)):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    try:
        target = conn.execute("SELECT role, activo FROM users WHERE id=?", (id,)).fetchone()
        if not target:
            conn.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if target["role"] == "owner" and admin["role"] != "owner":
            conn.close()
            raise HTTPException(status_code=403, detail="No puedes modificar este usuario")
        # No puede desactivarse a sí mismo
        if id == admin["user_id"]:
            conn.close()
            raise HTTPException(status_code=400, detail="No puedes desactivarte a ti mismo")

        nuevo = 0 if target["activo"] else 1
        conn.execute("UPDATE users SET activo=? WHERE id=?", (nuevo, id))
        conn.commit()
        conn.close()
        return {"activo": bool(nuevo)}
    except HTTPException:
        raise
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/users/{id}")
def delete_user(id: int, admin: dict = Depends(get_admin_user)):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    target = conn.execute("SELECT role FROM users WHERE id=?", (id,)).fetchone()
    if target and target["role"] == "owner" and admin["role"] != "owner":
        conn.close()
        raise HTTPException(status_code=403, detail="No puedes eliminar este usuario")
    if id == admin["user_id"]:
        conn.close()
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    conn.execute("DELETE FROM users WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Usuario eliminado"}

@app.get("/api/vendors")
def get_vendors():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT id, nombre, telefono FROM users WHERE role='vendedor' AND activo=1 ORDER BY nombre"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


# --- AUTH ---

@app.post("/api/auth/register")
def register(user_data: UserCreate, admin: dict = Depends(get_admin_user)):
    """Registro solo disponible para admins y owners."""
    conn = sqlite3.connect(DB_NAME)
    try:
        if user_data.role == "owner" and admin["role"] != "owner":
            raise HTTPException(status_code=403, detail="No tienes permisos para ese rol")
        hashed_password = hash_password(user_data.password)
        conn.execute(
            "INSERT INTO users (nombre, email, telefono, username, password, role) VALUES (?, ?, ?, ?, ?, ?)",
            (user_data.nombre, user_data.email, user_data.telefono,
             user_data.username, hashed_password, user_data.role)
        )
        conn.commit()
        conn.close()
        return {"message": "Usuario registrado exitosamente"}
    except sqlite3.IntegrityError as e:
        conn.close()
        if "email" in str(e):
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
        elif "username" in str(e):
            raise HTTPException(status_code=400, detail="El usuario ya existe")
        raise HTTPException(status_code=400, detail="Error en el registro")

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT * FROM users WHERE username = ?", (credentials.username,)).fetchone()
    conn.close()

    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    if not user["activo"]:
        raise HTTPException(status_code=401, detail="Usuario inactivo")

    access_token = create_access_token(
        data={"sub": user["username"], "user_id": user["id"], "role": user["role"]},
        expires_delta=timedelta(hours=24)
    )

    user_response = UserResponse(
        id=user["id"],
        nombre=user["nombre"],
        email=user["email"],
        telefono=user["telefono"],
        username=user["username"],
        role=user["role"],
        activo=user["activo"],
        creado_en=user["creado_en"]
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)

@app.get("/api/auth/profile", response_model=UserResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT * FROM users WHERE id = ?", (current_user["user_id"],)).fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return UserResponse(
        id=user["id"],
        nombre=user["nombre"],
        email=user["email"],
        telefono=user["telefono"],
        username=user["username"],
        role=user["role"],
        activo=user["activo"],
        creado_en=user["creado_en"]
    )

@app.put("/api/auth/profile")
def update_profile(profile_data: dict, current_user: dict = Depends(get_current_user)):
    """Permite a cualquier usuario actualizar sus propios datos."""
    conn = sqlite3.connect(DB_NAME)
    try:
        update_fields = []
        update_values = []
        allowed = {"nombre": "nombre=?", "email": "email=?", "telefono": "telefono=?"}
        for campo, sql in allowed.items():
            if profile_data.get(campo):
                update_fields.append(sql)
                update_values.append(profile_data[campo])

        if not update_fields:
            conn.close()
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")

        update_values.append(current_user["user_id"])
        conn.execute(f"UPDATE users SET {', '.join(update_fields)} WHERE id=?", update_values)
        conn.commit()

        user = conn.execute("SELECT * FROM users WHERE id=?", (current_user["user_id"],)).fetchone()
        conn.row_factory = sqlite3.Row
        conn.close()
        return {"message": "Perfil actualizado", "nombre": profile_data.get("nombre"), "email": profile_data.get("email")}
    except sqlite3.IntegrityError as e:
        conn.close()
        if "email" in str(e):
            raise HTTPException(status_code=400, detail="El correo ya está en uso")
        raise HTTPException(status_code=400, detail="Error al actualizar perfil")
    except HTTPException:
        raise
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/auth/password")
def change_password(password_data: dict, current_user: dict = Depends(get_current_user)):
    """Permite a cualquier usuario cambiar su propia contraseña."""
    current_pass = password_data.get("current_password", "")
    new_pass = password_data.get("new_password", "")

    if not current_pass or not new_pass:
        raise HTTPException(status_code=400, detail="Se requieren contraseña actual y nueva")
    if len(new_pass) < 8:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 8 caracteres")
    if not any(c.isupper() for c in new_pass):
        raise HTTPException(status_code=400, detail="La contraseña debe incluir al menos una mayúscula")
    if not any(c.isdigit() for c in new_pass):
        raise HTTPException(status_code=400, detail="La contraseña debe incluir al menos un número")

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT * FROM users WHERE id=?", (current_user["user_id"],)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not verify_password(current_pass, user["password"]):
        conn.close()
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")

    conn.execute("UPDATE users SET password=? WHERE id=?", (hash_password(new_pass), current_user["user_id"]))
    conn.commit()
    conn.close()
    return {"message": "Contraseña actualizada exitosamente"}


# --- MÉTRICAS ---

@app.post("/api/autos/{item_id}/view")
def increment_view(item_id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM vehiculos WHERE id = ?", (item_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    car_data = json.loads(row["data"])
    car_data["vistas"] = car_data.get("vistas", 0) + 1
    conn.execute("UPDATE vehiculos SET data = ? WHERE id = ?", (json.dumps(car_data), item_id))
    conn.commit()
    conn.close()
    return {"vistas": car_data["vistas"]}

@app.post("/api/autos/{item_id}/interested")
def increment_interested(item_id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM vehiculos WHERE id = ?", (item_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    car_data = json.loads(row["data"])
    car_data["interesados"] = car_data.get("interesados", 0) + 1
    conn.execute("UPDATE vehiculos SET data = ? WHERE id = ?", (json.dumps(car_data), item_id))
    conn.commit()
    conn.close()
    return {"interesados": car_data["interesados"]}

@app.post("/api/autos/reset-metrics")
def reset_all_metrics(admin: dict = Depends(get_admin_user)):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM vehiculos").fetchall()

    for row in rows:
        car_data = json.loads(row["data"])
        car_data["vistas"] = 0
        car_data["interesados"] = 0
        conn.execute("UPDATE vehiculos SET data = ? WHERE id = ?", (json.dumps(car_data), row["id"]))

    conn.commit()
    conn.close()
    return {"message": f"Métricas reseteadas en {len(rows)} vehículos"}


# --- ACTIVITY LOG ---

class ActivityEntry(BaseModel):
    action: str
    entity_name: str
    details: Optional[str] = None

@app.post("/api/activity")
def create_activity(entry: ActivityEntry, current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT nombre FROM users WHERE id = ?", (current_user["user_id"],)).fetchone()
    nombre = row["nombre"] if row else current_user["username"]
    conn.execute(
        "INSERT INTO activity_log (user_id, username, nombre, action, entity_name, details) VALUES (?, ?, ?, ?, ?, ?)",
        (current_user["user_id"], current_user["username"], nombre,
         entry.action, entry.entity_name, entry.details)
    )
    conn.commit()
    conn.close()
    return {"ok": True}

@app.get("/api/activity")
def get_activity(limit: int = 30, current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]