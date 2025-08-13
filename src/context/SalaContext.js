import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../socket';

// Crea un nuevo contexto para compartir el estado de la sala
const SalaContext = createContext();

// Componente proveedor que encapsula a los hijos y les da acceso al estado de la sala
export function SalaProvider({ children }) {
  // Estado que representa la sala actual del juego (jugadores, ronda, etc.)
  const [sala, setSala] = useState(null);

  // useEffect se ejecuta al montar el componente y configura los listeners del socket
  useEffect(() => {
    // Función que actualiza completamente el estado de la sala
    const actualizarSala = (nuevaSala) => {
      setSala(nuevaSala);
    };

    // Listener: cuando cambia la fase del juego, se recibe la nueva sala completa
    socket.on('faseCambio', actualizarSala);

    // Listener: cuando cambia la lista de jugadores (ej. alguien entra o sale)
    socket.on('jugadoresActualizados', (jugadores) => {
      // Actualiza solo el arreglo de jugadores dentro del estado actual de la sala
      setSala(prev => prev ? { ...prev, jugadores } : prev);
    });

    // Listener: cuando el juego termina, se actualiza la sala con su estado final
    socket.on('juegoTerminado', ({ sala: salaFinal }) => {
      setSala(salaFinal);
    });

    // Función de limpieza: se ejecuta cuando el componente se desmonta
    // Elimina los listeners del socket para evitar duplicaciones o fugas de memoria
    return () => {
      socket.off('faseCambio', actualizarSala);
      socket.off('jugadoresActualizados');
      socket.off('juegoTerminado');
    };
  }, []); // Solo se ejecuta una vez al montar el componente

  // Provee el estado de la sala y la función para modificarla a los componentes hijos
  return (
    <SalaContext.Provider value={{ sala, setSala }}>
      {children} {/* Renderiza los componentes hijos dentro del contexto */}
    </SalaContext.Provider>
  );
}

// Hook personalizado que permite acceder fácilmente al contexto de la sala
export function useSala() {
  return useContext(SalaContext);
}