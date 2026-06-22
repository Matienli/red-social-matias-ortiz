# Backend — Red Social (NestJS)

API REST del trabajo práctico **Red Social** (UTN — Programación IV).

La documentación general del proyecto (alumno, deploy, tecnologías y sprints) está en el [README principal](../README.md).

## Requisitos

- Node.js 18+
- MongoDB (Atlas o local)
- Variables de entorno en `.env` (ver `.env.example` si existe)

## Scripts

```bash
npm install
npm run start:dev    # desarrollo con hot-reload
npm run build        # compilar
npm run start:prod   # producción
```

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/login` | Inicio de sesión |
| `GET` | `/api/auth/perfil` | Perfil del usuario (JWT) |
| `POST` | `/api/uploads/upload` | Subir imagen a Cloudinary (JWT, campo `file`) |

## Módulos

- `auth` — autenticación JWT
- `users` — esquema y servicio de usuarios
- `uploads` — imágenes de perfil
- `publicaciones` — stub (Sprint 2)
