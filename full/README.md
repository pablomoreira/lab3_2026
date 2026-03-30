# Autenticación fullstack: React + Express + JWT

## Objetivo

Construir un flujo de autenticación completo:

- Un backend con Express que recibe credenciales y devuelve un token JWT
- Un frontend con React que muestra un formulario de login y protege rutas privadas

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

Vamos a trabajar los dos por separado.

---

## Parte 1: Backend

### 1.1 Crear el proyecto

```bash
mkdir back && cd back
npm init -y
```

### 1.2 Instalar dependencias

```bash
npm install express jsonwebtoken dotenv cors
npm install -D typescript ts-node @types/express @types/jsonwebtoken @types/cors
```

### 1.3 Configurar TypeScript

```bash
npx tsc --init
```

En `tsconfig.json`, verificá que esté habilitado:

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

### 1.4 Crear el archivo `.env`

En la raíz de `back/`:

```
JWT_SECRET=mi_clave_secreta_123
PORT=3001
```

> Este archivo no se sube a Git. Agregalo a `.gitignore`.

### 1.5 Estructura de carpetas

```
back/
  src/
    middleware/
      verifyToken.ts
    routes/
      auth.ts
    server.ts
  .env
```

### 1.6 Middleware: verificar el token

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

Este middleware se ejecuta antes del handler de cada ruta protegida. Si el token no existe o es inválido, corta la request con un error 401.

### 1.7 Ruta de login

`src/routes/auth.ts`

```typescript
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@test.com' && password === '1234') {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ error: 'Credenciales inválidas' });
});

export default router;
```

Por ahora las credenciales son fijas. En una aplicación real se consultaría una base de datos.

### 1.8 Servidor principal

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

> `import 'dotenv/config'` debe ser la primera línea. Si se carga después, `process.env.JWT_SECRET` llega `undefined`.

### 1.9 Agregar script en `package.json`

```json
"scripts": {
  "dev": "ts-node src/server.ts"
}
```

### 1.10 Probar el backend

Iniciá el servidor:

```bash
npm run dev
```

Probá el endpoint con curl o con un cliente como Thunder Client:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"1234"}'
```

Respuesta esperada:

```json
{ "token": "eyJhbGci..." }
```

---

## Parte 2: Frontend

### 2.1 Crear el proyecto

Desde la carpeta raíz del proyecto:

```bash
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

Si hay un token en `localStorage`, renderiza el componente hijo. Si no, redirige a `/login`.

### 2.5 Página de login

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
    </form>
  );
};

export default Login;
```

### 2.6 Página de dashboard

`src/pages/Dashboard.tsx`

```typescript
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3001/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setMensaje(data.message));
  }, []);

  return (
    <div>
      <h1>{mensaje}</h1>
    </div>
  );
};

export default Dashboard;
```

El `useEffect` se ejecuta una vez al montar el componente. Envía el token en el header `Authorization` con el formato `Bearer <token>`.

### 2.7 Configurar las rutas

`src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const App = () => (
  <BrowserRouter>
    <Routes>
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

### 2.8 Iniciar el frontend

```bash
npm start
```

Abrí `http://localhost:3000/dashboard`. Como no hay token, redirige automáticamente a `/login`.

---

## Flujo completo

1. El usuario accede a `/dashboard`
2. `PrivateRoute` verifica si hay token en `localStorage`
3. Si no hay token → redirige a `/login`
4. El usuario completa el formulario → React hace `POST /api/auth/login`
5. Express valida las credenciales → firma y devuelve el JWT
6. React guarda el token en `localStorage` → redirige a `/dashboard`
7. `Dashboard` hace `GET /api/dashboard` con el token en el header
8. Express verifica el token con `verifyToken` → responde con los datos

---

## Diferencia clave: React Router vs rutas de Express

| React Router | Express |
|---|---|
| Navega entre componentes | Responde a requests HTTP |
| No hay request al servidor | El browser hace `fetch()` |
| Vive en el navegador | Vive en Node.js |

---

## Puntos a reforzar

- ¿Qué pasa si el token vence y el usuario intenta acceder al dashboard?
- ¿Dónde conviene guardar el token: `localStorage` o una cookie?
- ¿Cómo implementarías el logout?