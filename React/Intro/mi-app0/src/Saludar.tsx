interface Props {
  nombre: string;
}

function Saludo({ nombre }: Props) {
  return <p>Hola, {nombre}</p>;
}

export default Saludo;