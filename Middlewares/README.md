# Guía: API REST con Express + TypeScript + Prisma

**Stack:** Express · TypeScript · Prisma 6 (SQLite) · Zod · bcryptjs · JWT

> **Nota sobre Prisma:** usamos **Prisma 6** de forma explícita (pinneado con `@6`) porque la versión 7 introduce cambios que rompen la compatibilidad con el flujo estándar del curso (driver adapters, nuevo archivo de configuración y cambios en los imports).

---

## Setup inicial del proyecto

Antes de empezar, creamos el proyecto y las dependencias.

### 1. Inicializar npm

```bash
npm init -y
```

### 2. Instalar dependencias de producción

```bash
npm install express @prisma/client@6 zod bcryptjs jsonwebtoken
```

### 3. Instalar dependencias de desarrollo

```bash
npm install -D typescript ts-node @types/express @types/node @types/jsonwebtoken @types/bcryptjs prisma@6 nodemon
```

### 4. Inicializar TypeScript

```bash
npx tsc --init
```

### 4.1 Configurar `tsconfig.json`

El archivo generado por defecto trae opciones que causan errores con `ts-node` y CommonJS. Reemplazar **todo** el contenido de `tsconfig.json` por:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node10",
    "ignoreDeprecations": "6.0",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

**Por qué esta configuración:**

- `module: commonjs` + `moduleResolution: node10` → compatible con `ts-node` corriendo directo sobre Node.
- `esModuleInterop: true` → permite escribir `import express from 'express'` en lugar de `import * as express`.
- `ignoreDeprecations: "6.0"` → silencia el aviso de deprecación de `node10` en TS 5.x.
- **No** usamos `verbatimModuleSyntax` (viene activada por defecto y rompe con CommonJS).

### 5. Inicializar Prisma con SQLite

```bash
npx prisma init --datasource-provider sqlite
```

Esto crea la carpeta `prisma/` con `schema.prisma` y un archivo `.env`.

### 5.1 Corregir el `schema.prisma` generado

> ⚠️ **Importante.** A partir de Prisma 6.19, el `init` genera un bloque `generator` con sintaxis nueva que rompe el flujo clásico. Hay que corregirlo **antes** de continuar.

Abrir `prisma/schema.prisma`. Si el bloque `generator` se ve así:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

Reemplazarlo por:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

**Cambios:**

- `"prisma-client"` → `"prisma-client-js"` (nombre del generador estable en Prisma 6).
- Eliminar la línea `output`: sin ella, el cliente se genera en `node_modules/@prisma/client` (la ubicación estándar que busca el `import`).

Sin este cambio, al instanciar `new PrismaClient()` el servidor va a fallar con el error `@prisma/client did not initialize yet`.

### 6. Script de desarrollo

En `package.json`, agregar dentro de `"scripts"`:

```json
"dev": "nodemon --exec ts-node src/index.ts"
```

### 7. Archivo base del servidor

Crear `src/index.ts`:

```ts
import express from 'express';

const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});
```

### 8. Levantar el servidor

```bash
npm run dev
```

---

## Tema 1: Validaciones con Zod + Manejo de Errores

Objetivo: validar los datos que llegan al servidor **antes** de tocar la base.

### Paso 1 — Definir el modelo

En `prisma/schema.prisma`:

```prisma
model Usuario {
  id     Int    @id @default(autoincrement())
  nombre String
  email  String @unique
}
```

Aplicar la migración:

```bash
npx prisma migrate dev --name init
```

Esto hace **tres cosas** en orden:

1. Crea el archivo SQL de la migración en `prisma/migrations/`.
2. Aplica esa migración sobre SQLite (crea la tabla `Usuario`).
3. Ejecuta `prisma generate` automáticamente: genera el cliente TypeScript tipado con los modelos del schema.

