# React con TypeScript

## 1. Requisitos previos

- Node.js instalado (v18 o superior)
- npm disponible en terminal

---

## 2. Crear el proyecto

```bash
npx create-react-app mi-app --template typescript
cd mi-app
npm start
```

Esto levanta el servidor en `http://localhost:3000`.

---

## 3. Estructura relevante del proyecto

```
mi-app/
├── src/
│   ├── App.tsx        ← componente raíz
│   ├── index.tsx      ← punto de entrada
│   └── ...
├── public/
└── tsconfig.json
```

Los archivos de componentes usan extensión `.tsx` (JSX + TypeScript).

---

## 4. Primer componente

Reemplazar el contenido de `src/App.tsx`:

```tsx
function App() {
  return (
    <div>
      <h1>Hola, React</h1>
    </div>
  );
}

export default App;
```

---

## 5. Componente con props tipadas

Crear `src/Saludo.tsx`:

```tsx
interface Props {
  nombre: string;
}

function Saludo({ nombre }: Props) {
  return <p>Hola, {nombre}</p>;
}

export default Saludo;
```

Usarlo en `App.tsx`:

```tsx
import Saludo from "./Saludo";

function App() {
  return (
    <div>
      <Saludo nombre="Ana" />
      <Saludo nombre="Luis" />
    </div>
  );
}

export default App;
```

- Un componente es una función que devuelve JSX.
- Las props se tipan con una `interface`, igual que en TypeScript puro.
- JSX permite mezclar lógica JS dentro de `{}`.

---

## 6. useState

`useState` es un hook que crea una variable reactiva — cuando cambia, el componente se vuelve a renderizar.

```tsx
const [nombre, setNombre] = useState("");
//     ^^^^^^  ^^^^^^^^^^            ^^
//     valor   función para        valor
//     actual  actualizarlo        inicial
```

> Siempre se actualiza con el setter, nunca directamente:
> ```tsx
> setNombre("Pablo")  // ✅
> nombre = "Pablo"    // ❌
> ```

---

## 7. Formulario controlado

En React, los formularios son **controlados**: el estado del componente es la fuente de verdad de cada campo.

```tsx
import { useState } from "react";

function Formulario() {
  const [nombre, setNombre] = useState("");

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log("Enviado:", nombre);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Tu nombre"
      />
      <button type="submit">Enviar</button>
    </form>
  );
}
```

- `value` vincula el input al estado
- `onChange` actualiza el estado cada vez que el usuario escribe
- `e.preventDefault()` evita que el navegador recargue la página al enviar

---

## 8. Estilos con CSS Modules

Crear dos archivos en el mismo directorio:

**Formulario.module.css**
```css
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
  margin: 40px auto;
}

.input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
}

.input:focus {
  border-color: #555;
}

.button {
  padding: 8px 12px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}
```

Los estilos solo aplican al componente donde se importan. CSS Modules genera nombres de clase únicos en compilación, evitando colisiones globales.

---

## 9. Formulario de login

Un formulario con múltiples campos usa un objeto de estado en lugar de variables separadas.

**Formulario.tsx**
```tsx
import { useState } from "react";
import styles from "./Formulario.module.css";

interface FormData {
  usuario: string;
  contrasena: string;
}

function Formulario() {
  const [formData, setFormData] = useState<FormData>({
    usuario: "",
    contrasena: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log("Login exitoso:", data);

    } catch (error) {
      console.error("Falló la solicitud:", error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        name="usuario"
        value={formData.usuario}
        onChange={handleChange}
        placeholder="Usuario"
      />
      <input
        className={styles.input}
        type="password"
        name="contrasena"
        value={formData.contrasena}
        onChange={handleChange}
        placeholder="Contraseña"
      />
      <button className={styles.button} type="submit">Ingresar</button>
    </form>
  );
}
```

- `interface FormData` agrupa los campos en un solo objeto de estado
- `[e.target.name]` permite usar un solo `handleChange` para todos los inputs
- La URL `http://localhost:3000/login` es donde estará la API REST (próxima unidad)

---

## 10. Promises y async/await

Cuando el formulario se envía, necesita **esperar** la respuesta del servidor antes de continuar. JavaScript es asíncrono por naturaleza: no detiene la ejecución para esperar, sigue adelante. Las Promises y `async/await` son la forma de manejar esto.

### ¿Qué es una Promise?

Una **Promise** es un objeto que representa una operación que todavía no terminó. Puede estar en uno de estos tres estados:

| Estado | Descripción |
|--------|-------------|
| `pending` | la operación está en curso |
| `fulfilled` | terminó con éxito, tiene un valor |
| `rejected` | falló, tiene un error |

Una Promise se crea con dos funciones: `resolve` (éxito) y `reject` (error):

```ts
const promesa = new Promise<string>((resolve, reject) => {
  setTimeout(() => {
    resolve("datos listos"); // después de 2 segundos, éxito
  }, 2000);
});
```

Para consumir el resultado se usa `.then()` y `.catch()`:

```ts
promesa
  .then((valor) => console.log(valor))  // "datos listos"
  .catch((error) => console.error(error));
```

### async/await

`async/await` es una sintaxis más legible para trabajar con Promises. En lugar de encadenar `.then()`, se puede escribir código que *parece* sincrónico pero sigue siendo asíncrono.

```ts
// con .then()
fetch("http://localhost:3000/login")
  .then((response) => response.json())
  .then((data) => console.log(data));

// con async/await — hace exactamente lo mismo
const response = await fetch("http://localhost:3000/login");
const data = await response.json();
console.log(data);
```

- `async` marca la función como asíncrona
- `await` pausa esa línea hasta tener el resultado, sin bloquear el resto de la app
- Sin `await`, `response` sería una Promise pendiente, no los datos reales

### Manejo de errores con try/catch

Si la Promise es rechazada (el servidor no responde, hay un error de red, etc.), el `await` lanza una excepción. Se captura con `try/catch`:

```tsx
try {
  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status}`);
  }

  const data = await response.json();
  console.log("Login exitoso:", data);

} catch (error) {
  console.error("Falló la solicitud:", error);
}
```

- `try` — contiene el código que puede fallar
- `catch` — se ejecuta si algo lanza un error
- `response.ok` — es `true` si el servidor respondió con status 200–299. Un status 401 o 500 no lanza error automáticamente, por eso se verifica manualmente
- `throw new Error(...)` — fuerza el error para que lo capture el `catch`