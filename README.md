# Trabajo Integrador Final (TIF)

## Sistema Full-Stack

---

## 1. Objetivo del Proyecto

Desarrollar una aplicación funcional utilizando **Node.js (TypeScript)**, **React (TypeScript)** y una base de datos relacional con **Prisma**. La aplicación debe resolver un problema real.

---

## 2. Requisitos de Grupo (Para Regularizar)

Para obtener la regularidad, el equipo debe presentar una aplicación funcional que cumpla con los siguientes requisitos.

### A. Arquitectura y Base de Datos

- **Backend:** servidor en Node.js + Express + TypeScript con arquitectura de carpetas (`controllers`, `routes`, `middlewares`, `services`).
- **Base de Datos:** mínimo 4 tablas relacionadas (ej.: Usuarios, Productos, Categorías, Pedidos).
- **ORM:** uso obligatorio de Prisma para el manejo de la DB y tipado de modelos.

### B. Funcionalidades Core

- **Autenticación:** sistema de Login y Registro con contraseñas encriptadas (Bcrypt) y protección de rutas mediante JWT.
- **CRUD Completo:** al menos uno de los recursos debe permitir Crear, Leer, Actualizar y Borrar de forma completa desde el Frontend.

### C. Frontend y Deploy

- **Interfaz:** aplicación en React + TypeScript que consuma la API propia.
- **Deploy:** proyecto subido a la web (Render, Vercel, Railway o similar).

---

## 3. El Desafío Individual (Para Promocionar)

Para alcanzar la promoción de la materia, cada integrante deberá defender un **"Plus Individual"** desarrollado por sí mismo, que demuestre un dominio avanzado de los temas. Algunos ejemplos:

- **Integrante A — Seguridad Avanzada:** implementar validación estricta de todos los inputs con Zod y manejo de roles (Admin/User) con permisos específicos en el backend.
- **Integrante B — Integración de APIs Complejas:** conectar la app con una API externa compleja (ej.: pasarela de pagos, Google Maps API, o envío automático de emails) con manejo de errores robusto.
- **Integrante C — UX/UI y Estado Complejo:** implementar una gestión de estado global avanzada (Context API o Redux) y asegurar que la app sea 100% accesible y responsive, con feedback visual de carga (Skeletons/Spinners).

---

## 4. Modalidad de Evaluación y Defensa

### Presentación Grupal

El equipo dispondrá de **20 minutos** para:

1. Explicar la problemática y la solución propuesta.
2. Mostrar el DER (Diagrama Entidad-Relación) y la arquitectura del código.
3. Hacer una demo en vivo de la aplicación funcionando en el navegador.

### Defensa Individual (El "Plus")

Tras la presentación grupal, cada alumno tendrá **5 minutos** para:

1. Explicar el código de su funcionalidad "Plus".
2. Justificar por qué eligió esa solución técnica.
3. Responder preguntas técnicas del docente sobre el código (TypeScript, tipos de datos, flujo de la petición).

---

## 5. Entregables Obligatorios

1. **Repositorio de GitHub:** con un `README.md` profesional e historial de commits por cada integrante.
2. **Documentación Técnica:** diagrama de base de datos y lista de endpoints de la API.
3. **Video Demostrativo:** un clip de 3 minutos resumiendo el proyecto (como respaldo).

---

## Sugerencia docente

En el `README.md` del proyecto debe haber una sección llamada **"Contribuciones Individuales (Plus de Promoción)"**, donde cada alumno escriba qué parte desarrolló.
