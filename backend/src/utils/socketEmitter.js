// Utility to emit socket events
export const emitToRoom = (io, room, event, data) => {
  io.to(room).emit(event, data);
};

export const emitToUser = (io, userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data);
};

export const emitToRole = (io, role, event, data) => {
  io.to(`role-${role}`).emit(event, data);
};

