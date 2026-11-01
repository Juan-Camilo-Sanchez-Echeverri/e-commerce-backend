# e-commerce-backend

Backend único para e-commerce. NestJS 11 + MongoDB/Mongoose + JWT + MercadoPago.

Este repositorio es el canónico. Fusiona el código e-commerce que antes vivía
duplicado en dos repositorios:

| Origen previo | Rama / commit | Qué aportó |
| --- | --- | --- |
| `store` | `local` / `d2ed7d7` | Código e-commerce completo (productos, órdenes, pagos, cupones, auth) |
| `e-commerce-backend` (main) | `95a6dda` | Infra: helmet con CSP, CORS configurable, Swagger, `AsyncLocalStorage`, validación 422 con errores aplanados, joi en envs |
| `sexy-latina-backend` | `main` | Infra compartida: `EntityRepository`, `BaseSchema`, Health, Cache Redis, Throttler, filtro de errores uniforme |

## Requisitos

- Node.js 22+ (la imagen Docker usa 24)
- MongoDB 7 (la app usa transacciones en `register`)
- Redis 7 (caché y reporte de salud)
- pnpm 11+

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # y completa los valores
pnpm run docker:infra         # MongoDB (replica set) + Redis
pnpm run start:dev            # la app corre en el host
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`
- Uploads estáticos: `http://localhost:3000/resources`
- Health: `http://localhost:3000/api/v1/health` (público)

Las variables se validan con Joi al arrancar. `NODE_ENV` decide el archivo:
`local` → `.env.local`, `development` → `.env.development`, `production` → `.env`.
Un valor vacío en una variable requerida hace fallar el arranque.

## Scripts

| Script | Descripción |
| --- | --- |
| `pnpm run build` | Compila TypeScript |
| `pnpm run lint` | ESLint + Prettier con `--fix` |
| `pnpm test` | Jest unitario |
| `pnpm run test:e2e` | Jest e2e |
| `pnpm run docker:infra` | MongoDB + Redis; la app corre en el host |
| `pnpm run docker:dev` | Stack de desarrollo completo, con la API |
| `pnpm run docker:prod` | Stack completo de producción (`.env`) |
| `pnpm run pm2:*` | Despliegue con PM2 |

## Docker

Todo vive en `docker/`:

| Archivo | Uso |
| --- | --- |
| `dockerfile` | Única imagen, multi-stage (deps → build → prod) |
| `docker-compose.yml` | Producción: app + MongoDB (`rs0`) + Redis + redis-commander |
| `docker-compose.dev.yml` | Desarrollo y ambiente de prueba: infra + app (perfil `app`) |

El compose de desarrollo sirve a dos flujos con el mismo archivo:

```bash
# 1) Solo infraestructura; la app corre en el host con `pnpm start:dev`
pnpm run docker:infra

# 2) Ambiente de prueba: la API tambien se contenedoriza
pnpm run docker:dev
```

El servicio `backend` está detrás del perfil `app`, así que `docker:infra` no lo
levanta y `docker:dev` sí.

En ambos casos el miembro del replica set se anuncia como
`mongodb-primary:27017`, que resuelve dentro de la red de Compose. Para correr la
app en el host, el `.env.local` usa `directConnection=true` sobre
`127.0.0.1:27017`: el driver no intenta descubrir la topología y las
transacciones siguen funcionando.

La configuración del contenedor llega **solo** por `env_file`, sin bloque
`environment`. En producción el `.env` debe apuntar a los nombres de servicio:

```dotenv
DATABASE_URL='mongodb://mongodb-primary:27017/name-db?replicaSet=rs0'
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secret
```

`replicaSet=rs0` es obligatorio en el contenedor: la app usa transacciones en
`register`.

`redis-commander` sí declara `environment:` porque es una imagen de terceros
cuyas variables (`REDIS_HOSTS`, `HTTP_USER`) no se pueden interpolar desde
`env_file`.

Detalles de la imagen:

- Se copia `pnpm-workspace.yaml` en el build. Sin él, pnpm 11 ignora
  `allowBuilds` y bloquea los scripts de instalación de `bcrypt`/`sharp`, así
  que la imagen arranca sin esas dependencias nativas.
- Se instala `python3 make g++ libc6-compat` porque `bcrypt` (node-gyp) y
  `sharp` (musl) compilan en `alpine`.
- El healthcheck del contenedor consulta `/api/v1/health` y exige `200`.

## Arquitectura

