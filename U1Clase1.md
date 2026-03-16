---
marp: false
theme: default
paginate: true
header: 'Desarrollo Web Full Stack'
footer: 'Instalación: Node.js + TypeScript'
---

<!-- _class: lead -->
# Instalación de Entorno de Desarrollo
## Node.js + TypeScript

**Sistemas operativos:**
- Windows 🪟
- Linux 🐧

---

<!-- _class: lead -->
# 🪟 WINDOWS

---

## Paso 1: Instalar Node.js (Windows)

**Opción A: Instalador oficial (Recomendado)**

1. Ir a https://nodejs.org
2. Descargar versión **LTS** (Long Term Support)
3. Ejecutar instalador `.msi`
4. Seguir asistente (opciones por defecto)
5. Marcar "Automatically install necessary tools"

**Opción B: Usando winget**
```powershell
winget install OpenJS.NodeJS.LTS
```

---

## Paso 2: Verificar instalación (Windows)

Abrir **PowerShell** o **CMD**:

```bash
node --version
npm --version
```

**Salida esperada:**
```
v20.x.x
10.x.x
```

---

## Paso 3: Instalar TypeScript (Windows)

```bash
npm install -g typescript
```

**Verificar instalación:**
```bash
tsc --version
```

**Salida esperada:**
```
Version 5.x.x
```

✅ **Instalación completa en Windows**

---

<!-- _class: lead -->
# 🐧 LINUX

---

## Opción 1: Ubuntu/Debian

```bash
# Actualizar repositorios
sudo apt update

# Instalar Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node --version
npm --version
```

---

## Opción 2: Fedora/RHEL/CentOS

```bash
# Instalar Node.js LTS
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo dnf install -y nodejs

# Verificar
node --version
npm --version
```

---

## Opción 3: nvm (Recomendado - todas las distros)

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar terminal
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts
nvm use --lts

# Verificar
node --version
npm --version
```

**Ventaja:** No requiere `sudo` para instalar paquetes globales

---

## Instalar TypeScript (Linux)

**Con sudo:**
```bash
sudo npm install -g typescript
```

**Sin sudo (si usaste nvm):**
```bash
npm install -g typescript
```

**Verificar:**
```bash
tsc --version
```

✅ **Instalación completa en Linux**

---

<!-- _class: lead -->
# ✅ Verificación Completa

---

## Comprobar que todo funciona

```bash
# Ver versiones instaladas
node --version
npm --version
tsc --version

# Ver ubicación de Node
which node    # Linux
where node    # Windows
```

**Si todos los comandos funcionan:** ✅ Listo para comenzar

---

<!-- _class: lead -->
# 🚀 Crear Primer Proyecto

---

## Paso 1: Crear carpeta del proyecto

**Windows:**
```powershell
mkdir mi-proyecto-ts
cd mi-proyecto-ts
```

**Linux:**
```bash
mkdir mi-proyecto-ts
cd mi-proyecto-ts
```

---

## Paso 2: Inicializar proyecto

```bash
# Crear package.json
npm init -y

# Crear tsconfig.json
tsc --init

# Instalar tipos de Node.js (recomendado)
npm install --save-dev @types/node
```

---

## Paso 3: Crear primer archivo TypeScript

Crear archivo `index.ts`:

```typescript
const mensaje: string = "Hola desde TypeScript!";
console.log(mensaje);

function sumar(a: number, b: number): number {
  return a + b;
}

console.log(`La suma es: ${sumar(5, 3)}`);
```

---

## Paso 4: Compilar y ejecutar

```bash
# Compilar TypeScript a JavaScript
tsc

