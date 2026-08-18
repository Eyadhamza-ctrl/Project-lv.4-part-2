import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join specific event room for targeted announcements
    const handleJoin = (eventId) => {
      if (!eventId) return;
      socket.join(`event:${eventId}`);
      socket.join(`event_${eventId}`);
      socket.join(`${eventId}`);
      console.log(`Socket ${socket.id} joined event room for event: ${eventId}`);
    };

    socket.on('join_event', handleJoin);
    socket.on('joinRoom', handleJoin);
    socket.on('joinEvent', handleJoin);

    // Leave event room
    const handleLeave = (eventId) => {
      if (!eventId) return;
      socket.leave(`event:${eventId}`);
      socket.leave(`event_${eventId}`);
      socket.leave(`${eventId}`);
      console.log(`Socket ${socket.id} left event room for event: ${eventId}`);
    };

    socket.on('leave_event', handleLeave);
    socket.on('leaveRoom', handleLeave);
    socket.on('leaveEvent', handleLeave);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    return {
      to: () => ({
        emit: () => {}
      }),
      emit: () => {}
    };
  }
  return io;
};

export const broadcastAnnouncement = (eventId, announcementData) => {
  const socketIO = getIO();
  // Broadcast to specific event room variants
  socketIO.to(`event:${eventId}`).emit('announcement', announcementData);
  socketIO.to(`event_${eventId}`).emit('announcement', announcementData);
  socketIO.to(`${eventId}`).emit('announcement', announcementData);
  // Also emit message event name
  socketIO.to(`event:${eventId}`).emit('message', announcementData);
  socketIO.to(`event_${eventId}`).emit('message', announcementData);
  socketIO.to(`${eventId}`).emit('message', announcementData);
};
