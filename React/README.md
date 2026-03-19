# Instalación y primer ejemplo — React + TypeScript

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

---

## 6. Qué observar

- Un componente es una función que devuelve JSX.
- Las props se tipan con una `interface`, igual que en TypeScript puro.
- JSX permite mezclar lógica JS dentro de `{}`.