> **Importante:** si en algún momento aparece el error `@prisma/client did not initialize yet. Please run "prisma generate"`, es porque el cliente no está generado. Se resuelve con:
>
> ```bash
> npx prisma generate
> ```
>
> Esto pasa típicamente al clonar el repo por primera vez (ver sección de Troubleshooting al final).

### Paso 2 — Crear el middleware de validación

Un middleware es una función que se ejecuta **entre** la request y la respuesta. Acá lo usamos para frenar datos inválidos.

Crear `src/middlewares/validar.middleware.ts`:

```ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const usuarioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Formato de email inválido"),
});

export const validarUsuario = (req: Request, res: Response, next: NextFunction) => {
  const result = usuarioSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errores: result.error.flatten().fieldErrors });
  }
  next();
};
```

`safeParse` no lanza excepción: devuelve `{ success, data | error }`. Si falla, cortamos con `400`. Si pasa, `next()` sigue al endpoint.

### Paso 3 — Usar el middleware en el endpoint

En `src/index.ts`:

```ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validarUsuario } from './middlewares/validar.middleware';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.post('/usuarios', validarUsuario, async (req: Request, res: Response) => {
  try {
    const nuevo = await prisma.usuario.create({ data: req.body });
    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "El email ya existe" });
    }
    res.status(500).json({ error: "Error interno" });
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
```

El código `P2002` de Prisma indica violación de restricción única (el `@unique` del email).

### Paso 4 — Probar en Postman / curl

**Endpoint:** `POST http://localhost:3000/usuarios`
**Headers:** `Content-Type: application/json`

**Prueba 1 — Datos inválidos (esperamos 400):**

```json
{
  "nombre": "An",
  "email": "no-es-email"
}
```

Con `curl`:

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"An","email":"no-es-email"}'
```

Respuesta esperada:

```json
{
  "errores": {
    "nombre": ["El nombre debe tener al menos 3 caracteres"],
    "email": ["Formato de email inválido"]
  }
}
```

**Prueba 2 — Datos válidos (esperamos 201):**

```json
{
  "nombre": "Ana",
  "email": "ana@mail.com"
}
```

Con `curl`:

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@mail.com"}'
```

**Prueba 3 — Email repetido (esperamos 400):**

Enviar el mismo body de la Prueba 2 (o reutilizar el mismo `curl`). Respuesta:

```json
{ "error": "El email ya existe" }
```

---

## Tema 2: Relaciones 1:N (Usuarios y Tareas)

Objetivo: un usuario puede tener muchas tareas. Modelamos la relación en Prisma y la consultamos con `include`.

### Paso 1 — Actualizar el schema

En `prisma/schema.prisma`, modificar el modelo `Usuario` y agregar `Tarea`:

```prisma
model Usuario {
  id     Int     @id @default(autoincrement())
  nombre String
  email  String  @unique
  tareas Tarea[]
}

model Tarea {
  id       Int     @id @default(autoincrement())
  titulo   String
  autorId  Int
  autor    Usuario @relation(fields: [autorId], references: [id])
}
```

`tareas Tarea[]` en `Usuario` es el lado "uno" de la relación. `autor` en `Tarea` es el lado "muchos". `autorId` es la foreign key real en la tabla.

Aplicar la migración:

```bash
npx prisma migrate dev --name agregar-tareas
```

### Paso 2 — Endpoint para crear una tarea

En `src/index.ts`:

```ts
app.post('/tareas', async (req: Request, res: Response) => {
  try {
    const nueva = await prisma.tarea.create({ data: req.body });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: "Error interno" });
  }
});
```

### Paso 3 — Endpoint que trae usuarios con sus tareas

```ts
app.get('/usuarios-tareas', async (req: Request, res: Response) => {
  const data = await prisma.usuario.findMany({
    include: { tareas: true }
  });
  res.json(data);
});
```

`include` le dice a Prisma que traiga los datos relacionados en la misma consulta. Sin `include`, solo vienen los campos propios del usuario.

