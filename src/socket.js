import { io } from 'socket.io-client';

const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://192.168.0.4:3001';

const socket = io(socketUrl);

export default socket;