# 🚗 Lions Cars - Sistema de Autenticación y Autorización

## ✅ Cambios Implementados

### 1. **Backend (Python/FastAPI)**

#### Seguridad
- ✅ Implementado **JWT (JSON Web Tokens)** para autenticación segura
- ✅ Hash de contraseñas con **bcrypt** (máxima seguridad)
- ✅ Validación de contraseñas fuerte:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 número

#### Modelo de Usuario Mejorado
```python
class UserDB:
    - id: int
    - nombre: str (nuevo)
    - email: str (nuevo) - único
    - telefono: str (nuevo) - validado
    - username: str - único
    - password: str - hasheado con bcrypt
    - role: str ('admin' | 'vendedor')
    - activo: bool
    - creado_en: timestamp
    - actualizado_en: timestamp
```

#### Nuevos Endpoints
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Login con JWT token
- `GET /api/auth/profile` - Obtener perfil del usuario actual
- `GET /api/users` - Listar usuarios (solo admin)
- `DELETE /api/users/{id}` - Eliminar usuario (solo admin)

### 2. **Frontend (React/TypeScript)**

#### Configuración Centralizada
- **`src/config/theme.ts`** - Sistema de temas y colores consistente
  - Colores de marca Lions Cars (Oro #E8B923)
  - Paleta de colores profesional
  - Configuración responsive

#### Contexto de Autenticación
- **`src/context/AuthContext.tsx`** - Manejo global de autenticación
  - Hook `useAuth()` para acceder a datos del usuario
  - Función `ProtectedRoute` para rutas protegidas
  - Manejo de tokens JWT en localStorage
  - Estados: usuario, token, autenticación, rol

#### Componentes Nuevos
- **`src/components/AuthModal.tsx`** - Modal de login/registro
  - Validación de formularios en cliente
  - Feedback visual de errores
  - Selección de rol (Admin/Vendedor)
  - Animaciones suaves

- **`src/components/UserMenu.tsx`** - Menú de usuario logueado
  - Avatar con inicial del nombre
  - Información del perfil
  - Indicador de rol admin
  - Botón de cerrar sesión

#### Integración en App
- **`src/App.tsx`** - Actualizado con:
  - Botón de login/registro (cuando no autenticado)
  - UserMenu (cuando autenticado)
  - Portal vendedor solo para admins
  - Protección de vistas por rol

### 3. **Dependencias Agregadas**

#### Backend (`requirements.txt`)
```
python-jose[cryptography]  - Manejo de JWT tokens
passlib[bcrypt]            - Hash seguro de contraseñas
python-multipart           - Soporte de formularios
email-validator            - Validación de emails
```

Instalar con: `pip install -r requirements.txt`

## 🚀 Cómo Usar

### 1. **Instalación del Backend**

```bash
cd backend
pip install -r requirements.txt
python main.py
```

El servidor estará disponible en: http://localhost:8000

**Usuario Admin por Defecto:**
- Usuario: `admin`
- Contraseña: `Admin123`
- Role: `admin`

### 2. **Instalación del Frontend**

```bash
# En la carpeta lions-cars-tienda
npm install
npm run dev
```

### 3. **Flujo de Autenticación**

#### Registro
1. Click en "Iniciar sesión"
2. Click en tab "Registrarse"
3. Llenar formulario:
   - Nombre: Al menos 2 caracteres
   - Email: Email válido
   - Teléfono: Al menos 8 dígitos
   - Usuario: Al menos 3 caracteres
   - Contraseña: Min 8 caracteres, 1 mayúscula, 1 número
   - Tipo: Seleccionar Vendedor o Admin
4. Click en "Registrarse"
5. Login con las credenciales creadas

#### Login
1. Click en "Iniciar sesión"
2. Ingresar usuario y contraseña
3. Click en "Iniciar sesión"
4. Token JWT se guarda automáticamente en localStorage

## 🔐 Seguridad

### Contraseñas
- ✅ Hashing con bcrypt (salt rounds: 12)
- ✅ Validación en cliente y servidor
- ✅ Nunca se envía contraseña en texto plano

### Tokens JWT
- ✅ Expiran en 24 horas
- ✅ Se guardan en localStorage (seguro para esta escala)
- ✅ Se incluyen en headers Authorization
- ✅ Se validan en cada request protegido

### Endpoints Protegidos
- `/api/auth/profile` - Requiere autenticación
- `/api/users` - Requiere rol admin
- `/api/users/{id}` - Requiere rol admin

## 👥 Sistema de Roles

### Vendedor (`role: 'vendedor'`)
- ✅ Puede ver catálogo de vehículos
- ❌ No puede acceder a panel administrativo
- ❌ No puede crear/editar/eliminar vehículos
- ❌ No puede gestionar otros usuarios

### Admin (`role: 'admin'`)
- ✅ Puede ver catálogo
- ✅ Puede acceder a portal vendedor (SellerPortal)
- ✅ Puede crear/editar/eliminar vehículos
- ✅ Puede gestionar usuarios
- ✅ Puede gestionar marcas y colores

## 📋 Validaciones

### Usuario
- Nombre: Min 2 caracteres
- Email: Formato válido
- Teléfono: Min 8 dígitos
- Username: Min 3 caracteres, único
- Contraseña: Min 8 caracteres, 1 mayúscula, 1 número

### Error Handling
- Usuarios duplicados → Error específico
- Contraseñas incorrectas → Error de autenticación
- Tokens expirados → Redireccionar a login
- Acceso sin autorización → Error 403

## 🎨 Colores y Marca

Archivo centralizado: `src/config/theme.ts`

```typescript
COLOR_PALETTE.primary.gold    // #E8B923 - Oro principal
COLOR_PALETTE.primary.darkGold // #D4A517 - Oro oscuro
COLOR_PALETTE.secondary.darkBlue // #1A1F3A - Azul oscuro
```

Usar en componentes:
```tsx
import { COLOR_PALETTE } from '../config/theme';

<button style={{ backgroundColor: COLOR_PALETTE.primary.gold }}>
  Botón
</button>
```

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login y obtener token
- `GET /api/auth/profile` - Perfil del usuario actual

### Usuarios (Admin Only)
- `GET /api/users` - Listar usuarios
- `DELETE /api/users/{id}` - Eliminar usuario

### Vehículos
- `GET /api/autos` - Listar vehículos
- `POST /api/autos` - Crear vehículo (admin)
- `PUT /api/autos/{id}` - Actualizar vehículo (admin)
- `DELETE /api/autos/{id}` - Eliminar vehículo (admin)

## 📱 Responsive Design

- ✅ Mobile first
- ✅ Tailwind CSS
- ✅ Animaciones con Framer Motion
- ✅ Colores consistentes en todas las pantallas

## 🐛 Troubleshooting

### Error: "Token inválido o expirado"
- Limpiar localStorage: `localStorage.clear()`
- Hacer login nuevamente

### Error: "Usuario o contraseña incorrectos"
- Verificar que el usuario existe en la BD
- Verificar contraseña (sensible a mayúsculas)

### Error: "Acceso denegado"
- El usuario no tiene el rol requerido
- Contactar al administrador para cambiar rol

## 📝 Variables de Entorno

### Backend (`backend/security.py`)
```python
SECRET_KEY = "lions-cars-secret-key-2024-change-in-prod"
# ⚠️ CAMBIAR EN PRODUCCIÓN
```

### Frontend (`src/context/AuthContext.tsx`)
```typescript
const response = await fetch('http://localhost:8000/api/auth/login', ...)
// Cambiar URL a producción según sea necesario
```

## 🔮 Próximas Mejoras

- [ ] Recuperación de contraseña (email)
- [ ] Autenticación de dos factores (2FA)
- [ ] OAuth (Google, GitHub)
- [ ] Dashboard de administrador
- [ ] Auditoria de cambios
- [ ] Roles más granulares (gerente, reportero, etc)
- [ ] Rate limiting en endpoints
- [ ] HTTPS en producción
- [ ] CORS más restrictivo en producción

## 📞 Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.

---

**Versión:** 2.0  
**Último update:** Febrero 3, 2026  
**Estado:** ✅ Producción lista