### Paso 4 — Probar en Postman / curl

**Crear una tarea:** `POST http://localhost:3000/tareas`

```json
{
  "titulo": "Estudiar Prisma",
  "autorId": 1
}
```

Con `curl`:

```bash
curl -X POST http://localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Estudiar Prisma","autorId":1}'
```

Respuesta (201):

```json
{ "id": 1, "titulo": "Estudiar Prisma", "autorId": 1 }
```

**Listar usuarios con tareas:** `GET http://localhost:3000/usuarios-tareas`

Con `curl`:

```bash
curl http://localhost:3000/usuarios-tareas
```

Respuesta (200):

```json
[
  {
    "id": 1,
    "nombre": "Ana",
    "email": "ana@mail.com",
    "tareas": [
      { "id": 1, "titulo": "Estudiar Prisma", "autorId": 1 }
    ]
  }
]
```

---

## Tema 3: Arquitectura (Refactorización)

Objetivo: sacar toda la lógica de `index.ts` y separarla por responsabilidad. Al final, `index.ts` solo arranca el servidor.

### Paso 1 — Crear las carpetas

```bash
mkdir src/controllers src/routes src/lib
```

| Carpeta | Qué contiene |
|---|---|
| `lib/` | Instancias compartidas (Prisma, etc.) |
| `controllers/` | Lógica de cada endpoint |
| `routes/` | Definición de rutas y a qué controller apuntan |
| `middlewares/` | Ya existe, funciones intermedias (validación, auth) |

### Paso 2 — Centralizar Prisma

Crear `src/lib/db.ts`:

```ts
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

Así todo el proyecto importa la misma instancia (no creamos múltiples conexiones).

### Paso 3 — Crear el controller

Crear `src/controllers/user.controller.ts`:

```ts
import { Request, Response } from 'express';
import { prisma } from '../lib/db';

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const nuevo = await prisma.usuario.create({ data: req.body });
    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "El email ya existe" });
    }
    res.status(500).json({ error: "Error interno" });
  }
};

export const listarUsuarios = async (req: Request, res: Response) => {
  const usuarios = await prisma.usuario.findMany({ include: { tareas: true } });
  res.json(usuarios);
};
```

### Paso 4 — Crear las rutas

Crear `src/routes/user.routes.ts`:

```ts
import { Router } from 'express';
import { crearUsuario, listarUsuarios } from '../controllers/user.controller';
import { validarUsuario } from '../middlewares/validar.middleware';

const router = Router();

router.post('/', validarUsuario, crearUsuario);
router.get('/', listarUsuarios);

export default router;
```

### Paso 5 — Limpiar `index.ts`

`src/index.ts` queda así:

```ts
import express from 'express';
import userRoutes from './routes/user.routes';

const app = express();
app.use(express.json());

app.use('/usuarios', userRoutes);

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
```

Todo lo de `/usuarios` vive ahora en su router. `index.ts` solo monta rutas y levanta el server.

### Paso 6 — Probar en Postman / curl

Los endpoints siguen funcionando igual que antes:

- `POST http://localhost:3000/usuarios` → crear usuario
- `GET http://localhost:3000/usuarios` → listar usuarios con tareas

Con `curl`:

```bash
# Crear usuario
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@mail.com"}'

# Listar usuarios
curl http://localhost:3000/usuarios
```

La refactorización no cambia el comportamiento, solo la organización.

---

## Tema 4: Seguridad (Autenticación + JWT)

Objetivo: que un usuario se registre con contraseña hasheada, haga login y reciba un token para acceder a rutas protegidas.

### Paso 1 — Agregar password al modelo

En `prisma/schema.prisma`:

```prisma
model Usuario {
  id       Int     @id @default(autoincrement())
  nombre   String
  email    String  @unique
  password String
  tareas   Tarea[]
}
```

Migrar:

```bash
npx prisma migrate dev --name agregar-password
```

