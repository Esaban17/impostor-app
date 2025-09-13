import { io } from 'socket.io-client';

// URL del backend en producción o desarrollo
const socketUrl = process.env.REACT_APP_SOCKET_URL || 
                  process.env.REACT_APP_API_URL || 
                  'http://localhost:3001';

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  upgrade: true
});

export default socket;
