# 🏗️ ARQUITECTURA DEL SISTEMA DE AUTENTICACIÓN

## Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                    LIONS CARS PLATFORM                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌──────▼──────┐          ┌────────▼────────┐
        │   FRONTEND  │          │    BACKEND      │
        │   (React)   │◄────────►│   (FastAPI)     │
        └─────────────┘          └─────────────────┘
                │                        │
                │                        │
        ┌───────▼──────────┐      ┌─────▼─────────┐
        │ AuthContext      │      │  Database     │
        │ AuthModal        │      │  (SQLite3)    │
        │ UserMenu         │      │               │
        │ Theme Config     │      │  users        │
        │                  │      │  vehiculos    │
        │                  │      │  brands       │
        │                  │      │  colors       │
        └──────────────────┘      └───────────────┘
```

---

## Flujo de Autenticación

```
USUARIO NO AUTENTICADO
    │
    ├─► Click "Iniciar sesión"
    │       │
    │       ├─► REGISTRO
    │       │   ├─ Validar datos cliente
    │       │   ├─ POST /api/auth/register
    │       │   ├─ Backend valida nuevamente
    │       │   ├─ Hash password con bcrypt
    │       │   ├─ Guardar en BD
    │       │   └─ Mostrar: "Registrado exitosamente"
    │       │
    │       └─► LOGIN
    │           ├─ Ingresar usuario + contraseña
    │           ├─ POST /api/auth/login
    │           ├─ Backend busca usuario
    │           ├─ Verifica contraseña con bcrypt
    │           ├─ Genera JWT Token
    │           ├─ Responde con token + datos usuario
    │           ├─ Frontend guarda token en localStorage
    │           └─ Mostrar: "¡Sesión iniciada!"
    │
    └─► USUARIO AUTENTICADO
        │
        ├─ Token en localStorage
        ├─ useAuth() hook activo
        ├─ UserMenu visible
        │
        ├─► SI ES ADMIN
        │   ├─ Botón "Panel Admin" visible
        │   ├─ Acceso a SellerPortal
        │   └─ CRUD de vehículos, usuarios, etc.
        │
        ├─► SI ES VENDEDOR
        │   ├─ Solo catálogo
        │   ├─ Sin botón Panel Admin
        │   └─ Acceso denegado a admin
        │
        └─► LOGOUT
            ├─ Click "Cerrar sesión"
            ├─ Eliminar token de localStorage
            ├─ Limpiar user data
            └─ Volver a: USUARIO NO AUTENTICADO
```

---

## Arquitectura de Carpetas

```
lions-cars-tienda/
│
├── backend/
│   ├── main.py                 # Endpoints FastAPI
│   ├── models.py               # BD SQLAlchemy
│   ├── security.py             # JWT + bcrypt ⭐
│   ├── schemas.py              # Validaciones Pydantic
│   ├── requirements.txt        # Dependencias Python
│   └── lions_cars.db           # Base de datos SQLite
│
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx       # Login/Registro modal ⭐
│   │   ├── UserMenu.tsx        # Menú usuario logueado ⭐
│   │   ├── SellerPortal.tsx    # Portal admin (protegido)
│   │   └── ... otros
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Context global auth ⭐
│   │
│   ├── config/
│   │   └── theme.ts            # Colores & tema ⭐
│   │
│   ├── App.tsx                 # App principal (modificado)
│   └── main.tsx                # Root (con AuthProvider)
│
├── AUTENTICACION.md            # Documentación técnica ⭐
├── RESUMEN_IMPLEMENTACION.md   # Detalle cambios ⭐
├── RESUMEN_EJECUTIVO.md        # Para no-técnicos ⭐
├── GUIA_PRUEBAS.md             # Tests a realizar ⭐
├── EJEMPLOS_API.js             # Ejemplos código ⭐
└── SETUP.sh                    # Script instalación ⭐

⭐ = Nuevos archivos
```

---

## Flujo de un Request Protegido

```
CLIENTE (React)
    │
    ├─ Obtener token de localStorage
    │
    └─► fetch('/api/auth/profile', {
        headers: {
            'Authorization': 'Bearer eyJhbGc...'
        }
    })
        │
        ▼ HTTP Request
        │