### Paso 2 — Actualizar el schema de Zod

En `src/middlewares/validar.middleware.ts`, agregar `password`:

```ts
export const usuarioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
```

### Paso 3 — Registro con bcrypt

Modificar `crearUsuario` en `src/controllers/user.controller.ts`:

```ts
import bcrypt from 'bcryptjs';

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const nuevo = await prisma.usuario.create({
      data: { ...req.body, password: hashedPassword }
    });
    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "El email ya existe" });
    }
    res.status(500).json({ error: "Error interno" });
  }
};
```

`bcrypt.hash` toma la contraseña en texto plano y la convierte en un hash. El `10` son las "salt rounds" (cuántas veces se aplica el algoritmo). Nunca guardamos contraseñas en texto plano.

### Paso 4 — Endpoint de login

Agregar al controller:

```ts
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    "SECRET_KEY",
    { expiresIn: '1h' }
  );

  res.json({ token });
};
```

`bcrypt.compare` compara la contraseña enviada con el hash guardado. `jwt.sign` genera un token firmado. El mismo mensaje de error para email inexistente y password incorrecta evita filtrar qué emails existen.

### Paso 5 — Middleware de protección

Crear `src/middlewares/auth.middleware.ts`:

```ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protegerRuta = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ error: "No hay token" });

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};
```

El cliente manda el token en el header `Authorization: Bearer <token>`. Lo separamos con `split(' ')[1]`. Si `verify` falla, el token es inválido o expiró.

### Paso 6 — Endpoint para borrar usuario (protegido)

En `src/controllers/user.controller.ts`:

```ts
export const borrarUsuario = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.usuario.delete({ where: { id } });
    res.json({ mensaje: "Usuario borrado" });
  } catch {
    res.status(404).json({ error: "Usuario no encontrado" });
  }
};
```

En `src/routes/user.routes.ts`:

```ts
import { Router } from 'express';
import { crearUsuario, listarUsuarios, login, borrarUsuario } from '../controllers/user.controller';
import { validarUsuario } from '../middlewares/validar.middleware';
import { protegerRuta } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', validarUsuario, crearUsuario);
router.get('/', listarUsuarios);
router.post('/login', login);
router.delete('/:id', protegerRuta, borrarUsuario);

export default router;
```

### Paso 7 — Probar en Postman / curl

**Registro:** `POST http://localhost:3000/usuarios`

```json
{
  "nombre": "Ana",
  "email": "ana@mail.com",
  "password": "secreto123"
}
```

Con `curl`:

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@mail.com","password":"secreto123"}'
```

**Login:** `POST http://localhost:3000/usuarios/login`

```json
{
  "email": "ana@mail.com",
  "password": "secreto123"
}
```

Con `curl`:

```bash
curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@mail.com","password":"secreto123"}'
```

Respuesta:

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..." }
```

**Borrar sin token:** `DELETE http://localhost:3000/usuarios/1` → **403**

```bash
curl -X DELETE http://localhost:3000/usuarios/1
```

**Borrar con token:** mismo endpoint, agregar en Postman `Auth > Bearer Token` y pegar el token recibido → **200**

```bash
curl -X DELETE http://localhost:3000/usuarios/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```

> **Tip:** en Linux/Mac se puede guardar el token en una variable para no copiarlo a mano:
>
> ```bash
> TOKEN=$(curl -s -X POST http://localhost:3000/usuarios/login \
>   -H "Content-Type: application/json" \
>   -d '{"email":"ana@mail.com","password":"secreto123"}' | jq -r .token)
>
> curl -X DELETE http://localhost:3000/usuarios/1 \
>   -H "Authorization: Bearer $TOKEN"
> ```

---

## Actividad Final (Postman / curl)

**Escenario:** un usuario malintencionado intenta borrar cuentas ajenas.

### Paso A — Detectar la vulnerabilidad

