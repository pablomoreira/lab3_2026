# Introducción a TypeScript

## ¿Qué es TypeScript?

TypeScript es un **superconjunto de JavaScript** desarrollado por Microsoft que añade **tipado estático** al lenguaje.

**En resumen:** Todo el código JavaScript válido es código TypeScript válido, pero TypeScript añade características adicionales.

---

## JavaScript vs TypeScript

### JavaScript (Tipado Dinámico)

```javascript
// JavaScript
function sumar(a, b) {
  return a + b;
}

sumar(5, 3);        // ✓ 8
sumar("5", "3");    // ✓ "53" (concatenación)
sumar(5, "3");      // ✓ "53" (comportamiento inesperado)
```

**Problema:** Los errores aparecen en tiempo de ejecución.

---

### TypeScript (Tipado Estático)

```typescript
// TypeScript
function sumar(a: number, b: number): number {
  return a + b;
}

sumar(5, 3);        // ✓ 8
sumar("5", "3");    // ❌ Error en compilación
sumar(5, "3");      // ❌ Error en compilación
```

**Ventaja:** Los errores se detectan antes de ejecutar el código.

---

## Diferencias Principales

| Aspecto | JavaScript | TypeScript |
|---------|-----------|------------|
| **Tipos** | Dinámicos (runtime) | Estáticos (compile-time) |
| **Errores** | En ejecución | Al compilar |
| **Autocompletado** | Limitado | Excelente |
| **Refactoring** | Riesgoso | Seguro |
| **Compilación** | No requiere | Compila a JS |

---

## Ejemplo: Variables

### JavaScript
```javascript
let nombre = "Juan";
nombre = 123;        // ✓ Permitido
nombre = true;       // ✓ Permitido
```

### TypeScript
```typescript
let nombre: string = "Juan";
nombre = 123;        // ❌ Error
nombre = true;       // ❌ Error
nombre = "María";    // ✓ OK
```

---

## Ejemplo: Objetos

### JavaScript
```javascript
const persona = {
  nombre: "Ana",
  edad: 25
};

persona.ciudad = "Córdoba";  // ✓ Añade propiedad
persona.edad = "veinticinco"; // ✓ Cambia tipo
```

### TypeScript
```typescript
interface Persona {
  nombre: string;
  edad: number;
}

const persona: Persona = {
  nombre: "Ana",
  edad: 25
};

persona.ciudad = "Córdoba";   // ❌ Error: propiedad no existe
persona.edad = "veinticinco";  // ❌ Error: tipo incorrecto
```

---

## Ejemplo: Arrays

### JavaScript
```javascript
const numeros = [1, 2, 3];
numeros.push("cuatro");  // ✓ Mezcla tipos
numeros.push(true);      // ✓ Mezcla tipos
```

### TypeScript
```typescript
const numeros: number[] = [1, 2, 3];
numeros.push(4);         // ✓ OK
numeros.push("cuatro");  // ❌ Error
numeros.push(true);      // ❌ Error
```

---

## Ventajas de TypeScript

✓ **Detección temprana de errores** → Antes de ejecutar
✓ **Mejor autocompletado** → El editor conoce los tipos
✓ **Código autodocumentado** → Los tipos explican qué espera cada función
✓ **Refactoring seguro** → El compilador detecta cambios que rompen el código
✓ **Mejor mantenimiento** → Más fácil entender código antiguo
✓ **Escalabilidad** → Ideal para proyectos grandes

---

## Desventajas de TypeScript

✗ Curva de aprendizaje inicial
✗ Paso extra de compilación
✗ Configuración adicional
✗ Más código para escribir (tipos)

---

## ¿Por qué usar TypeScript en este curso?

1. **Industria lo demanda** → Empresas grandes usan TypeScript
2. **Menos bugs** → Detecta errores antes de ejecutar
3. **Mejor experiencia de desarrollo** → Autocompletado potente
4. **Mismo conocimiento** → Todo lo que aprendas de JS aplica en TS
5. **Node.js + React** → Ambos tienen excelente soporte de TypeScript

---

## Ciclo de Desarrollo

```
Código TypeScript (.ts)
         ↓
    Compilador (tsc)
         ↓
Código JavaScript (.js)
         ↓
   Node.js ejecuta
```

**Importante:** El navegador y Node.js ejecutan JavaScript, no TypeScript. Por eso debemos compilar.

---

## Tipos Básicos en TypeScript

```typescript
// Primitivos
let nombre: string = "Juan";
let edad: number = 25;
let activo: boolean = true;

// Arrays
let numeros: number[] = [1, 2, 3];
let nombres: string[] = ["Ana", "Luis"];

// Objetos
let persona: { nombre: string; edad: number } = {
  nombre: "María",
  edad: 30
};

// Any (evitar usarlo)
let cualquierCosa: any = "texto";
cualquierCosa = 123;  // ✓ Permitido pero no recomendado
```

---

## Resumen

**JavaScript:** Flexible, rápido de escribir, errores en runtime
**TypeScript:** Seguro, estructurado, errores en compilación

**Conclusión:** TypeScript = JavaScript + tipos = menos errores + mejor código

---

## Próximos Pasos

1. Practicar con los ejercicios propuestos
2. Familiarizarse con interfaces
3. Aprender a tipar funciones
4. Usar TypeScript en proyectos Node.js