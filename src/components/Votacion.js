import React, { useState } from 'react';
import socket from '../socket';

function Votacion({ sala, jugadorId, comentarios = [] }) {
  const [votoSeleccionado, setVotoSeleccionado] = useState(null);
  const [yaVoto, setYaVoto] = useState(false);

  if (!sala || !jugadorId) {
    return <div>Cargando votación...</div>;
  }

  const jugadoresVivos = sala.jugadores.filter(j => !j.eliminado);
  const jugadorActual = sala.jugadores.find(j => j._id === jugadorId);
  
  // Si el jugador está eliminado, mostrar mensaje especial
  if (jugadorActual?.eliminado) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        borderRadius: '10px',
        border: '1px solid #dc3545',
        color: '#721c24'
      }}>
        <h2>⚠️ Has sido eliminado</h2>
        <p>Ya no puedes participar en la votación. Puedes seguir observando el juego.</p>
      </div>
    );
  }

  const votar = (sospechosoId) => {
    if (yaVoto || sospechosoId === jugadorId) return;

    setVotoSeleccionado(sospechosoId);
    setYaVoto(true);

    socket.emit('votar', {
      codigo: sala.codigo,
      votanteId: jugadorId,
      sospechosoId
    });
  };

  const obtenerJugadorPorId = (id) => {
    return jugadoresVivos.find(j => j._id === id);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>🗳️ Fase de Votación</h2>
      <p style={{ fontSize: '16px', marginBottom: '30px' }}>
        Lee los comentarios y vota por quien crees que es el <strong style={{ color: '#dc3545' }}>impostor</strong>
      </p>

      {/* Mostrar comentarios con opciones de voto */}
      <div style={{ marginBottom: '30px' }}>
        <h3>💬 Comentarios de esta ronda:</h3>
        {comentarios.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No hay comentarios para mostrar
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {comentarios.map((comentario, idx) => {
              const jugador = obtenerJugadorPorId(comentario.jugadorId);
              if (!jugador) return null;

              const esJugadorActual = jugador._id === jugadorId;
              const yaVotoPorEste = votoSeleccionado === jugador._id;

              return (
                <div 
                  key={idx}
                  style={{
                    padding: '20px',
                    borderRadius: '10px',
                    border: `2px solid ${
                      esJugadorActual ? '#2196f3' : 
                      yaVotoPorEste ? '#28a745' : '#ddd'
                    }`,
                    backgroundColor: esJugadorActual ? '#e3f2fd' : '#f8f9fa',
                    position: 'relative'
                  }}
                >
                  {/* Header del comentario */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <h4 style={{ 
                      margin: 0, 
                      color: esJugadorActual ? '#1976d2' : '#333',
                      fontSize: '18px'
                    }}>
                      {jugador.nombre} {esJugadorActual && '(Tú)'}
                    </h4>
                    {yaVotoPorEste && (
                      <span style={{ 
                        color: '#28a745', 
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        ✅ Tu voto
                      </span>
                    )}
                  </div>

                  {/* Contenido del comentario */}
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    borderLeft: '4px solid #28a745'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '16px', 
                      lineHeight: '1.5',
                      fontStyle: 'italic'
                    }}>
                      "{comentario.texto}"
                    </p>
                  </div>

                  {/* Botón de voto */}
                  {!esJugadorActual && (
                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => votar(jugador._id)}
                        disabled={yaVoto}
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: yaVoto ? 'not-allowed' : 'pointer',
                          backgroundColor: yaVotoPorEste ? '#28a745' : 
                                         yaVoto ? '#6c757d' : '#dc3545',
                          color: 'white',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {yaVotoPorEste ? '✅ Votado' : 
                         yaVoto ? 'Ya votaste' : 
                         `🗳️ Votar por ${jugador.nombre}`}
                      </button>
                    </div>
                  )}

                  {esJugadorActual && (
                    <div style={{ 
                      textAlign: 'center',
                      padding: '10px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '5px',
                      color: '#856404'
                    }}>
                      <small>No puedes votar por ti mismo</small>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Estado de votación */}
      <div style={{ 
        padding: '20px',
        backgroundColor: yaVoto ? '#d4edda' : '#fff3cd',
        borderRadius: '10px',
        border: `1px solid ${yaVoto ? '#c3e6cb' : '#ffeaa7'}`,
        textAlign: 'center'
      }}>
        {yaVoto ? (
          <div>
            <h4 style={{ color: '#155724', margin: '0 0 10px 0' }}>
              ✅ Voto registrado
            </h4>
            <p style={{ color: '#155724', margin: 0 }}>
              Votaste por: <strong>
                {obtenerJugadorPorId(votoSeleccionado)?.nombre}
              </strong>
            </p>
            <p style={{ color: '#155724', margin: '10px 0 0 0', fontSize: '14px' }}>
              Esperando a que terminen de votar los demás jugadores...
            </p>
          </div>
        ) : (
          <div>
            <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>
              ⏳ Esperando tu voto
            </h4>
            <p style={{ color: '#856404', margin: 0 }}>
              Lee los comentarios cuidadosamente y vota por quien crees que es el impostor
            </p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>
          📋 Información de la votación:
        </h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
          <li>Jugadores vivos: {jugadoresVivos.length}</li>
          <li>El jugador más votado será eliminado</li>
          <li>Si el impostor es eliminado, ganan los jugadores normales</li>
          <li>Si quedan muy pocos jugadores, gana el impostor</li>
        </ul>
      </div>
    </div>
  );
}

export default Votacion;