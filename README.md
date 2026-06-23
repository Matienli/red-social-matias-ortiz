# Red Social — TP Programación IV (UTN)

## Alumno

**Matias Ortiz Billordo**

---

## Deploy

| Aplicación | Enlace |
|------------|--------|
| **Frontend** | https://red-social-matias-ortiz.vercel.app |
| **Backend (API)** | https://red-social-matias-ortiz.onrender.com/api |

Rama de desarrollo actual: `sprint-2`

---

## Tecnologías utilizadas

### Frontend
- **Angular 21** — SPA, routing, componentes standalone
- **TypeScript** — tipado estático
- **SCSS** — estilos y diseño responsive
- **Reactive Forms** — formularios con validaciones en cliente
- **RxJS** — consumo de API HTTP
- **Interceptores HTTP** — token JWT y cierre de sesión al expirar

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

**Backend — Módulo `publicaciones`**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/publicaciones` | Lista publicaciones activas. Query: `offset`, `limit`, `orden` (`fecha` \| `me-gusta`), `usuarioId` (filtro opcional). Requiere JWT. |
| `POST` | `/api/publicaciones` | Crea publicación (`titulo`, `descripcion`, imagen opcional multipart o `imagenUrl`). Requiere JWT. |
| `DELETE` | `/api/publicaciones/:id` | Baja lógica. Solo el autor o un administrador. Requiere JWT. |
| `POST` | `/api/publicaciones/:id/me-gusta` | Da me gusta (un solo like por usuario por publicación). Requiere JWT. |
| `DELETE` | `/api/publicaciones/:id/me-gusta` | Quita el me gusta si el usuario ya lo había dado. Requiere JWT. |
| `GET` | `/api/publicaciones/:id/comentarios` | Lista comentarios de una publicación. Requiere JWT. |
| `POST` | `/api/publicaciones/:id/comentarios` | Crea comentario (`mensaje`). Requiere JWT. |

**Backend — Perfil extendido**
- `GET /api/auth/perfil` incluye `ultimasPublicaciones` (hasta 3 publicaciones activas del usuario con comentarios)

**Modelo de datos (colecciones MongoDB)**
- `usuarios` — datos de cuenta, rol, imagen de perfil
- `publicaciones` — título, descripción, imagen, autor, me gusta, baja lógica (`activa`)
- `comentarios` — mensaje, autor, publicación asociada

---

## API — Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registro de usuario (multipart, imagen de perfil opcional). Público. |
| `POST` | `/api/auth/registro` | Alias de registro. Público. |
| `POST` | `/api/auth/login` | Login con correo o nombre de usuario. Público. |
| `GET` | `/api/auth/perfil` | Perfil del usuario autenticado. Requiere JWT. |

---

## Estructura del repositorio

```
Tp2-RedSocial/
├── frontend/
│   └── src/app/
│       ├── components/   # publicacion-card, etc.
│       ├── pages/        # login, registro, publicaciones, mi-perfil
│       ├── services/     # auth, publicaciones, uploads
│       └── models/
├── backend/
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── uploads/
│       └── publicaciones/
└── README.md
```
