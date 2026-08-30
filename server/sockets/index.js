let ioInstance = null;

export function initSockets(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_room', (room) => {
      socket.join(room);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

export function emitRealtimeEvent(eventName, payload) {
  if (ioInstance) {
    ioInstance.emit(eventName, payload);
  }
}
