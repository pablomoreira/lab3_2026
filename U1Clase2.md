---
marp: true
theme: default
paginate: true
header: 'Desarrollo Web Full Stack'
footer: 'Unidad 1: Fundamentos de Aplicaciones Web'
---

<!-- _class: lead -->
# Desarrollo Web Full Stack
## Unidad 1: Fundamentos de Aplicaciones Web

**Objetivos:**
- Comprender cómo funcionan las aplicaciones web
- Conocer la arquitectura cliente-servidor
- Entender el protocolo HTTP y APIs REST
- Identificar el rol de frontend y backend

---

## ¿Qué es una Aplicación Web?

**Definición:** Programa que se ejecuta en un navegador y permite interactuar con datos y funcionalidades a través de Internet.

**Ejemplos cotidianos:**
- Gmail (correo electrónico)
- Instagram (red social)
- Mercado Libre (e-commerce)
- Netflix (streaming)

**Características:**
✓ No requiere instalación
✓ Accesible desde cualquier dispositivo
✓ Actualizaciones automáticas
✓ Multiplataforma

---

## Arquitectura Cliente-Servidor

**¿Cómo funciona?**

```
┌─────────────────┐         ┌─────────────────┐
│    CLIENTE      │         │    SERVIDOR     │
│   (Frontend)    │         │   (Backend)     │
│                 │         │                 │
│ • Usuario       │ ───────>│ • Procesa info  │
│ • Navegador     │ REQUEST │ • Base de datos │
│ • Interfaz      │         │ • Lógica        │
│                 │<─────── │                 │
└─────────────────┘ RESPONSE└─────────────────┘
```

**Analogía:** 
Cliente = Persona en restaurante | Servidor = Cocina del restaurante

---

## Protocolo HTTP

**HTTP:** HyperText Transfer Protocol  
Lenguaje que usa el navegador para comunicarse con el servidor.

**Petición HTTP:**
```http
GET /usuarios HTTP/1.1
Host: www.ejemplo.com
```

**Respuesta HTTP:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{"nombre": "Juan", "edad": 25}
```

**Códigos de estado comunes:**
• **200** - OK (éxito) • **404** - No encontrado • **500** - Error del servidor

---

## Métodos HTTP

**Los 4 métodos principales (CRUD):**

| Método | Acción | Ejemplo |
|--------|--------|---------|
| **GET** | Leer/Obtener datos | Ver lista de usuarios |
| **POST** | Crear nuevos datos | Registrar un usuario nuevo |
| **PUT** | Actualizar datos existentes | Modificar perfil de usuario |
| **DELETE** | Eliminar datos | Borrar una cuenta |

**Ejemplo práctico:**
```
GET    /productos       → Listar todos los productos
POST   /productos       → Crear un producto nuevo
PUT    /productos/123   → Actualizar producto #123
DELETE /productos/123   → Eliminar producto #123
```

---

## ¿Qué es una API REST?

**API:** Application Programming Interface  
Interfaz que permite que dos aplicaciones se comuniquen.

**REST:** Representational State Transfer  
Estilo de arquitectura para diseñar APIs usando HTTP.

**Características de una API REST:**
✓ Usa métodos HTTP estándar
✓ Trabaja con recursos (usuarios, productos, etc.)
✓ Sin estado (cada petición es independiente)
✓ Formato JSON para intercambio de datos

**Ejemplo de endpoint REST:**
```
https://api.ejemplo.com/usuarios/5
```

---

<!-- _class: lead -->
## Frontend vs Backend

---

## Frontend (Lo que ve el usuario)
**Tecnologías:**
- HTML (estructura)
- CSS (diseño)
- JavaScript (interactividad)
- **React** (biblioteca JS)

**Responsabilidades:**
- Interfaz visual
- Experiencia de usuario
- Validación de formularios
- Navegación entre páginas

---

### BACKEND (Lo que no se ve)
**Tecnologías:**
- **Node.js** (entorno de ejecución)
- Express (framework)
- Bases de datos

**Responsabilidades:**
- Lógica de negocio
- Autenticación
- Acceso a base de datos
- Seguridad

---

## Diapositiva 8: React y Node.js en Acción

### ¿Por qué React?
- Componentes reutilizables
- Gestión eficiente del estado
- Gran comunidad y ecosistema
- Usado por Facebook, Instagram, Netflix

### ¿Por qué Node.js?
- JavaScript en backend
- Mismo lenguaje en frontend y backend
- Rápido y escalable
- npm: gestor de paquetes más grande

### Stack completo:
```
CLIENTE → React (Frontend)
    ↕
SERVIDOR → Node.js + Express (Backend)
    ↕
BASE DE DATOS → MongoDB/PostgreSQL
```

---

## Diapositiva 9: Flujo Completo de una Aplicación

### Ejemplo: Usuario crea una tarea

1. **Usuario** escribe "Comprar pan" en formulario React
2. **Frontend** valida el formulario
3. **Frontend** envía POST a `/tareas` con datos
4. **Backend** recibe la petición
5. **Backend** valida los datos
6. **Backend** guarda en base de datos
7. **Backend** responde con código 201 + tarea creada
8. **Frontend** actualiza la interfaz
9. **Usuario** ve la nueva tarea en pantalla

### Próxima clase:
Comenzaremos a construir nuestro primer servidor con Node.js

---

## Actividad Práctica

### Diagrama de Arquitectura

**Consigna:** Crear un diagrama que muestre:
- Cliente (navegador)
- Servidor (backend)
- Base de datos
- Flujo de una petición HTTP
- Respuesta del servidor

**Entrega:** Diagrama dibujado a mano o digital + explicación oral (5 min)