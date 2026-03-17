# Express — Paso 1: Instalación

**Prerequisito:** tener Node.js instalado

```bash
mkdir mi-servidor
cd mi-servidor
npm init -y
npm install express
```

Eso es todo. Express es un paquete npm, no requiere configuración global.

---

**¿Qué es Express y para qué sirve?**

Express es un framework web para Node.js. Te permite crear un servidor HTTP de forma simple y estructurada.
Sin Express, crear un servidor en Node.js puro requiere bastante código repetitivo. Express lo simplifica sin quitarte control.

**Para qué sirve concretamente:**

    * Responder a rutas: GET /usuarios, POST /login, etc.
    * Servir archivos estáticos (HTML, CSS, imágenes)
    * Construir APIs REST (que es lo que nos interesa en el curso)
    * Manejar middlewares (lo veremos más adelante)



> Express = Node.js + una capa que organiza cómo un servidor recibe y responde peticiones HTTP.

# Express — Paso 3: Primer ejemplo básico
 
Creá el archivo `index.js` dentro de `mi-servidor`:
 
```javascript
const express = require('express');
const app = express();
 
app.get('/', (req, res) => {
  res.send('Hola mundo desde Express');
});
 
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
```
 
Para ejecutarlo:
 
```bash
node index.js
```

 
En el  navegador  `http://localhost:3000` y se vera la respuesta.
 
**Tres conceptos clave de este ejemplo:**
 
- `app.get('/', ...)` → escucha peticiones GET en la ruta `/`
- `req` → la petición que llega
- `res.send()` → la respuesta que enviás
 
 ## Primer ejemplo en TypeScript
 
**Instalación adicional:**
 
```bash
npm install typescript tsx @types/node @types/express --save-dev
```
 
El archivo `index.ts`:
 
```typescript
import express, { Request, Response } from 'express';
 
const app = express();
 
app.get('/', (req: Request, res: Response) => {
  res.send('Hola mundo desde Express con TypeScript');
});
 
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
```
 
Para ejecutarlo sin compilar:
 
```bash
npx tsx index.ts
```
 
**Diferencias con la versión JS:**
 
- `import` en lugar de `require`
- Los tipos `Request` y `Response` se importan explícitamente de Express
 
---
 
 Para ejecutarlo sin compilar:
 
```bash
npx tsx index.ts
```
 
**Diferencias con la versión JS:**
 
- `import` en lugar de `require`
- Los tipos `Request` y `Response` se importan explícitamente de Express
 
---

# Paso 4: Ejemplo GET con y sin parámetros (TypeScript)
 
```typescript
import express, { Request, Response } from 'express';
 
const app = express();
 
const frutas = ['manzana', 'naranja', 'banana', 'pera'];
 
// Sin parámetros → devuelve toda la lista
app.get('/frutas', (req: Request, res: Response) => {
  res.json(frutas);
});
 
// Con parámetro → devuelve un elemento por índice
app.get('/frutas/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const fruta = frutas[id];
 
  if (!fruta) {
    res.status(404).json({ error: 'No encontrada' });
    return;
  }
 
  res.json(fruta);
});
 
app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});
```
 
**Probalo:**
 
- `GET /frutas` → `["manzana", "naranja", "banana", "pera"]`
- `GET /frutas/1` → `"naranja"`
- `GET /frutas/99` → `404 { "error": "No encontrada" }`
 
**Conceptos nuevos:**
 
- `:id` → parámetro de ruta, se lee con `req.params.id`
- `res.json()` → responde con JSON
- `res.status(404)` → establece el código HTTP
 
---

# Trabajo Práctico — API REST básica con Express y TypeScript
 
**Consigna**
 
Construir una API REST para gestionar una lista de **estudiantes** en memoria (sin base de datos).
 
**Requerimientos:**
 
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/estudiantes` | GET | Devuelve todos los estudiantes |
| `/estudiantes/:id` | GET | Devuelve un estudiante por id |
| `/estudiantes` | POST | Agrega un nuevo estudiante |
| `/estudiantes/:id` | DELETE | Elimina un estudiante por id |
 
**Estructura esperada de un estudiante:**
```typescript
type Estudiante = {
  id: number;
  nombre: string;
  legajo: string;
}
```
 
**Restricciones:**
- Usar TypeScript
- Los datos viven en un array en memoria
- Respuestas siempre en JSON
- Códigos HTTP correctos: `200`, `201`, `404`
 
**Probar funcionamieto con curl, Thunder o Postman.**
 
---
  