1. Quitar temporalmente `protegerRuta` de la ruta `DELETE /:id`.
2. Con Postman, hacer `DELETE http://localhost:3000/usuarios/1`.
3. El usuario se borra sin credenciales. **Esta es la vulnerabilidad.**

Con `curl`:

```bash
curl -X DELETE http://localhost:3000/usuarios/1
```

### Paso B — Bloquear el acceso

1. Volver a agregar `protegerRuta` en la ruta `DELETE`.
2. Reintentar el `DELETE` sin token.
3. Respuesta esperada: `403 - No hay token`.

Con `curl`:

```bash
curl -X DELETE http://localhost:3000/usuarios/1
```

### Paso C — Acceso legítimo

1. `POST /usuarios/login` con credenciales válidas.
2. Copiar el token de la respuesta.
3. En la petición `DELETE`, ir a `Authorization → Bearer Token` y pegar el token.
4. Enviar. Respuesta esperada: `200 - Usuario borrado`.

Con `curl`:

```bash
# 1. Login y obtener el token
curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@mail.com","password":"secreto123"}'

# 2. Copiar el token y usarlo en el DELETE
curl -X DELETE http://localhost:3000/usuarios/1 \
  -H "Authorization: Bearer <PEGAR_TOKEN_ACA>"
```

### Entregable

Documentar los 3 pasos (capturas de Postman con request y response) y responder:

1. ¿Qué status code devuelve cada escenario y por qué?
2. ¿Qué pasaría si alguien modifica manualmente el token antes de enviarlo?
3. ¿Por qué la contraseña se guarda hasheada y no en texto plano?

---

## Troubleshooting (errores comunes)

### Error: `@prisma/client did not initialize yet`

```
Error: @prisma/client did not initialize yet.
Please run "prisma generate" and try to import it again.
```

**Causa más común:** el bloque `generator` en `schema.prisma` quedó con la sintaxis de Prisma 7 (que `npx prisma init` genera por defecto en 6.19+). El cliente se genera en una carpeta distinta a la que espera el `import`.

**Solución:** revisar `prisma/schema.prisma`. El bloque debe ser exactamente:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Sin línea `output`, sin `"prisma-client"` (con guion final). Después:

```bash
rm -rf node_modules/.prisma generated
npx prisma generate
```

**Otras causas posibles:**

- Al clonar el repo desde GitHub (el cliente generado no se versiona): correr `npx prisma generate`.
- Se instanció `new PrismaClient()` antes de haber corrido la primera migración: correr `npx prisma migrate dev --name init`.

### Error: `secretOrPrivateKey must have a value`

Aparece al hacer login con JWT cuando `process.env.JWT_SECRET` es `undefined`.

**Causa:** se está leyendo una variable de entorno antes de cargar `.env`.

**Solución:** asegurar que `import 'dotenv/config'` sea la **primera línea** de `src/index.ts`, antes de cualquier otro import.

### Flujo completo al clonar el repo

Si un alumno clona el proyecto desde GitHub, los pasos son:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

`prisma generate` crea el cliente; `migrate dev` aplica las migraciones existentes a la base local.

---

## Mejoras para profundizar

Esta sección contiene **refactors opcionales** que elevan la calidad del código a estándar profesional. Trabajarlas después de haber completado la guía principal.

Cada mejora es independiente pero se recomienda hacerlas en orden.

### Mejora 1 — Mover `SECRET_KEY` a variable de entorno

**Problema:** en el Tema 4, la clave JWT está hardcodeada:

```ts
const token = jwt.sign({ ... }, "SECRET_KEY", { expiresIn: '1h' });
const decoded = jwt.verify(token, "SECRET_KEY");
```

Esto es un antipatrón grave: si el repositorio se publica, cualquiera puede firmar tokens válidos y hacerse pasar por cualquier usuario. Además, el string está duplicado en dos archivos.

