# e-commerce-backend

Backend único para e-commerce. NestJS 11 + MongoDB/Mongoose + JWT + MercadoPago.

Este repositorio es el canónico. Fusiona el código e-commerce que antes vivía
duplicado en dos repositorios:

| Origen previo | Rama / commit | Qué aportó |
| --- | --- | --- |
| `store` | `local` / `d2ed7d7` | Código e-commerce completo (productos, órdenes, pagos, cupones, auth) |
| `e-commerce-backend` (main) | `95a6dda` | Infra: helmet con CSP, CORS configurable, Swagger, `AsyncLocalStorage`, validación 422 con errores aplanados, joi en envs |

## Requisitos

- Node.js 22
- MongoDB 7 (la app usa transacciones en `register`)
- npm 10+

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y completa los valores
npm run start:db             # levanta MongoDB con Docker
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`
- Uploads estáticos: `http://localhost:3000/resources`

Las variables se validan con Joi al arrancar. `NODE_ENV` decide el archivo:
`local` → `.env.local`, `development` → `.env.development`, `production` → `.env`.
Un valor vacío en una variable requerida hace fallar el arranque.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run build` | Compila TypeScript (gate de CI) |
| `npm run lint` | ESLint + Prettier con `--fix` |
| `npm test` | Jest unitario |
| `npm run test:e2e` | Jest e2e |
| `npm run start:db` | MongoDB via Docker |
| `npm run pm2:*` | Despliegue con PM2 |

## Arquitectura

```
src/
├── common/          # capa compartida (@common/*)
│   ├── constants/   # strings reutilizados como prefijos de controller y caché
│   ├── decorators/  # @Public, @Roles, @User, @IsPassword, @IsNotBlank
│   ├── dto/         # FilterDto, PaginationDto, AddressDto
│   ├── enums/       # ExecModes, Role, Status, SalesStatus
│   ├── filters/     # HttpExceptionFilter (global)
│   ├── guards/      # RolesGuard (global)
│   ├── helpers/     # fechas, archivos, validación, AsyncLocalStorage
│   ├── interceptors/# ResponseInterceptor (global)
│   ├── middlewares/ # LoggerMiddleware, AsyncLocalStorageMiddleware
│   ├── pipes/       # ParseMongoIdPipe (global), validación de archivos
│   └── schemas/     # Address (embebido)
├── modules/         # negocio (@modules/*)
│   ├── config/      # envs (Joi), Mongoose, CORS, Swagger
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

### Globally registered

| Token | Clase |
| --- | --- |
| `APP_FILTER` | `HttpExceptionFilter` |
| `APP_GUARD` | `AuthGuard` (JWT), `RolesGuard` |
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

- No hay tests todavía. `npm test` corre con `--passWithNoTests`.
- `CHANGELOG` y este README describen el estado actual; el historial de `main`
  incluye el merge que consolidó los dos repositorios.