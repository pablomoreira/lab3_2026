# Actividades de Mapeo Objeto-Relacional (Prisma 6)

---

## Actividad 1

### Paso 1: Configuración del Proyecto (Terminal)

```bash
mkdir actividad-orm
cd actividad-orm

npm init -y
npm install typescript ts-node @types/node --save-dev
npm install prisma@6 --save-dev
npm install @prisma/client@6
npx tsc --init
npx prisma init --datasource-provider sqlite
```

---

### Paso 2: Configurar `tsconfig.json`

Reemplazá el contenido generado por este:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "strict": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "outDir": "dist",
    "lib": ["esnext"],
    "types": ["node"]
  }
}
```

---

### Paso 3: Definir el Schema (Modelos)

Abrí `prisma/schema.prisma` y reemplazá todo su contenido:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Usuario {
  id     Int     @id @default(autoincrement())
  nombre String
  email  String  @unique
  perfil Perfil?
  posts  Post[]
}

model Perfil {
  id        Int     @id @default(autoincrement())
  bio       String
  avatar    String
  usuario   Usuario @relation(fields: [usuarioId], references: [id])
  usuarioId Int     @unique
}

model Post {
  id        Int     @id @default(autoincrement())
  titulo    String
  contenido String
  autor     Usuario @relation(fields: [usuarioId], references: [id])
  usuarioId Int
}
```

---

### Paso 4: Crear la Base de Datos

```bash
npx prisma migrate dev --name inicio_actividad_1
```

Esto crea el archivo `dev.db` y genera el cliente con los tipos de TypeScript.

---

### Paso 5: Implementación del Código (`index.ts`)

Creá `index.ts` en la raíz del proyecto:

```ts
// index.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando carga de datos...");

  const usuario1 = await prisma.usuario.create({
    data: {
      nombre: "Ana García",
      email: "ana@dev.com",
      perfil: {
        create: { bio: "Fullstack Developer", avatar: "ana.jpg" }
      },
      posts: {
        create: { titulo: "Mi primer post", contenido: "Aprendiendo Prisma!" }
      }
    }
  })

  const usuario2 = await prisma.usuario.create({
    data: {
      nombre: "Carlos Sánchez",
      email: "carlos@dev.com",
      perfil: {
        create: { bio: "Entusiasta de Bases de Datos", avatar: "carlos.png" }
      },
      posts: {
        create: [
          { titulo: "Post de Carlos 1", contenido: "Contenido A" },
          { titulo: "Post de Carlos 2", contenido: "Contenido B" }
        ]
      }
    }
  })

  console.log("✅ Usuarios creados.");

  const todosLosUsuarios = await prisma.usuario.findMany({
    include: {
      perfil: true,
      posts: true
    }
  })

  console.dir(todosLosUsuarios, { depth: null })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

### Paso 6: Ejecución y Verificación

```bash
npx ts-node index.ts
```

Para ver los datos de forma visual:

```bash
npx prisma studio
```

Se abrirá el navegador en `http://localhost:5555`.

---

---

## Actividad 2

### Paso 1: Inicialización del Proyecto

```bash
mkdir proyecto-recetas
cd proyecto-recetas

npm init -y
npm install typescript ts-node @types/node prisma@6 --save-dev
npm install @prisma/client@6
npx tsc --init
npx prisma init --datasource-provider sqlite
```

---

### Paso 2: Configurar `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "strict": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "outDir": "dist",
    "lib": ["esnext"],
    "types": ["node"]
  }
}
```

---

### Paso 3: Definir el Modelo de Datos

Reemplazá todo el contenido de `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Usuario {
  id      Int      @id @default(autoincrement())
  nombre  String
  email   String   @unique
  recetas Receta[]
}

model Receta {
  id           Int           @id @default(autoincrement())
  nombre       String
  descripcion  String
  autor        Usuario       @relation(fields: [usuarioId], references: [id])
  usuarioId    Int
  ingredientes Ingrediente[]
}

model Ingrediente {
  id      Int      @id @default(autoincrement())
  nombre  String   @unique
  recetas Receta[]
}
```

---

### Paso 4: Crear la Base de Datos

```bash
npx prisma migrate dev --name init_recetas
```

---

### Paso 5: Carga de Datos (`prisma/seed.ts`)

Creá el archivo `prisma/seed.ts`:

```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Cargando datos...");

  await prisma.receta.deleteMany();
  await prisma.ingrediente.deleteMany();
  await prisma.usuario.deleteMany();

  const chef = await prisma.usuario.create({
    data: {
      nombre: "Chef Gusteau",
      email: "gusteau@ratatouille.com",
      recetas: {
        create: [
          {
            nombre: "Ratatouille",
            descripcion: "Un guiso de hortalizas tradicional.",
            ingredientes: {
              connectOrCreate: [
                { where: { nombre: "Berenjena" }, create: { nombre: "Berenjena" } },
                { where: { nombre: "Calabacín" }, create: { nombre: "Calabacín" } },
                { where: { nombre: "Tomate" },    create: { nombre: "Tomate" } }
              ]
            }
          }
        ]
      }
    }
  })

  console.log("Chef creado:", chef.nombre);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

---

### Paso 6: Configurar el Seed en `package.json`

Agregá esta sección al `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

---

### Paso 7: Ejecutar la Carga y Verificar

```bash
npx prisma db seed
npx prisma studio
```

---

### ¿Por qué este diseño es el correcto?

1. **Relación 1:N (Usuario–Receta):** el `usuarioId` vive en `Receta`. La receta "sabe" quién es su dueño; Prisma genera el array `recetas` virtualmente en `Usuario`.

2. **Relación N:M (Receta–Ingrediente):** al poner `[]` en ambos lados, Prisma gestiona la tabla intermedia de forma transparente.

3. **Tipado automático:** al hacer `prisma.receta.findMany({ include: { ingredientes: true } })`, TypeScript sabe que el resultado tiene una propiedad `ingredientes` con `id` y `nombre`.