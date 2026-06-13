# 🧪 GUÍA DE PRUEBA - Sistema de Autenticación

## 📋 CHECKLIST DE PRUEBAS

### ✅ FASE 1: SETUP Y INSTALACIÓN

- [ ] Backend inicia sin errores
  ```bash
  cd backend
  python main.py
  # Verificar: "Uvicorn running on http://127.0.0.1:8000"
  ```

- [ ] Frontend inicia sin errores
  ```bash
  npm run dev
  # Verificar: "Local: http://localhost:5173"
  ```

- [ ] API Docs accesibles
  ```
  http://localhost:8000/docs
  ```

### ✅ FASE 2: REGISTRO DE USUARIOS

#### Test 2.1: Registro exitoso
```
1. Click en "Iniciar sesión"
2. Click en tab "Registrarse"
3. Llenar:
   - Nombre: "Carlos Mendoza"
   - Email: "carlos@example.com"
   - Teléfono: "+56987654321"
   - Usuario: "carlosmendoza"
   - Contraseña: "Segura123"
   - Confirmar: "Segura123"
   - Tipo: "Vendedor"
4. Click "Registrarse"
✅ Debe aparecer: "¡Registrado exitosamente!"
✅ Pestaña debe cambiar automáticamente a login
```

#### Test 2.2: Validación de nombre
```
1. Intentar registrar con nombre: "J"
✅ Error: "El nombre debe tener al menos 2 caracteres"
```

#### Test 2.3: Validación de email
```
1. Intentar registrar con email inválido: "noesunmail"
✅ Error: "Email inválido"

2. Intentar registrar con email duplicado
✅ Error: "El correo ya está registrado"
```

#### Test 2.4: Validación de teléfono
```
1. Intentar registrar con teléfono: "123"
✅ Error: "El teléfono debe tener al menos 8 dígitos"
```

#### Test 2.5: Validación de contraseña
```
1. Intentar con: "corta"
✅ Error: "La contraseña debe tener al menos 8 caracteres"

2. Intentar con: "minuscula123" (sin mayúscula)
✅ Error: "La contraseña debe contener una mayúscula"

3. Intentar con: "MAYUSCULA" (sin número)
✅ Error: "La contraseña debe contener un número"
```

#### Test 2.6: Contraseñas no coinciden
```
1. Contraseña: "Correcta123"
2. Confirmar: "Incorrecta123"
✅ Error: "Las contraseñas no coinciden"
```

### ✅ FASE 3: LOGIN

#### Test 3.1: Login exitoso
```
1. Usar credenciales registradas:
   - Usuario: "carlosmendoza"
   - Contraseña: "Segura123"
2. Click "Iniciar sesión"
✅ Debe mostrar: "¡Sesión iniciada!"
✅ Modal debe cerrarse
✅ Debe aparecer UserMenu con avatar
```

#### Test 3.2: Login admin
```
1. Usuario: "admin"
2. Contraseña: "Admin123"
✅ Debe mostrar: "¡Sesión iniciada!"
✅ UserMenu debe mostrar corona (👑) de admin
```

#### Test 3.3: Credenciales inválidas
```
1. Usuario: "carlosmendoza"
2. Contraseña: "incorrecta"
3. Click "Iniciar sesión"
✅ Error: "Usuario o contraseña incorrectos"
```

#### Test 3.4: Usuario no existe
```
1. Usuario: "nosirve"
2. Contraseña: "Algo123"
✅ Error: "Usuario o contraseña incorrectos"
```

### ✅ FASE 4: MENÚ DE USUARIO

#### Test 4.1: UserMenu visible
```
Después del login:
✅ Debe aparecer avatar con inicial del nombre
✅ Al hacer hover, debe mostrarse nombre completo
```

#### Test 4.2: Dropdown menu
```
1. Click en avatar
✅ Debe aparecer dropdown con:
   - Nombre y email del usuario
   - Rol del usuario
   - Botón "Mi perfil"
   - Botón "Administración" (solo si es admin)
   - Botón "Cerrar sesión"
```

#### Test 4.3: Información correcta
```
Con usuario "carlosmendoza":
✅ Nombre mostrado: "Carlos Mendoza"
✅ Email mostrado: "carlos@example.com"
✅ Rol: "Vendedor" (sin corona)

Con usuario "admin":
✅ Nombre mostrado: "Administrador"
✅ Email mostrado: "admin@lionscars.cl"
✅ Rol: "Administrador" (con corona 👑)
```

### ✅ FASE 5: PERMISOS Y ROLES

#### Test 5.1: Admin puede ver Portal Vendedor
```
1. Login como admin
2. Click botón "Panel Admin"
✅ Debe cargar SellerPortal
✅ Debe ver lista de vehículos
```

#### Test 5.2: Vendedor NO puede ver Portal Vendedor
```
1. Login como carlosmendoza (vendedor)
2. Intenta acceder a /seller (si existe ruta directa)
✅ Debe mostrar: "Acceso denegado"
✅ Botón: "Volver al catálogo"
3. Click en botón
✅ Debe volver al catálogo
```

#### Test 5.3: Botón Admin solo visible para admins
```
1. Login como vendedor
✅ NO debe aparecer botón "Panel Admin"

2. Logout y login como admin
✅ DEBE aparecer botón "Panel Admin"
```

