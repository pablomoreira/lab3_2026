import { useState } from "react";
import styles from "./Formulario.css";

function Formulario() {
  const [nombre, setNombre] = useState("");

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log("Enviado:", nombre);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input className={styles.input}
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
      />
      <button className={styles.button}type="submit">Enviar</button>
    </form>
  );
}

export default Formulario;