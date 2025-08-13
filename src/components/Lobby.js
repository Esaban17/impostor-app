import React, { useState, useEffect } from 'react';
import socket from '../socket';

function Lobby({ setSala, setJugadorId }) {
    // Estado local para el nombre del jugador
    const [nombre, setNombre] = useState('');

    // Estado local para el código de la sala a unirse
    const [codigoSala, setCodigoSala] = useState('');

    // Lista de jugadores conectados a la sala
    const [jugadores, setJugadores] = useState([]);

    // Estado local que representa la sala actual (antes de pasarla al contexto global)
    const [sala, setSalaLocal] = useState(null);

    // Función para crear una nueva sala
    const crearSala = () => {
        if (nombre.trim()) { // Verifica que el nombre no esté vacío
            socket.emit('crearSala', { nombre }, (salaCreada) => {
                // Al recibir la sala creada del servidor:
                setSalaLocal(salaCreada);         // Guarda localmente la sala
                setSala(salaCreada);              // La pasa al contexto global
                // Busca al jugador actual dentro de los jugadores de la sala
                const jugador = salaCreada.jugadores.find(j => j.socketId === socket.id);
                setJugadorId(jugador._id);        // Guarda su ID para identificarlo en el juego
            });
        }
    };

    // Función para unirse a una sala existente usando el código
    const unirseSala = () => {
        if (nombre.trim() && codigoSala.trim()) { // Verifica que ambos campos estén completos
            socket.emit('unirseSala', { nombre, codigo: codigoSala }, (respuesta) => {
                if (respuesta?.error) {
                    // Si hay un error específico del servidor, mostrarlo
                    alert(respuesta.error);
                } else if (respuesta) {
                    // Si la unión fue exitosa:
                    setSalaLocal(respuesta);      // Guarda la sala localmente
                    setSala(respuesta);           // También la pasa al contexto global
                    // Obtiene el jugador actual dentro de los jugadores de la sala
                    const jugador = respuesta.jugadores.find(j => j.socketId === socket.id);
                    setJugadorId(jugador._id);    // Guarda su ID
                } else {
                    // Si hubo un error genérico, muestra mensaje
                    alert('Sala no encontrada o ya ha comenzado el juego');
                }
            });
        }
    };

    // Efecto que escucha cambios en los eventos del socket relacionados con la sala
    useEffect(() => {
        // Listener: actualiza lista de jugadores cuando cambia
        socket.on('jugadoresActualizados', (jugadoresActualizados) => {
            setJugadores(jugadoresActualizados);
        });

        // Listener: actualiza toda la sala si el servidor lo envía
        socket.on('salaActualizada', (salaCompleta) => {
            setSalaLocal(salaCompleta);
            setSala(salaCompleta);
        });

        // Listener: maneja cuando se crea una nueva sala automáticamente
        socket.on('nuevaSalaCreada', ({ sala: nuevaSala, mensaje }) => {
            setSalaLocal(nuevaSala);
            setSala(nuevaSala);
            // Buscar el jugador actual en la nueva sala
            const jugador = nuevaSala.jugadores.find(j => j.socketId === socket.id);
            if (jugador) {
                setJugadorId(jugador._id);
            }
        });

        // Limpieza: elimina los listeners al desmontar el componente
        return () => {
            socket.off('jugadoresActualizados');
            socket.off('salaActualizada');
            socket.off('nuevaSalaCreada');
        };
    }, [setSala, setJugadorId]);

    // Función para que el host inicie el juego
    const iniciarJuego = () => {
        socket.emit('iniciarJuego', { codigo: sala.codigo }, (res) => {
            if (res?.error) alert(res.error); // Si hay error al iniciar, se muestra
        });
    };

    // Si el jugador ya está dentro de una sala, se muestra el lobby
    if (sala) {
        const esHost = sala.jugadores[0].socketId === socket.id;
        const puedeIniciar = esHost && sala.jugadores.length >= 3;
        
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
                ⚽ Impostor Fútbol
                </h2>
                <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#e74c3c',
                backgroundColor: '#f8f9fa',
                padding: '10px 20px',
                borderRadius: '10px',
                border: '2px solid #e74c3c'
                }}>
                Código: {sala.codigo}
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#34495e', marginBottom: '15px' }}>
                👥 Jugadores en la sala ({sala.jugadores.length}/6):
                </h3>
                <div style={{ 
                backgroundColor: '#f8f9fa', 
                borderRadius: '10px', 
                padding: '20px',
                border: '1px solid #dee2e6'
                }}>
                {sala.jugadores.map((jugador, index) => (
                    <div 
                    key={jugador._id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        margin: '5px 0',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: jugador.socketId === socket.id ? '2px solid #3498db' : '1px solid #ddd'
                    }}
                    >
                    <span style={{ 
                        backgroundColor: index === 0 ? '#f39c12' : '#27ae60',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '10px',
                        minWidth: '60px',
                        textAlign: 'center'
                    }}>
                        {index === 0 ? '👑 HOST' : `P${index + 1}`}
                    </span>
                    <span style={{ 
                        fontSize: '16px',
                        fontWeight: jugador.socketId === socket.id ? 'bold' : 'normal',
                        color: jugador.socketId === socket.id ? '#3498db' : '#333'
                    }}>
                        {jugador.nombre}
                        {jugador.socketId === socket.id && ' (Tú)'}
                    </span>
                    </div>
                ))}
                </div>
            </div>

            {/* Información del juego */}
            <div style={{ 
                backgroundColor: '#e8f4fd', 
                borderRadius: '10px', 
                padding: '20px',
                border: '1px solid #3498db',
                marginBottom: '20px'
            }}>
                <h4 style={{ color: '#2980b9', margin: '0 0 15px 0' }}>
                📋 Información del juego:
                </h4>
                <ul style={{ color: '#2980b9', margin: 0, paddingLeft: '20px' }}>
                <li>Mínimo 3 jugadores para iniciar</li>
                <li>Máximo 6 jugadores por sala</li>
                <li>Cada ronda dura 30 segundos</li>
                <li>Los jugadores normales deben encontrar al impostor</li>
                <li>El impostor debe fingir que conoce a los futbolistas</li>
                </ul>
            </div>

            {/* Botón de iniciar juego */}
            <div style={{ textAlign: 'center' }}>
                {esHost ? (
                <>
                    <button 
                    onClick={iniciarJuego}
                    disabled={!puedeIniciar}
                    style={{
                        padding: '15px 30px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: puedeIniciar ? 'pointer' : 'not-allowed',
                        backgroundColor: puedeIniciar ? '#27ae60' : '#95a5a6',
                        color: 'white',
                        transition: 'all 0.3s ease'
                    }}
                    >
                    {puedeIniciar ? '🚀 Iniciar Juego' : `⏳ Esperando jugadores (${sala.jugadores.length}/3)`}
                    </button>
                    {!puedeIniciar && sala.jugadores.length < 3 && (
                    <p style={{ color: '#e74c3c', marginTop: '10px', fontSize: '14px' }}>
                        Se necesitan al menos 3 jugadores para iniciar
                    </p>
                    )}
                </>
                ) : (
                <div style={{ 
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '10px',
                    border: '1px solid #ffc107'
                }}>
                    <p style={{ color: '#856404', margin: 0 }}>
                    ⏳ Esperando a que el host inicie el juego...
                    </p>
                </div>
                )}
            </div>
            </div>
        );
    }

    // Si no se ha unido o creado una sala, se muestra el formulario inicial
    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>
                    ⚽ Impostor Fútbol
                </h1>
                <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
                    ¿Puedes identificar al impostor que no conoce a los futbolistas?
                </p>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <input
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        border: '2px solid #ddd',
                        borderRadius: '10px',
                        boxSizing: 'border-box'
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && nombre.trim()) {
                            crearSala();
                        }
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={crearSala}
                    disabled={!nombre.trim()}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '10px',
                        backgroundColor: nombre.trim() ? '#27ae60' : '#95a5a6',
                        color: 'white',
                        cursor: nombre.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease'
                    }}
                >
                    🆕 Crear Nueva Sala
                </button>
            </div>

            <div style={{ 
                textAlign: 'center', 
                margin: '30px 0',
                position: 'relative'
            }}>
                <hr style={{ border: '1px solid #ddd' }} />
                <span style={{ 
                    backgroundColor: 'white',
                    padding: '0 15px',
                    color: '#7f8c8d',
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}>
                    O
                </span>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <input
                    type="text"
                    placeholder="Código de sala"
                    value={codigoSala}
                    onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        border: '2px solid #ddd',
                        borderRadius: '10px',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        letterSpacing: '2px'
                    }}
                    maxLength={6}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && nombre.trim() && codigoSala.trim()) {
                            unirseSala();
                        }
                    }}
                />
            </div>

            <button 
                onClick={unirseSala}
                disabled={!nombre.trim() || !codigoSala.trim()}
                style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '10px',
                    backgroundColor: (nombre.trim() && codigoSala.trim()) ? '#3498db' : '#95a5a6',
                    color: 'white',
                    cursor: (nombre.trim() && codigoSala.trim()) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease'
                }}
            >
                🚪 Unirse a Sala
            </button>

            <div style={{ 
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '1px solid #dee2e6'
            }}>
                <h4 style={{ color: '#495057', margin: '0 0 15px 0' }}>
                    📖 Cómo jugar:
                </h4>
                <ul style={{ color: '#6c757d', margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Se asigna un impostor secreto</li>
                    <li>Todos ven la imagen de un futbolista (excepto el impostor)</li>
                    <li>Escriben comentarios sobre el jugador</li>
                    <li>Votan por quien creen que es el impostor</li>
                    <li>Ganan si eliminan al impostor o si el impostor sobrevive</li>
                </ul>
            </div>
        </div>
    );
}

export default Lobby;