```
src/
├── common/          # capa compartida (@common/*)
│   ├── adapters/    # BcryptAdapter (hash/compare)
│   ├── constants/   # strings reutilizados como prefijos de controller y caché
│   ├── database/    # BaseSchema, EntityRepository, paginateQuery, toEntity
│   ├── decorators/  # @Public, @Roles, @User, @IsPassword, @IsNotBlank
│   ├── dto/         # FilterDto, PaginationDto, AddressDto
│   ├── enums/       # ExecModes, Role, Status, SalesStatus
│   ├── filters/     # HttpExceptionFilter (global)
│   ├── guards/      # RolesGuard (global)
│   ├── health/      # HealthController + HealthService (Mongo/Redis/uptime)
│   ├── helpers/     # fechas, archivos, validación, AsyncLocalStorage
│   ├── interceptors/# ResponseInterceptor (global)
│   ├── middlewares/ # LoggerMiddleware, AsyncLocalStorageMiddleware
│   ├── pipes/       # ParseMongoIdPipe (global), validación de archivos
│   └── schemas/     # Address (embebido)
├── modules/         # negocio (@modules/*)
│   ├── cache/       # CacheService sobre Redis (Keyv)
│   ├── config/      # envs (Joi), Mongoose, CORS, Swagger, RedisCacheConfig
│   ├── auth/        # login, activation, recuperación de contraseña
│   ├── register/    # alta de usuarios (transaccional)
│   ├── users/       # usuarios internos (ADMIN/SUPERVISOR)
│   ├── store-customers/  # clientes de la tienda (CUSTOMER)
│   ├── products/    # productos, variantes, stock por talla
│   ├── categories/ subcategories/ offers/
│   ├── orders/      # órdenes, cupones, descuentos
│   ├── coupons/
│   ├── payments/    # MercadoPago + webhook
│   ├── favorites/ encoder/
│   ├── notifications/  # emails (nodemailer) vía eventos
│   ├── email-marketing/ email-request/
│   ├── log/         # Winston + Slack
│   └── cities/ states/
├── app.module.ts
└── main.ts
```

### Acceso a datos

Cada módulo de negocio expone un `repositories/<nombre>.repository.ts` que
extiende `EntityRepository<T>` y encapsula el acceso a Mongoose. Los servicios
nunca inyectan `Model` directamente. Todas las lecturas usan
`readPreference: secondaryPreferred`, por lo que la app requiere un Replica Set.

```ts
@Injectable()
export class StatesRepository extends EntityRepository<State> {
  constructor(@InjectModel(State.name) model: Model<State>) {
    super(model);
  }
}
```

Métodos disponibles: `findOne`, `findOneById`, `find`, `findPaginate`, `create`,
`findOneAndUpdate`, `findByIdAndUpdate`, `updateOne`, `updateMany`,
`findOneAndDelete`, `findByIdAndDelete`, `deleteMany`, `aggregate` y `count`.

Los DTOs de creación validan las referencias como `string` (`@IsMongoId()`)
mientras que los esquemas las tipan como `ObjectId`; para esos casos
`toEntity<T>(dto)` deja explícita la conversión en el borde DTO → entidad.

### Caché y health

`CacheService` expone `set`/`get`/`delete`/`clear`/`deleteByPrefix` sobre Redis
(Keyv). El TTL se expresa en **minutos**. `GET /health` es público y reporta
`uptime`, timestamp y el estado y latencia de MongoDB y Redis; devuelve `503`
con `code: health-degraded` si alguna dependencia no responde.

### Globally registered

| Token | Clase |
| --- | --- |
| `APP_FILTER` | `HttpExceptionFilter` |
| `APP_GUARD` | `ThrottlerGuard` (50 req/60s), `AuthGuard` (JWT), `RolesGuard` |
| `APP_INTERCEPTOR` | `ResponseInterceptor` |
| `APP_PIPE` | `ParseMongoIdPipe` |

Todas las rutas requieren JWT salvo las marcadas con `@Public()`.

### Shape de respuestas

Éxito (envuelto por `ResponseInterceptor`):

```json
{ "success": true, "message": "...", "data": {} }
```

Error (envuelto por `HttpExceptionFilter`):

```json
{ "success": false, "message": "...", "data": null, "errors": [] }
```

`errors` solo aparece en errores de validación (422) y lista
`{ property, errors }` por campo, incluyendo campos anidados.

### Path aliases

`@common/*` → `src/common/*` y `@modules/*` → `src/modules/*`, declarados en
`tsconfig.json` y replicados en el `moduleNameMapper` de Jest. No hay alias
para config: vive en `@modules/config`.

## Notas

- No hay tests todavía. `pnpm test` corre con `--passWithNoTests`.
- `CHANGELOG` y este README describen el estado actual; el historial de `main`
  incluye el merge que consolidó los dos repositorios.