**Solución:** leer la clave desde `.env` usando `process.env`.

**Paso 1 — Instalar `dotenv`**

```bash
npm install dotenv
```

**Paso 2 — Agregar la variable a `.env`**

Editar el `.env` que ya existe (creado por `prisma init`) y agregar:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="mi-secreto-super-seguro-cambiar-en-produccion"
```

> En producción, este valor debe ser una cadena aleatoria larga, por ejemplo generada con `openssl rand -hex 32`.

**Paso 3 — Importar `dotenv/config` como primera línea**

En `src/index.ts`:

```ts
import 'dotenv/config';
import express from 'express';
// ... resto de imports
```

El orden es crítico. Si `dotenv/config` no es lo primero, algunas variables pueden quedar `undefined` al momento de usarlas.

**Paso 4 — Reemplazar los dos `"SECRET_KEY"`**

En el controlador de login:

```ts
const token = jwt.sign(
  { id: usuario.id, email: usuario.email },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);
```

En el middleware de protección:

```ts
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

El `!` es el operador **non-null assertion** de TypeScript: le decimos "confiá, esta variable existe". Sin él, TS se queja porque `process.env.JWT_SECRET` técnicamente puede ser `undefined`.

**Paso 5 — Configurar `.gitignore`**

Crear (o editar) `.gitignore` en la raíz del proyecto:

```
node_modules/
dist/
.env
generated/
```

El archivo `.env` **nunca** se sube al repositorio. Para compartir el proyecto con compañeros, se versiona un `.env.example` con las variables vacías:

```env
DATABASE_URL=""
JWT_SECRET=""
```

**Validación más rigurosa (opcional)**

El `!` funciona, pero en código de producción real conviene validar al inicio del servidor:

```ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definida en .env");
}
```

Así el servidor falla al arrancar (explícito) en vez de explotar en la primera request de login.

**Preguntas para reflexionar:**

1. ¿Qué pasaría si se publica en GitHub el repo del Tema 4 sin aplicar esta mejora?
2. ¿Por qué el `.env.example` se sube al repo pero el `.env` no?
3. ¿Qué diferencia hay entre `process.env.JWT_SECRET!` y validar al inicio con `throw`?

---

### Mejora 2 — Tipar el `Request` autenticado en lugar de `as any`

**Problema:** en el middleware de protección usamos `(req as any).user = decoded`. El `as any` desactiva TypeScript y se propaga a cada controller que lea `req.user`.

**Solución:** extender el tipo `Request` de Express una sola vez.

**Paso 1 — Crear `src/types/express.d.ts`:**

```ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}
```

Esto se llama **declaration merging**: agregamos la propiedad `user` al `Request` de Express de forma global. El archivo `.d.ts` solo declara tipos, no genera código.

**Paso 2 — Verificar `tsconfig.json`:**

La opción `"include": ["src/**/*"]` ya cubre la carpeta `types/`. No hace falta tocar nada.

**Paso 3 — Limpiar el middleware:**

```ts
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  req.user = decoded;   // sin (req as any)
  next();
}
```

**Paso 4 — Usarlo en controllers protegidos:**

```ts
import { JwtPayload } from 'jsonwebtoken';

export const miPerfil = async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).id;
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  res.json(usuario);
};
```

**Versión más estricta (opcional):** definir la forma exacta del payload.

```ts
interface MiPayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: MiPayload;
    }
  }
}
```

Con esto, `req.user?.id` y `req.user?.email` quedan autocompletados sin castear.

**Preguntas para reflexionar:**

1. ¿Qué ventaja real da tipar `req.user` si el código funciona igual con `as any`?
2. ¿Por qué el archivo usa extensión `.d.ts` y no `.ts`?
3. Si un atacante modifica el token, ¿el tipo `MiPayload` lo protege?

---

### Mejora 3 — Capa de `services` en la arquitectura

