# Red Social — TP Programación IV (UTN)

## Alumno

**Matías Ortiz Billordo**

---

## Deploy

| Aplicación | Enlace |
|------------|--------|
| **Frontend** | https://red-social-matias-ortiz.vercel.app |
| **Backend (API)** | https://red-social-matias-ortiz.onrender.com/api |

Rama desplegada: `sprint-1`

---

## Tecnologías utilizadas

### Frontend
- **Angular 21** — SPA, routing, componentes standalone
- **TypeScript** — tipado estático
- **SCSS** — estilos y diseño responsive
- **Reactive Forms** — formularios con validaciones en cliente
- **RxJS** — consumo de API HTTP

### Backend
- **NestJS 11** — API REST modular
- **MongoDB + Mongoose** — persistencia de datos
- **JWT + Passport** — autenticación y autorización
- **class-validator** — validaciones en servidor (DTOs)
- **bcryptjs** — hash de contraseñas
- **Multer + Cloudinary** — subida de imágenes (memoria → stream a Cloudinary)
- **Helmet + Throttler** — seguridad y rate limiting

### Infraestructura
- **MongoDB Atlas** — base de datos en la nube
- **Render** — deploy del backend (NestJS)
- **Vercel** — deploy del frontend (Angular)
- **Cloudinary** — almacenamiento de imágenes

---

## Sprints

### Sprint 1 — Autenticación y base del proyecto

**Frontend**
- Proyecto Angular con routing y diseño minimalista expresivo
- Pantallas: Login, Registro, Publicaciones (placeholder) y Mi Perfil
- Navbar con navegación, guards de autenticación (`authGuard` / `guestGuard`)
- Formularios con validaciones y mensajes de error
- Modales personalizados
- Integración con API de auth (login y registro con imagen de perfil)

**Backend**
- API NestJS con prefijo `/api`
- Módulos: `auth`, `users`, `uploads`, `publicaciones`
- Registro, login y perfil con JWT
- Usuarios en MongoDB con roles (`usuario` / `administrador`)
- Subida de imágenes vía Cloudinary (perfil en registro + endpoint `/api/uploads/upload`)
- Guards globales JWT y decorador `@Public()` en rutas públicas

---

## Estructura del repositorio

```
Tp2-RedSocial/
├── frontend/     # Angular
├── backend/      # NestJS
└── README.md
```