### ✅ FASE 6: LOGOUT

#### Test 6.1: Cerrar sesión
```
1. Click en UserMenu (avatar)
2. Click en "Cerrar sesión"
✅ Debe desaparecer UserMenu
✅ Debe aparecer botón "Iniciar sesión"
✅ URL no debe cambiar pero sesión termina
```

#### Test 6.2: Session persiste al actualizar
```
1. Login como admin
2. Presionar F5 (refresh)
✅ Debe mantenerse la sesión
✅ Debe seguir mostrando UserMenu
✅ Dato: Token en localStorage persiste
```

#### Test 6.3: Session expira sin refresh
```
1. Limpiar localStorage manualmente
2. Intentar usar la app
✅ Debe mostrar botón "Iniciar sesión"
```

### ✅ FASE 7: VALIDACIONES FRONTEND vs BACKEND

#### Test 7.1: Frontend bloquea primero
```
1. Intentar enviar registración con datos inválidos
✅ Validación en cliente previene envío
✅ Mensaje de error aparece antes de request
```

#### Test 7.2: Backend valida también
```
Usando Postman o curl:
1. POST a /api/auth/register con datos inválidos
✅ Backend rechaza aunque validación cliente no corra
```

### ✅ FASE 8: PERSISTENCIA DE DATOS

#### Test 8.1: Usuarios se guardan
```
1. Registrar nuevo usuario
2. Cerrar la app
3. Volver a abrir
4. Login con credenciales del usuario nuevo
✅ Debe funcionar el login
✅ Usuario existe en la BD
```

#### Test 8.2: Token en localStorage
```
1. Login como cualquier usuario
2. Abrir DevTools (F12)
3. Application → localStorage
✅ Debe haber "auth_token" con JWT
✅ Debe haber "auth_user" con JSON del usuario
```

### ✅ FASE 9: DISEÑO Y UX

#### Test 9.1: Colores consistentes
```
✅ Botón de login: Oro (#E8B923)
✅ Modal header: Oro con logo
✅ Errores: Rojo (#EF4444)
✅ Éxitos: Verde (#10B981)
✅ Inputs: Gris con oro en focus
```

#### Test 9.2: Validaciones visuales
```
1. Campo con error
✅ Input tiene borde rojo
✅ Mensaje de error visible
✅ Icono de alerta (✓)

2. Campo válido
✅ Input tiene borde gris
✅ Sin mensaje de error
```

#### Test 9.3: Animaciones suaves
```
✅ Modal de autenticación aparece suave (scale)
✅ UserMenu dropdown abre suave (fade)
✅ Transiciones entre vistas suaves
✅ Sin parpadeos o saltos
```

#### Test 9.4: Responsive design
```
Móvil (320px):
✅ Modal se ajusta
✅ Inputs completos
✅ Texto legible

Tablet (768px):
✅ Todo visible sin scroll horizontal
✅ Espaciado adecuado

Desktop (1920px):
✅ Modal centrado
✅ UserMenu bien posicionado
```

### ✅ FASE 10: SEGURIDAD

#### Test 10.1: Contraseña NO se ve en localStorage
```
1. Login
2. DevTools → Application → localStorage
✅ "auth_token" es token JWT (no contiene contraseña)
✅ "auth_user" no contiene contraseña
```

#### Test 10.2: Token JWT valido
```
Usar jwt.io:
1. Copiar token de localStorage
2. Pegar en jwt.io
✅ Decoded muestra: {sub: username, user_id: número, role: role}
✅ Signature válida
```

#### Test 10.3: Token en header autorización
```
Usando Postman:
1. GET a /api/auth/profile
2. Header: Authorization: Bearer <token>
✅ Funciona y devuelve perfil
3. Sin header
✅ Error 401 Unauthorized
```

### ✅ FASE 11: MENSAJES DE ERROR

#### Test 11.1: Email duplicado
```
1. Registrar usuario con email "test@test.com"
2. Intentar registrar otro con mismo email
✅ Error específico: "El correo ya está registrado"
```

#### Test 11.2: Usuario duplicado
```
1. Registrar usuario con username "pepe"
2. Intentar registrar otro con username "pepe"
✅ Error específico: "El usuario ya existe"
```

#### Test 11.3: Token expirado
```
⚠️ Este test requiere esperar 24 horas o modificar código
- Simular token expirado
✅ Error: "Token inválido o expirado"
✅ Redirigir a login
```

## 📊 TABLA DE RESUMEN

| Test | Esperado | Realidad | ✅/❌ |
|------|----------|----------|------|
| Registro válido | ✅ Éxito | |  |
| Login válido | ✅ Sesión iniciada | |  |
| Logout | ✅ Cerrada sesión | |  |
| Admin accede panel | ✅ Abierto | |  |
| Vendedor accede panel | ❌ Denegado | |  |
| Validaciones | ✅ Funciona | |  |
| Persistencia | ✅ Funciona | |  |
| Colores | ✅ Consistentes | |  |
| Responsive | ✅ Funciona | |  |
| Seguridad | ✅ Protegida | |  |

## 🎯 RESULTADOS FINALES

**Total de tests:** 60+  
**Críticos:** 15  
**Importantes:** 25  
**Opcionales:** 20+

Cuando todo esté ✅, el sistema está **LISTO PARA PRODUCCIÓN** 🚀