# Ejecutar el código
node index.js
```

**Salida esperada:**
```
Hola desde TypeScript!
La suma es: 8
```

✅ **Primer programa funcionando**

---

## Configurar scripts en package.json

Editar `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node index.js",
    "dev": "ts-node index.ts"
  }
}
```

**Usar con:**
```bash
npm run build   # Compila TypeScript
npm start       # Ejecuta JavaScript compilado
npm run dev     # Ejecuta TypeScript directamente
```

---

## Instalación de ts-node (Opcional)

Para ejecutar TypeScript directamente sin compilar:

```bash
npm install -g ts-node
```

**Uso:**
```bash
ts-node index.ts
```

---

**Verificar que VS Code ve Node.js:**
Abrir terminal integrada en VS Code y ejecutar:
```bash
node --version
npm --version
```

---

## ❌ Solución de Problemas

**Windows: "tsc no se reconoce como comando"**
- Agregar a PATH: `C:\Users\TuUsuario\AppData\Roaming\npm`

**Linux: "Permission denied" al instalar paquetes**
- Usar `sudo npm install -g typescript`
- O usar nvm (evita necesidad de sudo)

---

<!-- _class: lead -->
## Estructura de archivos final

```
mi-proyecto-ts/
├── node_modules/
├── index.ts
├── index.js          (generado por tsc)
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

<!-- _class: lead -->
## 🎯 Resumen

✅ Node.js instalado
✅ TypeScript instalado
✅ Proyecto creado
✅ Primer programa funcionando


**Próximo paso:** Comenzar a desarrollar con Node.js y 
TypeScript
---



---
# Ejercicios Iniciales: TypeScript

## Ejercicio 1: Calculadora Básica

**Objetivo:** Funciones con tipos básicos

**Consigna:**
Crear 4 funciones que realicen operaciones matemáticas:
- `sumar(a, b)` → retorna la suma
- `restar(a, b)` → retorna la resta
- `multiplicar(a, b)` → retorna el producto
- `dividir(a, b)` → retorna el cociente (manejar división por cero)

**Requisitos:**
- Tipear parámetros como `number`
- Tipear el retorno de cada función
- Probar cada función con `console.log()`

**Ejemplo de salida esperada:**
```
Suma: 15
Resta: 5
Multiplicación: 50
División: 2
```

---

## Ejercicio 2: Gestión de Estudiantes

**Objetivo:** Interfaces y objetos

**Consigna:**
Crear una interfaz `Estudiante` con:
- `nombre` (string)
- `edad` (number)
- `carrera` (string)
- `promedio` (number)

Crear 3 objetos de tipo `Estudiante` y una función `mostrarEstudiante(estudiante)` que imprima la información formateada.

**Requisitos:**
- Definir la interfaz correctamente
- Los objetos deben cumplir la interfaz
- La función debe recibir un `Estudiante` y no retornar nada

**Ejemplo de salida esperada:**
```
Nombre: Juan Pérez
Edad: 22 años
Carrera: Ingeniería
Promedio: 8.5
```

---

## Ejercicio 3: Filtrado de Productos

**Objetivo:** Arrays, tipos y métodos

**Consigna:**
Crear una interfaz `Producto` con:
- `id` (number)
- `nombre` (string)
- `precio` (number)
- `stock` (number)

Crear un array de 5 productos y 3 funciones:
1. `productosDisponibles(productos)` → retorna productos con stock > 0
2. `productosMayorA(productos, precio)` → retorna productos con precio mayor al indicado
3. `precioTotal(productos)` → retorna la suma de todos los precios

**Requisitos:**
- Array tipado: `Producto[]`
- Usar métodos de array: `filter`, `reduce`
- Todas las funciones deben estar tipadas

**Ejemplo de salida esperada:**
```
Productos disponibles: 4
Productos mayores a $500: 2
Precio total: $3250
```

---

## Entrega

**Formato:** Un archivo `.ts` por ejercicio o uno solo con los 3 ejercicios.

**Compilar y ejecutar:**
```bash
tsc ejercicio1.ts
node ejercicio1.js
```

**Criterios de evaluación:**
✓ Código compila sin errores
✓ Tipos correctamente definidos
✓ Funciones cumplen los requisitos
✓ Salida coincide con lo esperado
---

## 📚 Recursos

- **Node.js:** https://nodejs.org/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **nvm:** https://github.com/nvm-sh/nvm

**Próxima clase:** Crear nuestro primer servidor con Express