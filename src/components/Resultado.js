import React, { useState, useEffect } from 'react';

function Resultado({ resultado, sala, socket, jugadorId }) {
  const [confirmaciones, setConfirmaciones] = useState(0);
  const [yaConfirme, setYaConfirme] = useState(false);
  
  // Estados para las nuevas opciones
  const [votosTerminar, setVotosTerminar] = useState(0);
  const [votosSeguir, setVotosSeguir] = useState(0);
  const [yaVoteTerminar, setYaVoteTerminar] = useState(false);
  const [yaVoteSeguir, setYaVoteSeguir] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('confirmacionActualizada', ({ confirmaciones: nuevasConfirmaciones }) => {
        setConfirmaciones(nuevasConfirmaciones);
      });

      // Nuevos eventos para las opciones del impostor eliminado
      socket.on('votoTerminarActualizado', ({ votosTerminar: nuevosVotosTerminar }) => {
        setVotosTerminar(nuevosVotosTerminar);
      });

      socket.on('votoSeguirActualizado', ({ votosSeguir: nuevosVotosSeguir }) => {
        setVotosSeguir(nuevosVotosSeguir);
      });
    }

    return () => {
      if (socket) {
        socket.off('confirmacionActualizada');
        socket.off('votoTerminarActualizado');
        socket.off('votoSeguirActualizado');
      }
    };
  }, [socket]);

  if (!resultado || !sala) {
    return <div>Cargando resultado...</div>;
  }

  // Verificar si es el caso especial del impostor eliminado
  const esImpostorEliminado = resultado.impostorEliminado;
  
  if (esImpostorEliminado) {
    const jugadorActual = sala.jugadores.find(j => j._id === jugadorId);
    const soyJugadorVivo = !jugadorActual?.eliminado;
    const jugadoresVivos = sala.jugadores.filter(j => !j.eliminado).length;

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h2>🎉 ¡Impostor Eliminado!</h2>
        
        <div style={{
          padding: '30px',
          margin: '20px 0',
          borderRadius: '15px',
          backgroundColor: '#d4edda',
          border: '3px solid #28a745'
        }}>
          <h3 style={{ 
            color: '#155724',
            margin: '0 0 15px 0',
            fontSize: '24px'
          }}>
            🎊 ¡Victoria de los Jugadores!
          </h3>
          
          <div style={{ 
            fontSize: '18px',
            color: '#155724',
            marginBottom: '20px'
          }}>
            {resultado.mensaje}
          </div>
        </div>

        {/* Revelación del futbolista */}
        {resultado.futbolistaRevelado && (
          <div style={{
            padding: '25px',
            margin: '20px 0',
            borderRadius: '15px',
            backgroundColor: '#e1f5fe',
            border: '3px solid #0288d1'
          }}>
            <h3 style={{ 
              color: '#01579b',
              margin: '0 0 20px 0',
              fontSize: '22px'
            }}>
              ⚽ Futbolista Revelado
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              {resultado.futbolistaRevelado.imageUrl && (
                <img 
                  src={resultado.futbolistaRevelado.imageUrl} 
                  alt={resultado.futbolistaRevelado.nombre}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #0288d1'
                  }}
                />
              )}
              
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ 
                  color: '#01579b', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>
                  {resultado.futbolistaRevelado.nombreCompleto || resultado.futbolistaRevelado.nombre}
                </h4>
                
                <div style={{ color: '#0277bd', fontSize: '16px' }}>
                  {resultado.futbolistaRevelado.posicion && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Posición:</strong> {resultado.futbolistaRevelado.posicion}
                    </p>
                  )}
                  {resultado.futbolistaRevelado.nacionalidad && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Nacionalidad:</strong> {resultado.futbolistaRevelado.nacionalidad}
                    </p>
                  )}
                  {resultado.futbolistaRevelado.fechaNacimiento && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Fecha de Nacimiento:</strong> {resultado.futbolistaRevelado.fechaNacimiento}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '15px',
              fontSize: '14px',
              color: '#01579b',
              fontStyle: 'italic'
            }}>
              Este era el futbolista sobre el que tenían que hablar durante todo el juego
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '30px',
          padding: '25px',
          backgroundColor: '#fff3cd',
          borderRadius: '15px',
          border: '2px solid #ffc107'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '20px' }}>
            ¿Qué quieren hacer?
          </h4>
          
          {soyJugadorVivo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Botón Seguir Jugando */}
              <div style={{ 
                border: '2px solid #28a745',
                borderRadius: '10px',
                padding: '15px',
                backgroundColor: yaVoteSeguir ? '#d4edda' : 'white'
              }}>
                <h5 style={{ color: '#155724', margin: '0 0 10px 0' }}>
                  🎮 Seguir Jugando
                </h5>
                <p style={{ color: '#155724', margin: '0 0 15px 0', fontSize: '14px' }}>
                  Crear nueva sala con los mismos jugadores (mínimo 3 jugadores)
                </p>
                <div style={{ marginBottom: '10px', fontSize: '14px', color: '#856404' }}>
                  Votos: {votosSeguir}/{jugadoresVivos}
                </div>
                <button
                  onClick={handleSeguirJugando}
                  disabled={yaVoteSeguir}
                  style={{
                    padding: '12px 25px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: yaVoteSeguir ? '#6c757d' : '#28a745',
                    color: 'white',
                    cursor: yaVoteSeguir ? 'default' : 'pointer',
                    width: '100%'
                  }}
                >
                  {yaVoteSeguir ? '✓ Voto enviado' : 'Seguir Jugando'}
                </button>
              </div>

              {/* Botón Terminar Juego */}
              <div style={{ 
                border: '2px solid #dc3545',
                borderRadius: '10px',
                padding: '15px',
                backgroundColor: yaVoteTerminar ? '#f8d7da' : 'white'
              }}>
                <h5 style={{ color: '#721c24', margin: '0 0 10px 0' }}>
                  🏠 Terminar Juego
                </h5>
                <p style={{ color: '#721c24', margin: '0 0 15px 0', fontSize: '14px' }}>
                  Volver al lobby principal
                </p>
                <div style={{ marginBottom: '10px', fontSize: '14px', color: '#856404' }}>
                  Votos: {votosTerminar}/{jugadoresVivos}
                </div>
                <button
                  onClick={handleTerminarJuego}
                  disabled={yaVoteTerminar}
                  style={{
                    padding: '12px 25px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: yaVoteTerminar ? '#6c757d' : '#dc3545',
                    color: 'white',
                    cursor: yaVoteTerminar ? 'default' : 'pointer',
                    width: '100%'
                  }}
                >
                  {yaVoteTerminar ? '✓ Voto enviado' : 'Terminar Juego'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #dc3545'
            }}>
              <p style={{ color: '#721c24', margin: 0 }}>
                Has sido eliminado. Los jugadores vivos decidirán qué hacer.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lógica original para resultados normales
  const { eliminado, esImpostor, votos } = resultado;
  const jugadorActual = sala.jugadores.find(j => j._id === jugadorId);
  const soyJugadorVivo = !jugadorActual?.eliminado;
  const jugadoresVivos = sala.jugadores.filter(j => !j.eliminado).length;
  const fuiEliminado = eliminado?._id === jugadorId;

  const handleConfirmar = () => {
    if (socket && !yaConfirme && soyJugadorVivo) {
      socket.emit('confirmarSiguienteRonda', { codigo: sala.codigo, jugadorId });
      setYaConfirme(true);
    }
  };

  const handleTerminarJuego = () => {
    if (socket && !yaVoteTerminar && soyJugadorVivo) {
      socket.emit('terminarJuego', { codigo: sala.codigo, jugadorId });
      setYaVoteTerminar(true);
    }
  };

  const handleSeguirJugando = () => {
    if (socket && !yaVoteSeguir && soyJugadorVivo) {
      socket.emit('seguirJugando', { codigo: sala.codigo, jugadorId });
      setYaVoteSeguir(true);
    }
  };

  // Convertir el objeto de votos en un array para mostrar
  const votosArray = votos ? Object.entries(votos).map(([jugadorId, cantidad]) => {
    const jugador = sala.jugadores.find(j => j._id === jugadorId);
    return {
      jugador: jugador?.nombre || 'Desconocido',
      votos: cantidad,
      esEliminado: jugadorId === eliminado?._id
    };
  }).sort((a, b) => b.votos - a.votos) : [];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2>📊 Resultado de la Ronda</h2>

      {/* Mensaje de jugador eliminado si fui el eliminado */}
      {fuiEliminado && (
        <div style={{
          padding: '20px',
          margin: '20px 0',
          borderRadius: '10px',
          backgroundColor: '#dc3545',
          border: '2px solid #721c24',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>
            ⚠️ Has sido eliminado
          </h3>
          <p style={{ margin: 0, fontSize: '16px' }}>
            Ya no podrás participar en las siguientes rondas, pero puedes seguir observando el juego.
          </p>
        </div>
      )}
      
      {/* Jugador eliminado */}
      <div style={{
        padding: '30px',
        margin: '20px 0',
        borderRadius: '15px',
        backgroundColor: esImpostor ? '#d4edda' : '#f8d7da',
        border: `3px solid ${esImpostor ? '#28a745' : '#dc3545'}`
      }}>
        <h3 style={{ 
          color: esImpostor ? '#155724' : '#721c24',
          margin: '0 0 15px 0',
          fontSize: '24px'
        }}>
          {esImpostor ? '🎉 ¡Impostor Eliminado!' : '💀 Jugador Eliminado'}
        </h3>
        
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          color: esImpostor ? '#155724' : '#721c24'
        }}>
          {eliminado?.nombre}
        </div>
        
        <div style={{ 
          marginTop: '15px',
          fontSize: '16px',
          color: esImpostor ? '#155724' : '#721c24'
        }}>
          {esImpostor ? 
            '¡Era el impostor! Los jugadores ganan esta ronda' : 
            'Era un jugador normal. El impostor sigue entre nosotros...'
          }
        </div>
      </div>

      {/* Resultados de votación */}
      {votosArray.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h4>🗳️ Resultados de la Votación:</h4>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid #dee2e6'
          }}>
            {votosArray.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 15px',
                  margin: '5px 0',
                  borderRadius: '8px',
                  backgroundColor: item.esEliminado ? '#ffebee' : 'white',
                  border: item.esEliminado ? '2px solid #f44336' : '1px solid #ddd'
                }}
              >
                <span style={{ 
                  fontWeight: item.esEliminado ? 'bold' : 'normal',
                  color: item.esEliminado ? '#d32f2f' : '#333'
                }}>
                  {item.jugador} {item.esEliminado && '(Eliminado)'}
                </span>
                <span style={{
                  backgroundColor: item.esEliminado ? '#f44336' : '#2196f3',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '15px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {item.votos} voto{item.votos !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información del juego */}
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '10px',
        border: '1px solid #2196f3'
      }}>
        <h5 style={{ color: '#1565c0', margin: '0 0 15px 0' }}>
          📈 Estado del Juego
        </h5>
        <div style={{ color: '#1565c0' }}>
          <p style={{ margin: '5px 0' }}>
            <strong>Ronda:</strong> {sala.rondaActual}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Jugadores vivos:</strong> {sala.jugadores.filter(j => !j.eliminado).length}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Jugadores eliminados:</strong> {sala.jugadores.filter(j => j.eliminado).length}
          </p>
        </div>
      </div>

      {/* Sección de continuación y confirmaciones */}
      <div style={{ 
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107'
      }}>
        {/* Mostrar progreso de confirmaciones */}
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>
          <h5 style={{ color: '#856404', margin: '0 0 10px 0' }}>
            Jugadores listos: {confirmaciones}/{jugadoresVivos}
          </h5>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            backgroundColor: '#ffe5b4',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(confirmaciones/jugadoresVivos) * 100}%`,
              height: '100%',
              backgroundColor: '#ffc107',
              transition: 'width 0.3s ease-in-out'
            }} />
          </div>
        </div>

        {/* Botón de confirmar para jugadores vivos */}
        {soyJugadorVivo && (
          <button
            onClick={handleConfirmar}
            disabled={yaConfirme}
            style={{
              padding: '12px 25px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: yaConfirme ? '#d1d1d1' : 
                             esImpostor ? '#dc3545' : '#28a745',
              color: 'white',
              cursor: yaConfirme ? 'default' : 'pointer',
              width: '100%',
              transition: 'background-color 0.3s ease'
            }}
          >
            {yaConfirme ? '✓ Listo' : 
             esImpostor ? 'Terminar Juego' : 
             'Continuar a la siguiente ronda'}
          </button>
        )}

        {/* Mensaje para jugadores eliminados */}
        {!soyJugadorVivo && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #dc3545',
            marginTop: '15px'
          }}>
            <h5 style={{ color: '#721c24', margin: '0 0 10px 0' }}>
              ⚠️ Has sido eliminado
            </h5>
            <p style={{ color: '#721c24', margin: 0 }}>
              Ya no puedes participar en las votaciones. Podrás seguir observando el juego.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Resultado;