**Problema:** en el Tema 3, el controller mezcla HTTP (leer `req`, armar `res`) con lógica de negocio (hashear, consultar Prisma). Esto hace que la lógica **no sea reutilizable** (si otro endpoint o un script necesita crear un usuario, hay que copiar el código) y **no sea testeable sin Express**.

**Solución:** agregar una capa intermedia entre controllers y Prisma.

```
routes/       → qué URLs existen
controllers/  → traducir HTTP ↔ datos
services/     → lógica de negocio pura (sin req/res)
prisma        → persistencia
```

**Paso 1 — Crear la carpeta `services`:**

```bash
mkdir src/services
```

**Paso 2 — Mover la lógica al service (`src/services/user.service.ts`):**

```ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db';

export const crearUsuario = async (datos: { nombre: string; email: string; password: string }) => {
  const hashedPassword = await bcrypt.hash(datos.password, 10);
  return prisma.usuario.create({ data: { ...datos, password: hashedPassword } });
};

export const buscarPorEmail = async (email: string) => {
  return prisma.usuario.findUnique({ where: { email } });
};

export const autenticar = async (email: string, password: string) => {
  const usuario = await buscarPorEmail(email);
  if (!usuario) return null;

  const valida = await bcrypt.compare(password, usuario.password);
  if (!valida) return null;

  return jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};
```

El service **no conoce `req` ni `res`**. Recibe datos, trabaja con Prisma, devuelve resultados.

**Paso 3 — Adelgazar el controller (`src/controllers/user.controller.ts`):**

```ts
import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const nuevo = await userService.crearUsuario(req.body);
    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "El email ya existe" });
    }
    res.status(500).json({ error: "Error interno" });
  }
};

export const login = async (req: Request, res: Response) => {
  const token = await userService.autenticar(req.body.email, req.body.password);
  if (!token) return res.status(401).json({ error: "Credenciales inválidas" });
  res.json({ token });
};
```

El controller quedó fino: lee request, llama al service, arma response.

**La regla práctica:**

| Archivo | Nunca debe... |
|---|---|
| `controller` | hashear, consultar Prisma directo, aplicar reglas de negocio |
| `service` | usar `req`, `res`, `status()`, o conocer Express |

**Preguntas para reflexionar:**

1. ¿Qué pasa si el service tira un error tipo `P2002`? ¿Quién lo maneja?
2. ¿Podría un service llamar a otro service? Dar un ejemplo.
3. ¿Por qué el service devuelve el token (o `null`) en vez de devolver directamente una respuesta HTTP?

---

## Respuestas a las preguntas

> Para consultar **después** de haber pensado las respuestas por cuenta propia.

### Mejora 1 — SECRET_KEY a variable de entorno

**1. ¿Qué pasaría si se publica en GitHub el repo del Tema 4 sin aplicar esta mejora?**

El string `"SECRET_KEY"` queda visible en el código. Cualquiera puede clonar el repo, ver la clave, y firmar tokens JWT válidos para cualquier usuario. El atacante no necesita contraseñas: genera un token con `id: 1` y ya es el admin. Es una de las fugas de seguridad más comunes en proyectos estudiantiles subidos a GitHub.

**2. ¿Por qué el `.env.example` se sube al repo pero el `.env` no?**

El `.env.example` **documenta** qué variables necesita el proyecto (los nombres), pero sin valores reales. Así un compañero que clona el repo sabe que tiene que crear su propio `.env` con `JWT_SECRET`, `DATABASE_URL`, etc. El `.env` real contiene los secretos específicos de cada entorno (dev, prod) y no debe compartirse nunca.

**3. ¿Qué diferencia hay entre `process.env.JWT_SECRET!` y validar al inicio con `throw`?**

Con `!` el error aparece **cuando alguien intenta loguearse**: el servidor arranca bien y el fallo es tardío y confuso (`secretOrPrivateKey must have a value`). Con validación al inicio (`if (!JWT_SECRET) throw`), el servidor **no arranca** si falta la variable. Esto se llama *fail fast*: mejor un error claro al arrancar que un error oscuro en producción con usuarios reales intentando loguearse.

