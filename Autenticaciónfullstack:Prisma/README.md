# Autenticación fullstack: React + Express + JWT + Prisma + SQLite

## Objetivo

Construir un flujo de autenticación completo con base de datos real:

- Backend con Express que guarda usuarios en SQLite usando Prisma
- Endpoints de registro y login que devuelven un JWT
- Frontend con React que protege rutas privadas

---

## Requisitos previos

- Node.js instalado
- Conocimiento básico de Express y React con TypeScript

---

## Estructura del proyecto

```
proyecto/
  back/
  front/
```

---

## Parte 1: Backend

### 1.1 Crear el proyecto

```bash
mkdir back && cd back
npm init -y
```

### 1.2 Instalar dependencias

```bash
npm install express jsonwebtoken dotenv cors @prisma/client
npm install -D typescript ts-node @types/express @types/jsonwebtoken @types/cors prisma
```

### 1.3 Configurar TypeScript

```bash
npx tsc --init
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  }
}
```

### 1.4 Inicializar Prisma

```bash
npx prisma init --datasource-provider sqlite
```

Esto crea dos cosas:
- `prisma/schema.prisma` — donde se define la base de datos
- `.env` con la variable `DATABASE_URL`

### 1.5 Configurar el `.env`

```
DATABASE_URL="file:./dev.db"
JWT_SECRET=mi_clave_secreta_123
PORT=3001
```

### 1.6 Definir el modelo de usuario

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  password String
}
```

Cada usuario tiene un id autoincremental, un email único y una contraseña.

### 1.7 Crear la base de datos

```bash
npx prisma migrate dev --name init
```

Esto crea el archivo `dev.db` con la tabla `User`.

### 1.8 Estructura de carpetas

```
back/
  prisma/
    schema.prisma
    dev.db
  src/
    lib/
      prisma.ts
    middleware/
      verifyToken.ts
    routes/
      auth.ts
    server.ts
  .env
```

### 1.9 Cliente de Prisma

`src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

Se exporta una sola instancia para reutilizarla en toda la aplicación.

### 1.10 Middleware: verificar el token

`src/middleware/verifyToken.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });

  try {
    jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

### 1.11 Rutas de autenticación

`src/routes/auth.ts`

```typescript
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

  const user = await prisma.user.create({
    data: { email, password },
  });

  res.status(201).json({ id: user.id, email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

export default router;
```

`/register` guarda el usuario en la base de datos. `/login` lo busca y, si existe, devuelve un token.

### 1.12 Servidor principal

`src/server.ts`

```typescript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import { verifyToken } from './middleware/verifyToken';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

app.get('/api/dashboard', verifyToken, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
```

### 1.13 Script en `package.json`

```json
"scripts": {
  "dev": "ts-node src/server.ts"
}
```

### 1.14 Probar el backend

Iniciá el servidor:

```bash
npm run dev
```

Registrar un usuario:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alumno@test.com","password":"1234"}'
```

Hacer login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alumno@test.com","password":"1234"}'
```

Respuesta esperada:

```json
{ "token": "eyJhbGci..." }
```

---

## Parte 2: Frontend

### 2.1 Crear el proyecto

```bash
cd ..
npx create-react-app front --template typescript
cd front
```

### 2.2 Instalar React Router

```bash
npm install react-router-dom
```

### 2.3 Estructura de carpetas

```
front/
  src/
    components/
      PrivateRoute.tsx
    pages/
      Register.tsx
      Login.tsx
      Dashboard.tsx
    App.tsx
```

### 2.4 Componente PrivateRoute

`src/components/PrivateRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
```

### 2.5 Página de registro

`src/pages/Register.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      navigate('/login');
    } else {
      setError(data.error || 'Error al registrarse');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrarse</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Crear cuenta</button>
    </form>
  );
};

export default Register;
```

### 2.6 Página de login

`src/pages/Login.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email);
      navigate('/dashboard');
    } else {
      setError(data.error || 'Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Ingresar</button>
      <p>¿No tenés cuenta? <a href="/register">Registrarse</a></p>
    </form>
  );
};

export default Login;
```

### 2.7 Página de dashboard

`src/pages/Dashboard.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [mensaje, setMensaje] = useState('');
  const email = localStorage.getItem('email');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3001/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setMensaje(data.message));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <div>
      <h1>{mensaje}</h1>
      <p>{email}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Dashboard;
```

### 2.8 Configurar las rutas

`src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
```

### 2.9 Iniciar el frontend

```bash
npm start
```

---

## Flujo completo

1. El usuario accede a `/register` y crea una cuenta → se guarda en SQLite
2. Redirige a `/login` y completa las credenciales
3. Express busca el usuario en la base de datos con Prisma
4. Si existe y la contraseña coincide → firma y devuelve el JWT
5. React guarda el token → redirige a `/dashboard`
6. `PrivateRoute` verifica el token en cada acceso
7. `Dashboard` consulta `/api/dashboard` con el token en el header
8. Al hacer logout se elimina el token y redirige a `/login`

---

## Diferencia clave: React Router vs rutas de Express

| React Router | Express |
|---|---|
| Navega entre componentes | Responde a requests HTTP |
| No hay request al servidor | El browser hace `fetch()` |
| Vive en el navegador | Vive en Node.js |

---

## Verificar los datos con Prisma Studio

Prisma incluye una interfaz visual para explorar la base de datos:

```bash
npx prisma studio
```

Se abre en `http://localhost:5555`. Permite ver, crear y editar registros directamente.

---

## Puntos a reforzar

- ¿Por qué no se debe guardar la contraseña en texto plano?
- ¿Qué pasa si el token vence y el usuario intenta acceder al dashboard?
- ¿Qué ventajas tiene usar Prisma frente a escribir SQL directo?