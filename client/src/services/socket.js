import { io } from 'socket.io-client';

const socket = io(window.location.origin.replace('5173', '5000'), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;