---

### Mejora 2 — Tipar Request en lugar de `as any`

**1. ¿Qué ventaja real da tipar `req.user` si el código funciona igual con `as any`?**

Tres ventajas concretas:

- **Autocompletado:** el editor sugiere `req.user?.id` y `req.user?.email` sin tener que recordar la forma del payload.
- **Detección temprana de errores:** si mañana cambiamos el payload de `{ id, email }` a `{ userId, correo }`, TypeScript marca **todos** los controllers que usan los nombres viejos. Con `as any`, el error aparece en runtime cuando un usuario hace la petición.
- **Refactors seguros:** renombrar una propiedad se vuelve trivial porque TS encuentra todos los usos.

El código "funciona igual" hoy, pero el proyecto se degrada con el tiempo. Tipar es inversión.

**2. ¿Por qué el archivo usa extensión `.d.ts` y no `.ts`?**

`.d.ts` significa *declaration file*: contiene **solo tipos**, sin código ejecutable. TypeScript lo usa para saber qué tipos existen, pero no genera JavaScript a partir de él (no aparece nada en `dist/`). Es el lugar correcto para extender tipos de librerías externas o agregar tipos globales. Si lo guardáramos como `.ts`, TS intentaría compilarlo y podría generar un `.js` vacío innecesario.

**3. Si un atacante modifica el token, ¿el tipo `MiPayload` lo protege?**

**No.** Los tipos de TypeScript existen solo en tiempo de compilación; desaparecen al generar JavaScript. La protección contra tokens falsificados viene de `jwt.verify(token, JWT_SECRET)`: si el atacante modifica el payload sin conocer la clave, la firma no coincide y `verify` tira un error. El tipo `MiPayload` es una **conveniencia para el desarrollador** (autocompletado, menos bugs), no un mecanismo de seguridad. Seguridad = criptografía (JWT) + secreto bien guardado (`.env`).

---

### Mejora 3 — Capa de services

**1. ¿Qué pasa si el service tira un error tipo `P2002`? ¿Quién lo maneja?**

Lo maneja el **controller**. Prisma lanza la excepción, el service no la atrapa (deja que suba), y el controller la captura en su `try/catch` para traducirla a un `res.status(400).json(...)`. Esta división es clave: el service habla el idioma de la lógica de negocio (excepciones, resultados), el controller habla el idioma de HTTP (códigos de estado, JSON). Si el service atrapara el error y devolviera un `400`, estaría conociendo HTTP y perdería su propósito.

**2. ¿Podría un service llamar a otro service? Dar un ejemplo.**

Sí, es común y deseable. Ejemplo: un `tarea.service.ts` con una función `crearTareaParaUsuario(email, titulo)` puede internamente llamar a `userService.buscarPorEmail(email)` para obtener el usuario antes de crear la tarea. Otro ejemplo: un `emailService.enviarBienvenida(usuario)` llamado desde `userService.crearUsuario` después de persistir. La regla sigue siendo la misma: ningún service conoce `req`/`res`, solo datos y otros services.

**3. ¿Por qué el service devuelve el token (o `null`) en vez de devolver directamente una respuesta HTTP?**

Porque si devolviera un `res.status(401).json(...)`, el service quedaría **acoplado** a Express. No podrías usarlo desde:

- un script de CLI que autentica un usuario para hacer una tarea administrativa,
- un test unitario que prueba la lógica sin levantar el servidor,
- un WebSocket o cualquier otro canal que no sea HTTP.

Al devolver `string | null`, el service expresa su resultado en términos de **dominio** ("hay token" o "no lo hay"), y cada consumidor (el controller HTTP, un test, un script) decide cómo traducir eso a su contexto.

---
