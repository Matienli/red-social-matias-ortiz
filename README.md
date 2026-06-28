# Red Social — TP Programación IV (UTN)

## Alumno

**Matias Ortiz Billordo**

---

## Deploy

| Aplicación | Enlace |
|------------|--------|
| **Frontend** | https://red-social-matias-ortiz.vercel.app |
| **Backend (API)** | https://red-social-matias-ortiz.onrender.com/api |

Rama de desarrollo actual: `sprint-2` (incluye funcionalidades del Sprint 3)

---

## Tecnologías utilizadas

### Frontend
- **Angular 21** — SPA, routing, componentes standalone, signals
- **TypeScript** — tipado estático
- **SCSS** — estilos y diseño responsive
- **Reactive Forms** — formularios con validaciones en cliente
- **RxJS** — consumo de API HTTP
- **Interceptores HTTP** — token JWT y cierre de sesión ante 401

### Backend
- **NestJS 11** — API REST modular
- **MongoDB + Mongoose** — persistencia de datos
- **JWT + Passport** — autenticación y autorización
- **class-validator** — validaciones en servidor (DTOs)
- **bcryptjs** — hash de contraseñas
- **Multer + Cloudinary** — subida de imágenes (memoria → stream a Cloudinary)
- **Helmet + Throttler** — seguridad y rate limiting

### Infraestructura
- **MongoDB Atlas** — base de datos en la nube (`red-social`)
- **Render** — deploy del backend (NestJS)
- **Vercel** — deploy del frontend (Angular)
- **Cloudinary** — almacenamiento de imágenes

---

## Sprints

### Sprint 1 — Autenticación y base del proyecto

**Frontend**
- Proyecto Angular con routing y diseño minimalista expresivo
- Pantallas: Login, Registro, Publicaciones y Mi Perfil
- Navbar con navegación, guards de autenticación (`authGuard` / `guestGuard`)
- Formularios con validaciones y mensajes de error
- Modales personalizados
- Integración con API de auth (login y registro con imagen de perfil)
- Auto-logout al expirar el JWT

**Backend**
- API NestJS con prefijo `/api`
- Módulos: `auth`, `users`, `uploads`, `publicaciones`
- Registro, login y perfil con JWT
- Usuarios en MongoDB con roles (`usuario` / `administrador`)
- Subida de imágenes vía Cloudinary (perfil en registro + endpoint `/api/uploads/upload`)
- Guards globales JWT y decorador `@Public()` en rutas públicas

---

### Sprint 2 — Publicaciones, me gusta y comentarios

**Frontend**
- Listado de publicaciones con paginación, orden por fecha o cantidad de me gusta
- Formulario para crear publicaciones (título, descripción, imagen opcional)
- Me gusta: dar y quitar like por publicación
- Baja de publicaciones propias (administradores pueden eliminar cualquiera)
- Componente reutilizable `publicacion-card`
- Mi Perfil: datos del usuario + últimas 3 publicaciones con sus comentarios

**Backend — Publicaciones**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/publicaciones` | Lista publicaciones activas. Query: `offset`, `limit`, `orden` (`fecha` \| `me-gusta`), `usuarioId` (opcional). Requiere JWT. |
| `GET` | `/api/publicaciones/:id` | Detalle de una publicación. Requiere JWT. |
| `POST` | `/api/publicaciones` | Crea publicación (`titulo`, `descripcion`, imagen opcional multipart). Requiere JWT. |
| `DELETE` | `/api/publicaciones/:id` | Baja lógica. Solo el autor o un administrador. Requiere JWT. |
| `POST` | `/api/publicaciones/:id/me-gusta` | Da me gusta (un solo like por usuario por publicación). Requiere JWT. |
| `DELETE` | `/api/publicaciones/:id/me-gusta` | Quita el me gusta. Requiere JWT. |

**Backend — Comentarios** (`ComentariosController`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/publicaciones/:publicacionId/comentarios` | Lista comentarios paginados (`offset`, `limit`). Orden: más recientes primero. Requiere JWT. |
| `POST` | `/api/publicaciones/:publicacionId/comentarios` | Crea comentario (`mensaje`). Requiere JWT. |
| `PUT` | `/api/comentarios/:id` | Edita comentario propio (`mensaje`). Marca `modificado: true`. Requiere JWT. |

**Backend — Perfil extendido**
- `GET /api/auth/perfil` incluye `ultimasPublicaciones` (hasta 3 publicaciones activas del usuario con comentarios)

**Modelo de datos (colecciones MongoDB)**
- `usuarios` — datos de cuenta, rol, imagen de perfil
- `publicaciones` — título, descripción, imagen, autor, me gusta, baja lógica (`activa`)
- `comentarios` — mensaje, autor, publicación asociada, flag `modificado`

---

### Sprint 3 — Detalle, sesión, comentarios avanzados

**Frontend — Pantalla de carga y sesión**
- Ruta inicial `/cargando` con spinner y texto “Cargando...”
- Al iniciar la app valida el token almacenado con `POST /api/auth/autorizar`
  - Token válido → redirige a `/publicaciones`
  - Sin token o inválido → redirige a `/login`
- Token JWT guardado en `localStorage` (`red_social_auth`) al login/registro
- Aviso de sesión: modal cuando faltan **5 minutos** para que venza el JWT (15 min)
  - “¿Deseás extender tu sesión?” → `POST /api/auth/refrescar` renueva el token
  - Si no se extiende o expira → logout automático y redirección a login
- Interceptor HTTP: adjunta `Authorization: Bearer` y ante **401** cierra sesión

**Frontend — Detalle de publicación** (`/publicaciones/:id`)
- Vista de publicación completa con imagen expandible (lightbox a pantalla completa)
- Hilo de comentarios estilo **chat**: mensajes en el centro, input fijo abajo
- Carga inicial de **3 comentarios** más recientes; botón **“Cargar más”** trae el resto de una vez
- Crear comentarios desde el detalle
- Editar comentarios propios (inline, con indicador “editado”)

**Frontend — Comentarios híbridos en el feed**
- Botón comentario en cada publicación **expande inline** debajo de la card
- Muestra los **3 comentarios más recientes** + mini formulario para comentar
- Enlace “Ver conversación completa” / “Ver todos los comentarios” → detalle con ancla `#comentarios`

**Backend — Auth extendido**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/autorizar` | Valida JWT y devuelve datos del usuario. Requiere JWT. |
| `POST` | `/api/auth/refrescar` | Emite un nuevo JWT (alias: `/api/auth/refresh`). Requiere JWT vigente. |

**JWT**
- Payload: `sub`, `correo`, `nombreUsuario`, `perfil`
- Expiración configurable (`JWT_EXPIRES_IN`, por defecto **15 min**)

---

---

## Estructura del repositorio

```
Tp2-RedSocial/
├── frontend/
│   └── src/app/
│       ├── components/       # publicacion-card, etc.
│       ├── pages/            # cargando, login, registro, publicaciones,
│       │                     # publicacion-detalle, mi-perfil
│       ├── services/         # auth, publicaciones, modal, image-viewer
│       ├── interceptors/     # auth.interceptor
│       ├── guards/
│       └── shared/           # navbar, modal, image-viewer
├── backend/
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── uploads/
│       └── publicaciones/    # publicaciones + comentarios (controller/service)
└── README.md
```
