# Migracion de MongoDB a PostgreSQL (Legacy)

Esta carpeta contiene la utilidad puntual que se uso para migrar datos del
esquema legacy de MongoDB/Mongoose al esquema actual de PostgreSQL/Prisma.

## Archivos

- `migrate-mongo-to-postgres.ts`: script principal de migracion.
- `legacy-models/*`: modelos Mongoose congelados, usados solo por este script.

## Variables de entorno requeridas

- `MONGODB_URI`: cadena de conexion al origen MongoDB.
- `DIRECT_DATABASE_URL` (o `DIRECT_DATABASE` / `DATABASE_URL`): cadena de conexion al destino PostgreSQL.

## Ejecucion

Desde la raiz del repositorio:

```bash
npm run migrate:mongo:archive
```

## Notas

- El script es idempotente del lado destino porque primero limpia los datos en Prisma.
- Se conserva fuera de `src/` porque es historico/accesorio y no forma parte del runtime del backend.