SERVIDOR (FastAPI)
    │
    ├─ Recibe request
    │
    ├─ Extrae token del header Authorization
    │
    ├─ Decodifica JWT con SECRET_KEY
    │   ├─ ¿Válido?
    │   └─ ¿Expirado?
    │
    ├─ Si válido:
    │   ├─ Extrae user_id y role
    │   ├─ Busca usuario en BD
    │   └─ Ejecuta lógica del endpoint
    │
    └─ Si inválido:
        ├─ Error 401: Unauthorized
        └─ Mensaje: "Token inválido o expirado"
        │
        ▼ HTTP Response
        │
CLIENTE (React)
    │
    ├─ Recibe error 401
    │
    └─ Opción A: Mostrar error
       Opción B: Redirigir a login
       Opción C: Refrescar token (si existe)
```

---

## Modelo de Datos Usuario

```
┌─────────────────────────────────┐
│          UserDB (BD)             │
├─────────────────────────────────┤
│ id: INT (PK)                    │
│ nombre: STRING                  │
│ email: STRING (UNIQUE)          │
│ telefono: STRING                │
│ username: STRING (UNIQUE)       │
│ password: STRING (HASHED)       │  ← bcrypt
│ role: STRING (admin|vendedor)   │
│ activo: BOOLEAN                 │
│ creado_en: DATETIME             │
│ actualizado_en: DATETIME        │
└─────────────────────────────────┘
         │
         ▼ JSON en Frontend
         │
    ┌────────────────────┐
    │ User (Context)     │
    ├────────────────────┤
    │ id                 │
    │ nombre             │
    │ email              │
    │ telefono           │
    │ username           │
    │ role               │
    │ activo             │
    │ creado_en          │
    └────────────────────┘
         │
         ▼ useAuth()
         │
    Disponible en toda la app
```

---

## Sistema de Roles y Permisos

```
USUARIO
  │
  ├─ role: "vendedor"
  │   │
  │   ├─ GET /api/autos ........................... ✅ Permitido
  │   ├─ POST /api/autos .......................... ❌ Rechazado
  │   ├─ PUT /api/autos/{id} ...................... ❌ Rechazado
  │   ├─ DELETE /api/autos/{id} .................. ❌ Rechazado
  │   ├─ GET /api/users ........................... ❌ Rechazado
  │   ├─ DELETE /api/users/{id} .................. ❌ Rechazado
  │   └─ Acceso a SellerPortal ................... ❌ Rechazado
  │
  └─ role: "admin"
      │
      ├─ GET /api/autos ........................... ✅ Permitido
      ├─ POST /api/autos .......................... ✅ Permitido
      ├─ PUT /api/autos/{id} ...................... ✅ Permitido
      ├─ DELETE /api/autos/{id} .................. ✅ Permitido
      ├─ GET /api/users ........................... ✅ Permitido
      ├─ DELETE /api/users/{id} .................. ✅ Permitido
      ├─ POST /api/brands ......................... ✅ Permitido
      ├─ POST /api/colors ......................... ✅ Permitido
      └─ Acceso a SellerPortal ................... ✅ Permitido
```

---

## Capas de Validación

```
NIVEL 1: CLIENTE (React)
┌─────────────────────────────────┐
│ AuthModal.tsx Validaciones:     │
│ - Nombre: 2+ caracteres         │
│ - Email: formato válido         │
│ - Teléfono: 8+ dígitos          │
│ - Username: 3+ caracteres       │
│ - Contraseña: 8+, mayús, número │
│ - Confirmación: match           │
└─────────────────────────────────┘
         │ Si pasa
         ▼
NIVEL 2: API (Backend)
┌─────────────────────────────────┐
│ security.py Validaciones:       │
│ (Las mismas + más)              │
│ - Email validator               │
│ - Uniqueness check              │
│ - Password strength             │
│ - Role check                    │
└─────────────────────────────────┘
         │ Si pasa
         ▼
NIVEL 3: BASE DE DATOS
┌─────────────────────────────────┐
│ SQLite Constraints:             │
│ - UNIQUE username              │
│ - UNIQUE email                 │
│ - NOT NULL campos requeridos    │
│ - Foreign keys si aplican      │
└─────────────────────────────────┘
```

---

## JWT Token Estructura

```
Componentes del JWT:

Header.Payload.Signature

