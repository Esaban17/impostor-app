import { createContext, useContext, useState } from 'react';

// Crea un nuevo contexto para compartir el estado de la fase del juego
const FaseContext = createContext();

// Componente proveedor que encapsula a los hijos y les da acceso al contexto de fase
export function FaseProvider({ children }) {
  // Estado para controlar la fase actual del juego ('esperando', 'comentario', 'votacion', 'resultado', 'final')
  const [fase, setFase] = useState('esperando');

  // Estado para almacenar los comentarios que los jugadores hacen en la fase de comentarios
  const [comentarios, setComentarios] = useState([]);

  // Estado que representa al jugador eliminado en la fase de resultado
  const [eliminado, setEliminado] = useState(null);

  // Estado que contiene al jugador que ganó el juego cuando finaliza
  const [ganador, setGanador] = useState(null);

  // El proveedor envuelve a los componentes hijos y les da acceso al contexto
  return (
    <FaseContext.Provider
      value={{
        fase,           // Fase actual del juego
        setFase,        // Función para actualizar la fase
        comentarios,    // Lista de comentarios de los jugadores
        setComentarios, // Función para actualizar los comentarios
        eliminado,      // Jugador eliminado en la ronda actual
        setEliminado,   // Función para actualizar al eliminado
        ganador,        // Jugador que ganó el juego
        setGanador      // Función para actualizar al ganador
      }}
    >
      {children} // Renderiza los componentes hijos que estarán dentro del proveedor
    </FaseContext.Provider>
  );
}

// Hook personalizado para acceder fácilmente al contexto de fase desde cualquier componente
export function useFase() {
  return useContext(FaseContext);
}