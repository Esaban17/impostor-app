import React, { useEffect, useState } from 'react';
import socket from '../socket';

function RondaActual({ sala, jugadorId, comentarios = [] }) {
  const [comentario, setComentario] = useState('');
  const [yaComentado, setYaComentado] = useState(false);
  const [mostrarImagen, setMostrarImagen] = useState(true);

  // Obtener la ronda actual
  const ronda = sala?.historialRondas?.[sala.rondaActual - 1];
  const jugador = sala?.jugadores?.find(j => j._id === jugadorId);

  useEffect(() => {
    if (!jugador) return;
    
    // Determinar si mostrar la imagen (los impostores no la ven)
    setMostrarImagen(!jugador.esImpostor);
    
    // Verificar si ya comentó en esta ronda
    if (ronda?.comentarios) {
      const yaComento = ronda.comentarios.some(c => c.jugadorId.toString() === jugadorId);
      setYaComentado(yaComento);
    } else {
      setYaComentado(false);
    }

    // Resetear comentario cuando cambia la ronda
    setComentario('');
  }, [sala, jugadorId, ronda, jugador]);

  const enviarComentario = () => {
    if (comentario.trim() === '' || yaComentado) return;

    socket.emit('enviarComentario', {
      codigo: sala.codigo,
      jugadorId,
      texto: comentario.trim()
    });

    setYaComentado(true);
    setComentario('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarComentario();
    }
  };

  if (!ronda || !ronda.futbolista) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Cargando ronda...</p>
      </div>
    );
  }

  const jugadoresVivos = sala.jugadores.filter(j => !j.eliminado);
  const miComentario = comentarios.find(c => c.jugadorId === jugadorId);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🏈 Ronda {ronda.numero}</h2>
      
      {/* Información del futbolista */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {/* Indicador de ronda y futbolista */}
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#17a2b8',
          color: 'white',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}>
          📍 Ronda {ronda.numero} {sala.rondaActual > 1 ? '- MISMO FUTBOLISTA' : '- FUTBOLISTA SELECCIONADO'}
        </div>

        {mostrarImagen ? (
          <div>
            {/* Debug info - puedes remover esto después */}
            <details style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
              <summary>Ver datos del futbolista (Debug)</summary>
              <pre style={{ textAlign: 'left', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
                {JSON.stringify(ronda.futbolista, null, 2)}
              </pre>
            </details>

            {ronda.futbolista && (
              <>
                <img
                  src={
                    ronda.futbolista.imageUrl || 
                    'https://via.placeholder.com/200x200/cccccc/666666?text=Sin+Imagen'
                  }
                  alt={ronda.futbolista.nombre || 'Futbolista'}
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '2px solid #ddd',
                    backgroundColor: '#f8f9fa'
                  }}
                  onError={(e) => {
                    console.error('❌ Error cargando imagen. URL:', ronda.futbolista.imageUrl);
                    console.error('📋 Datos del futbolista:', ronda.futbolista);
                    e.target.src = 'https://via.placeholder.com/200x200/cccccc/666666?text=Error+Imagen';
                  }}
                  onLoad={() => {
                    console.log('✅ Imagen cargada correctamente para:', ronda.futbolista.nombre);
                  }}
                />
                
                <h3 style={{ marginTop: '15px' }}>
                  {ronda.futbolista.nombre || 'Futbolista Desconocido'}
                </h3>

                {ronda.futbolista.nombreCompleto && ronda.futbolista.nombreCompleto !== ronda.futbolista.nombre && (
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    ({ronda.futbolista.nombreCompleto})
                  </p>
                )}

                {ronda.futbolista.posicion && (
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    Posición: {ronda.futbolista.posicion}
                  </p>
                )}

                {ronda.futbolista.nacionalidad && (
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    Nacionalidad: {ronda.futbolista.nacionalidad}
                  </p>
                )}
              </>
            )}
            
            {/* Recordatorio para rondas posteriores */}
            {sala.rondaActual > 1 && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffc107'
              }}>
                <p style={{ 
                  color: '#856404', 
                  fontSize: '13px', 
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  ⚠️ Recuerda: Es el mismo futbolista de todas las rondas anteriores
                </p>
              </div>
            )}
            
            <p style={{ marginTop: '20px', fontSize: '16px' }}>
              Escribe un comentario sobre este jugador para demostrar que lo conoces
            </p>
          </div>
        ) : (
          <div style={{ 
            padding: '40px', 
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '10px',
            border: '2px solid #721c24'
          }}>
            <h3>😈 ERES EL IMPOSTOR</h3>
            <p style={{ margin: '10px 0', fontSize: '16px' }}>
              No puedes ver al futbolista. Debes fingir que lo conoces basándose en los comentarios de otros jugadores.
            </p>
            <p style={{ margin: '10px 0', fontSize: '14px', fontStyle: 'italic' }}>
              � Tip: Escucha con atención y trata de imitar el estilo de comentarios de los demás
            </p>
            
            {/* Recordatorio para el impostor en rondas posteriores */}
            {sala.rondaActual > 1 && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}>
                <p style={{ 
                  fontSize: '13px', 
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  ⚠️ Recuerda: Han estado hablando del mismo futbolista en todas las rondas
                </p>
              </div>
            )}
            
            <p style={{ marginTop: '20px', fontSize: '16px' }}>
              Lee los comentarios de otros para obtener pistas
            </p>
          </div>
        )}
      </div>

      {/* Formulario de comentario */}
      <div style={{ marginBottom: '30px' }}>
        <h4>Tu comentario:</h4>
        {!yaComentado ? (
          <div>
            <textarea
              placeholder="Escribe aquí tu comentario sobre el jugador..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '14px',
                resize: 'vertical'
              }}
              maxLength={200}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <small style={{ color: '#666' }}>
                {comentario.length}/200 caracteres
              </small>
              <button 
                onClick={enviarComentario}
                disabled={comentario.trim() === ''}
                style={{
                  padding: '8px 16px',
                  backgroundColor: comentario.trim() ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: comentario.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Enviar comentario
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#d4edda', 
            borderRadius: '5px',
            border: '1px solid #c3e6cb'
          }}>
            <p style={{ margin: 0, color: '#155724' }}>
              ✅ Comentario enviado: "{miComentario?.texto}"
            </p>
            <small style={{ color: '#155724' }}>
              Esperando a que los demás jugadores comenten...
            </small>
          </div>
        )}
      </div>

      {/* Lista de comentarios recibidos */}
      <div>
        <h4>💬 Comentarios ({comentarios.length}/{jugadoresVivos.length}):</h4>
        {comentarios.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            Aún no hay comentarios...
          </p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {comentarios.map((c, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: c.jugadorId === jugadorId ? '#e3f2fd' : '#f8f9fa',
                  borderRadius: '8px',
                  border: `1px solid ${c.jugadorId === jugadorId ? '#2196f3' : '#ddd'}`,
                  borderLeft: `4px solid ${c.jugadorId === jugadorId ? '#2196f3' : '#28a745'}`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  <strong style={{ color: c.jugadorId === jugadorId ? '#1976d2' : '#333' }}>
                    {c.nombreJugador} {c.jugadorId === jugadorId && '(Tú)'}
                  </strong>
                  <small style={{ color: '#666' }}>
                    Comentario #{idx + 1}
                  </small>
                </div>
                <p style={{ margin: 0, lineHeight: '1.4' }}>
                  "{c.texto}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estado de la ronda */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '5px',
        border: '1px solid #ffeaa7'
      }}>
        <p style={{ margin: 0, color: '#856404' }}>
          📊 {comentarios.length} de {jugadoresVivos.length} jugadores han comentado
        </p>
        {comentarios.length === jugadoresVivos.length && (
          <p style={{ margin: '5px 0 0 0', color: '#856404', fontWeight: 'bold' }}>
            ¡Todos han comentado! La votación comenzará pronto...
          </p>
        )}
      </div>
    </div>
  );
}

export default RondaActual;