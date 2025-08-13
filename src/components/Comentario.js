import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useSala } from '../context/SalaContext';
import { useFase } from '../context/FaseContext';

function Comentario({ jugadorId }) {
  const socket = useSocket();
  const { sala } = useSala();
  const { fase } = useFase();
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  if (fase !== 'comentario') return null;

  const enviarComentario = () => {
    if (comentario.trim() === '') return;
    socket.emit('enviarComentario', {
      codigo: sala.codigo,
      jugadorId,
      texto: comentario
    });
    setEnviado(true);
  };

  return (
    <div>
      <h2>Fase de Comentario</h2>
      <img src={sala.historialRondas[sala.rondaActual - 1].futbolista.imageUrl} alt="Futbolista" style={{ width: '200px' }} />
      <p>Escribe un comentario relacionado con este jugador:</p>
      <textarea
        disabled={enviado}
        rows={4}
        cols={40}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />
      <br />
      <button onClick={enviarComentario} disabled={enviado}>Enviar</button>
      {enviado && <p>Comentario enviado. Esperando a los demás...</p>}
    </div>
  );
}

export default Comentario;