┌──────────────────────────┐
│ HEADER (sin encriptar)   │
├──────────────────────────┤
│ {                        │
│   "alg": "HS256",       │
│   "typ": "JWT"          │
│ }                        │
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ PAYLOAD (sin encriptar)  │
├──────────────────────────┤
│ {                        │
│   "sub": "juanperez",   │
│   "user_id": 5,         │
│   "role": "vendedor",   │
│   "exp": 1707120000     │
│ }                        │
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ SIGNATURE (encriptado)   │
├──────────────────────────┤
│ HMACSHA256(               │
│   header + payload,      │
│   SECRET_KEY             │
│ )                        │
└──────────────────────────┘

Ejemplo real:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJqdWFucGVyZXoiLCJ1c2VyX2lkIjo1LCJyb2xlIjoidmVuZGVkb3IiLCJleHAiOjE3MDcxMjAwMDB9.
bGVUB8VJ3f3p9K2mN4oP8qR5sT6uV7wX8yZ9aB0cD1e
```

---

## Flujo de Hash de Contraseña

```
Usuario ingresa: "Segura123"
       │
       ▼
┌─────────────────┐
│ Frontend hash?  │  ❌ NO
│                 │
│ (Se envía plano│
│  pero por HTTPS)│
└─────────────────┘
       │
       ▼
    Network
       │ HTTPS (encriptado)
       ▼
Backend recibe "Segura123"
       │
       ▼
┌─────────────────────────────────┐
│ passlib.context.hash()          │
│ bcrypt(                         │
│   "Segura123",                  │
│   rounds=12,                    │
│   salt=random                   │
│ )                               │
│                                 │
│ Resultado: (cada vez diferente) │
│ $2b$12$R9h.h...xwVgX6Xd...     │
└─────────────────────────────────┘
       │
       ▼
Guardar en BD: "$2b$12$R9h.h...xwVgX6Xd..."
       │
       ▼
En siguiente login:
Recibe: "Segura123"
Compara con hash usando bcrypt.verify()
     │
     ├─► Coincide? → ✅ Login OK
     └─► No coincide? → ❌ Error
```

---

## Ciclo de Vida del Token

```
Login
  │
  ├─ Generar JWT
  │   ├─ exp = ahora + 24 horas
  │   ├─ sub = username
  │   ├─ user_id = id
  │   └─ role = rol
  │
  ├─ Responder al cliente
  │
  └─ Cliente guarda en localStorage
         │
         ▼
Mientras token válido:
  ├─ Se incluye en cada request
  ├─ Backend valida
  └─ Solicitud ejecutada
         │
         ▼
Cuando token expira:
  ├─ Backend rechaza (401)
  ├─ Cliente detecta error
  ├─ Limpia localStorage
  ├─ Redirige a login
  └─ Usuario debe ingresar credenciales nuevamente
```

---

## Seguridad: Capas

```
CAPA 1: HTTPS (En producción)
└─ Encriptación en tránsito
   └─ Nadie puede ver credenciales en red

CAPA 2: Password Hashing (bcrypt)
└─ Hash irreversible
   └─ Aun si alguien accede a BD, no ve contraseñas

CAPA 3: JWT Signatures
└─ Token no puede ser alterado
   └─ Si se modifica, falla verificación

CAPA 4: Validaciones Servidor
└─ Toda entrada se valida en backend
   └─ No confiar 100% en cliente

CAPA 5: CORS
└─ Solo requests desde URLs autorizadas
   └─ Previene acceso no autorizado

CAPA 6: Rate Limiting (Recomendado)
└─ Limitar intentos de login
   └─ Previene ataques fuerza bruta
```

---

## Checklist de Implementación

```
✅ Modelo de usuario ampliado
✅ Hashing con bcrypt
✅ JWT tokens
✅ Endpoints de autenticación
✅ Validaciones Pydantic
✅ Context de autenticación React
✅ Modal de registro
✅ Modal de login
✅ Menú de usuario
✅ Sistema de roles
✅ Protección de rutas
✅ Guardado de token en localStorage
✅ Config centralizada de colores
✅ Animaciones suaves
✅ Mensajes de error específicos
✅ Documentación completa
✅ Ejemplos de uso
✅ Guía de pruebas
```

---

**Arquitectura versión:** 2.0  
**Última actualización:** Febrero 3, 2026

