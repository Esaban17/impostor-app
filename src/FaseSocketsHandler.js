import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useFase } from '../context/FaseContext';
import { useSala } from '../context/SalaContext';

export function useFaseSockets() {
  // Obtiene la instancia del socket desde el contexto
  const socket = useSocket();

  // Obtiene funciones del contexto de fase para actualizar el estado del juego
  const { setFase, setComentarios, setEliminado, setGanador } = useFase();

  // Obtiene la función para actualizar la sala desde el contexto correspondiente
  const { setSala } = useSala();

  // useEffect se ejecuta cuando el componente se monta o cuando cambian las dependencias
  useEffect(() => {
    // Si no hay socket, no hace nada
    if (!socket) return;

    // Evento: el juego entra en fase de comentarios
    socket.on('faseComentario', (salaActualizada) => {
      setFase('comentario');          // Cambia el estado de fase a 'comentario'
      setSala(salaActualizada);       // Actualiza la sala con los nuevos datos
    });

    // Evento: el juego entra en fase de votación
    socket.on('faseVotacion', (comentarios) => {
      setFase('votacion');            // Cambia el estado de fase a 'votacion'
      setComentarios(comentarios);   // Guarda los comentarios recibidos para mostrarlos en la votación
    });

    // Evento: se muestra el resultado de la ronda (quién fue eliminado)
    socket.on('resultadoRonda', ({ eliminado }) => {
      setFase('resultado');           // Cambia el estado de fase a 'resultado'
      setEliminado(eliminado);       // Guarda el jugador eliminado
    });

    // Evento: el juego ha terminado
    socket.on('juegoTerminado', ({ ganador, sala }) => {
      setFase('final');               // Cambia el estado de fase a 'final'
      setGanador(ganador);           // Guarda el jugador ganador
      setSala(sala);                 // Actualiza la sala al estado final
    });

    // Función de limpieza que se ejecuta cuando el componente se desmonta
    return () => {
      // Elimina los listeners del socket para evitar efectos duplicados o fugas de memoria
      socket.off('faseComentario');
      socket.off('faseVotacion');
      socket.off('resultadoRonda');
      socket.off('juegoTerminado');
    };

    // Dependencias del efecto: se volverá a ejecutar si alguna cambia
  }, [socket, setFase, setComentarios, setSala, setEliminado, setGanador]);
}