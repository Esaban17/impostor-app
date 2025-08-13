import React, { useEffect, useState } from 'react';
import Lobby from './components/Lobby';
import RondaActual from './components/RondaActual';
import Votacion from './components/Votacion';
import Resultado from './components/Resultado';
import socket from './socket';

const FASES = {
  LOBBY: 'lobby',
  COMENTARIO: 'comentario',
  VOTACION: 'votacion',
  RESULTADO: 'resultado',
  FINAL: 'finalizado'
};

function App() {
  const [sala, setSala] = useState(null);
  const [jugadorId, setJugadorId] = useState(null);
  const [fase, setFase] = useState(FASES.LOBBY);
  const [comentarios, setComentarios] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  useEffect(() => {
    // Evento: juego iniciado
    socket.on('juegoIniciado', (nuevaSala) => {
      console.log('🎮 Juego iniciado:', nuevaSala);
      setSala(nuevaSala);
      setFase(FASES.COMENTARIO);
    });

    // Evento: nueva ronda iniciada
    socket.on('nuevaRonda', (nuevaSala) => {
      console.log('🆕 Nueva ronda:', nuevaSala);
      setSala(nuevaSala);
      setComentarios([]);
      setResultado(null);
    });

    // Evento: fase de comentarios
    socket.on('faseComentario', ({ sala: salaActualizada, duracion }) => {
      console.log('💬 Fase de comentarios iniciada');
      setSala(salaActualizada);
      setFase(FASES.COMENTARIO);
      setComentarios([]);
      setTiempoRestante(duracion / 1000);
    });

    // Evento: comentario agregado
    socket.on('comentarioAgregado', ({ jugadorId, texto, nombreJugador, totalComentarios, jugadoresActivos }) => {
      console.log('💬 Comentario agregado:', { nombreJugador, texto });
      setComentarios(prev => [...prev, { jugadorId, texto, nombreJugador }]);
    });

    // Evento: votación finalizada (cuando todos han votado)
    socket.on('votacionFinalizada', () => {
      console.log('🏁 Votación finalizada antes del tiempo límite');
      setTiempoRestante(0);
      setFase(FASES.RESULTADO);
    });

    // Evento: fase de votación
    socket.on('faseVotacion', ({ comentarios: comentariosParaVotar, jugadoresVivos, duracion }) => {
      console.log('🗳️ Fase de votación iniciada');
      setFase(FASES.VOTACION);
      setComentarios(comentariosParaVotar);
      setTiempoRestante(duracion / 1000);
    });

    // Evento: voto registrado
    socket.on('votoRegistrado', ({ votanteId, totalVotos, jugadoresActivos }) => {
      console.log('🗳️ Voto registrado. Total:', totalVotos);
    });

    // Evento: resultado de la ronda
    socket.on('resultadoRonda', ({ eliminado, esImpostor, votos }) => {
      console.log('📊 Resultado:', { eliminado: eliminado?.nombre, esImpostor });
      setFase(FASES.RESULTADO);  // Primero cambiamos la fase
      setResultado({ eliminado, esImpostor, votos });  // Luego establecemos el resultado
    });

    // Evento: impostor eliminado - mostrar opciones
    socket.on('impostorEliminado', ({ mensaje, jugadoresVivos, futbolistaRevelado, sala: salaActualizada }) => {
      console.log('😈 Impostor eliminado - mostrando opciones y revelando futbolista');
      setSala(salaActualizada);
      setResultado({ 
        impostorEliminado: true, 
        mensaje, 
        jugadoresVivos,
        futbolistaRevelado, // Información del futbolista real
        mostrarOpciones: true 
      });
      setFase(FASES.RESULTADO);
    });

    // Evento: volver al lobby
    socket.on('volverAlLobby', () => {
      console.log('🏠 Volviendo al lobby');
      setSala(null);
      setJugadorId(null);
      setFase(FASES.LOBBY);
      setComentarios([]);
      setResultado(null);
    });

    // Evento: nueva sala creada después de eliminar impostor
    socket.on('nuevaSalaCreada', ({ sala: nuevaSala, mensaje }) => {
      console.log('🆕 Nueva sala creada:', nuevaSala.codigo);
      setSala(nuevaSala);
      setFase(FASES.LOBBY);
      setComentarios([]);
      setResultado(null);
      // Mostrar mensaje de éxito
      alert(mensaje);
    });

    // Evento: esperando más jugadores
    socket.on('esperandoJugadores', ({ mensaje, jugadoresActuales, jugadoresNecesarios }) => {
      console.log('⏳ Esperando más jugadores');
      alert(`${mensaje}\nJugadores actuales: ${jugadoresActuales}/${jugadoresNecesarios}`);
      // Volver al lobby para buscar más jugadores
      setSala(null);
      setJugadorId(null);
      setFase(FASES.LOBBY);
      setComentarios([]);
      setResultado(null);
    });

    // Evento: juego terminado
    socket.on('juegoTerminado', ({ ganador, razon, sala: salaFinal }) => {
      console.log('🏁 Juego terminado:', { ganador, razon });
      setSala(salaFinal);
      setResultado({ ganador, razon });
      setFase(FASES.FINAL);
    });

    return () => {
      socket.off('juegoIniciado');
      socket.off('nuevaRonda');
      socket.off('faseComentario');
      socket.off('comentarioAgregado');
      socket.off('faseVotacion');
      socket.off('votoRegistrado');
      socket.off('votacionFinalizada');
      socket.off('resultadoRonda');
      socket.off('impostorEliminado');
      socket.off('volverAlLobby');
      socket.off('nuevaSalaCreada');
      socket.off('esperandoJugadores');
      socket.off('juegoTerminado');
    };
  }, []);

  // Timer para mostrar tiempo restante
  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tiempoRestante]);

  if (fase === FASES.LOBBY) {
    return <Lobby setSala={setSala} setJugadorId={setJugadorId} />;
  }

  if (fase === FASES.COMENTARIO) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3>⏱️ Tiempo restante: {tiempoRestante}s</h3>
        </div>
        <RondaActual 
          sala={sala} 
          jugadorId={jugadorId} 
          comentarios={comentarios}
        />
      </div>
    );
  }

  if (fase === FASES.VOTACION) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3>⏱️ Tiempo restante: {tiempoRestante}s</h3>
        </div>
        <Votacion 
          sala={sala} 
          jugadorId={jugadorId} 
          comentarios={comentarios}
        />
      </div>
    );
  }

  if (fase === FASES.RESULTADO) {
    return (
      <Resultado 
        resultado={resultado}
        sala={sala}
        socket={socket}
        jugadorId={jugadorId}
      />
    );
  }

  if (fase === FASES.FINAL) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>🎉 Juego Finalizado</h2>
        <h3>
          Ganador: {resultado?.ganador === 'impostor' ? '😈 El Impostor' : '🧠 Los Jugadores'}
        </h3>
        <p>
          {resultado?.razon === 'impostor_eliminado' && 'El impostor fue eliminado'}
          {resultado?.razon === 'todos_eliminados' && 'El impostor eliminó a todos'}
          {resultado?.razon === 'muy_pocos_jugadores' && 'Quedan muy pocos jugadores'}
        </p>
        
        <h4>Historial de rondas:</h4>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          {sala?.historialRondas?.map((ronda, idx) => {
            const eliminado = sala.jugadores.find(j => j._id === ronda.eliminadoId);
            return (
              <li key={idx}>
                Ronda {ronda.numero}: {eliminado?.nombre || 'Sin eliminación'}
              </li>
            );
          })}
        </ul>
        
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          Jugar otra vez
        </button>
      </div>
    );
  }

  return <div>Cargando...</div>;
}

export default App;