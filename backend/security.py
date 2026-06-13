from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, validator

# Configuración de seguridad
SECRET_KEY = "lions-cars-secret-key-2024-change-in-prod"  # ⚠️ CAMBIAR EN PRODUCCIÓN
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

# Contexto para hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- SCHEMAS PARA VALIDACIÓN ---
class UserCreate(BaseModel):
    nombre: str
    email: EmailStr
    telefono: str
    username: str
    password: str
    role: Optional[str] = "vendedor"  # admin | vendedor

    @validator('nombre')
    def nombre_not_empty(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Nombre debe tener al menos 2 caracteres')
        return v.strip()

    @validator('telefono')
    def telefono_valid(cls, v):
        # Remover caracteres especiales y verificar longitud mínima
        digits = ''.join(filter(str.isdigit, v))
        if len(digits) < 8:
            raise ValueError('Teléfono debe tener al menos 8 dígitos')
        return v

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Contraseña debe tener al menos 8 caracteres')
        if not any(char.isupper() for char in v):
            raise ValueError('Contraseña debe contener al menos una mayúscula')
        if not any(char.isdigit() for char in v):
            raise ValueError('Contraseña debe contener al menos un dígito')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    nombre: str
    email: str
    telefono: str
    username: str
    role: str
    activo: bool
    creado_en: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

# --- FUNCIONES DE SEGURIDAD ---
def hash_password(password: str) -> str:
    """Genera hash bcrypt de la contraseña"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña coincida con el hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[TokenData]:
    """Decodifica y valida un JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        role: str = payload.get("role")
        if username is None:
            return None
        token_data = TokenData(username=username, user_id=user_id, role=role)
    except JWTError:
        return None
    return token_data
