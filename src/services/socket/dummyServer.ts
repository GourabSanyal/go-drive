import { Server } from "socket.io";
import { RideRequestSchema } from '@src/types/ride/schema/ride.request';

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

const rooms = new Map<string, Set<string>>();
const clients = new Map<string, { id: string, rooms: Set<string> }>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  clients.set(socket.id, {
    id: socket.id,
    rooms: new Set()
  });

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)?.add(socket.id);
    clients.get(socket.id)?.rooms.add(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
    rooms.get(roomId)?.delete(socket.id);
    clients.get(socket.id)?.rooms.delete(roomId);
    console.log(`Client ${socket.id} left room ${roomId}`);
  });

  // Handle ride requests
  socket.on('ride_request', (data) => {
    try {
      const validatedData = RideRequestSchema.parse(data);
      console.log('Received ride request:', validatedData);
      socket.broadcast.emit('new_ride_request', {
        status: 'new',
        data: validatedData
      });

      socket.emit('ride_request_received', {
        status: 'received',
        data: validatedData
      });
    } catch (error) {
      console.error('Invalid ride request:', error);
      socket.emit('error', {
        status: 'error',
        message: 'Invalid ride request data'
      });
    }
  });

  // Handle ride acceptance
  socket.on('accept_ride', ({ rideId, driverId }) => {
    const roomId = `ride_${rideId}`;
    console.log('Ride acceptance request:', {
      rideId,
      driverId,
      roomId,
      socketId: socket.id
    });
    
    socket.join(roomId);
    clients.get(socket.id)?.rooms.add(roomId);
    
    const response = {
      status: 'accepted',
      rideId,
      driverId,
      roomId,
      timestamp: new Date().toISOString()
    };
    
    console.log('Broadcasting ride acceptance:', response);
    io.to(roomId).emit('ride_accepted', response);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up rooms
    rooms.forEach((clients, roomId) => {
      if (clients.has(socket.id)) {
        clients.delete(socket.id);
        if (clients.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
    // Remove client from tracking
    clients.delete(socket.id);
  });
});

// Admin commands
io.on('connection', (socket) => {
  // List all connected clients and their rooms
  socket.on('list_clients', () => {
    console.log('List clients request from:', socket.id);
    
    const clientList = Array.from(clients.values()).map(client => ({
      id: client.id,
      rooms: Array.from(client.rooms)
    }));
    
    console.log('Current connected clients:', {
      totalClients: clientList.length,
      clients: clientList
    });
    
    socket.emit('client_list', clientList);
  });

  // Keep only one client in a room and disconnect others
  socket.on('keep_one_client', (roomId: string, keepClientId: string) => {
    console.log('Keep one client request:', {
      roomId,
      keepClientId,
      requestFrom: socket.id
    });
    
    const roomClients = rooms.get(roomId);
    if (roomClients) {
      const disconnectedClients: string[] = [];
      
      roomClients.forEach(clientId => {
        if (clientId !== keepClientId) {
          // disconnect other clients
          io.sockets.sockets.get(clientId)?.disconnect(true);
          clients.delete(clientId);
          disconnectedClients.push(clientId);
          console.log(`Disconnected client ${clientId} from room ${roomId}`);
        }
      });
      
      // update room to only contain the kept client
      rooms.set(roomId, new Set([keepClientId]));
      
      console.log('Room cleanup complete:', {
        roomId,
        keptClient: keepClientId,
        disconnectedClients,
        remainingClients: Array.from(rooms.get(roomId) || [])
      });
    } else {
      console.log(`Room ${roomId} not found or already empty`);
    }
  });
});

io.listen(4000);

console.log('Socket.IO server running on port 4000');
