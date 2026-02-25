# TailorHub Backend

API backend en `Node.js + Express + TypeScript` para la prueba tecnica de TailorHub.

Estado actual:

- Runtime principal en `PostgreSQL + Prisma`.
- Autenticacion JWT con rutas privadas protegidas por middleware.
- Migracion legacy de MongoDB/Mongoose conservada como evidencia tecnica en `tools/migration`.

## Stack

- TypeScript
- Express 5
- Prisma + PostgreSQL
- JWT (`jsonwebtoken`)
- Vitest + Supertest para pruebas

## Requisitos

- Node.js `>= 20.19`
- Una base PostgreSQL accesible

## Configuracion

1. Crea/copia las variables de entorno desde `.env.example`.
2. Para desarrollo local, usa `.env.local` (el backend lo prioriza cuando `NODE_ENV !== production`).

Variables clave:

- `PORT`
- `ORIGIN`
- `TOKEN_SECRET`
- `DATABASE_URL`

Opcionales (si usas firma de subida de imagenes):

- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_FOLDER_NAME`

Variables legacy (solo migracion Mongo -> Postgres):

- `MONGODB_URI`
- `DIRECT_DATABASE_URL` (o `DIRECT_DATABASE`)

## Scripts

- `npm run dev`: ejecuta backend en modo desarrollo.
- `npm run build`: compila TypeScript.
- `npm start`: ejecuta build compilada.
- `npm test`: ejecuta tests.
- `npm run typecheck`: chequeo de tipos.
- `npm run ci`: lint + typecheck + test.
- `npm run migrate:mongo:archive`: ejecuta script de migracion legacy.

## Rutas API

Base path: `/api`

Publicas:

- `POST /signup`
- `POST /login`
- `GET /signuploadform` (Cloudinary)

Privadas (requieren `Authorization: Bearer <token>`):

- Auth:
  - `GET /verify`
  - `POST /logout`
- Restaurantes:
  - `GET /restaurants`
  - `GET /restaurants/:id`
  - `POST /restaurants`
  - `DELETE /restaurants/:id` (solo owner)
- Reviews:
  - `POST /reviews`
  - `PUT /reviews/:id` (solo owner)
  - `DELETE /reviews/:id` (solo owner)
  - `GET /reviews/:id`
- Usuario:
  - `GET /users/:id` (solo propio usuario)
  - `PUT /users/:id` (actualiza favoritos via `action: add/remove`)
  - `PUT /users/addfavorite/:id`
  - `PUT /users/removefavorite/:id`

## Seguridad implementada

- Validacion estricta de `Bearer token`.
- Rechazo de token invalido/revocado/expirado (`401`).
- Control de ownership en operaciones sensibles (`403`).
- `authorId` y `createdById` se derivan del token, no del body cliente.
- Manejo de errores HTTP tipados para evitar `500` en errores de negocio.

## Migracion legacy MongoDB -> PostgreSQL

La migracion historica se conserva en:

- `tools/migration/mongo-to-postgres/README.md`
- `tools/migration/mongo-to-postgres/migrate-mongo-to-postgres.ts`
- `tools/migration/mongo-to-postgres/legacy-models/*`

No forma parte del runtime principal, se mantiene como soporte/documentacion tecnica.
