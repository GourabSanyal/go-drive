import { io, Socket } from 'socket.io-client';
import { RideRequestSchema } from '@src/types/ride/schema/ride.request';
import { validate } from '@utils/zod/validate';

class SocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private socketId: string | null = null;
  private clientList: any[] = [];

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io('http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: false
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      if (this.socket?.id) {
        this.socketId = this.socket.id;
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.socketId = null;
    });

    this.socket.on('ride_request_received', (data) => {
      console.log('Ride request received:', data);
    });

    this.socket.on('new_ride_request', (data) => {
      console.log('New ride request:', data);
    });

    this.socket.on('ride_accepted', (data) => {
      console.log('Ride accepted:', data);
    });

    this.socket.on('client_list', (data) => {
      console.log('Client list received:', data);
      this.clientList = data;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  public connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
    }
  }

  public joinRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('join_room', roomId);
    console.log(`Joining room: ${roomId}`);
  }

  public leaveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('leave_room', roomId);
    console.log(`Leaving room: ${roomId}`);
  }

  public sendRideRequest(rideRequestData: any) {
    if (!this.socket || !this.isConnected) return;
    const validatedData = validate(RideRequestSchema, rideRequestData);
    this.socket.emit('ride_request', validatedData);
  }

  public acceptRide(rideId: string, driverId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('accept_ride', { rideId, driverId });
  }

  public listClients() {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('list_clients');
  }

  public keepOneClient(roomId: string, keepClientId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('keep_one_client', roomId, keepClientId);
  }

  public joinRoomAndSendRequest(roomId: string, rideRequestData: any) {
    if (!this.socket || !this.isConnected) return;
    this.joinRoom(roomId);
    this.sendRideRequest(rideRequestData);
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socketId
    };
  }

  public getClientList() {
    return this.clientList;
  }
}

export const socketClient = new SocketClient(); 