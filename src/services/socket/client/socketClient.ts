import { io, Socket } from "socket.io-client";
import {
  BidDetailsForSocket,
  DriverInfoForSocket,
} from "../../../types/bid.types";
import { QuotationRequest } from "../../../types/quotation.types";
// RideRequestSchema might not be directly used for sending in this client anymore
// import { RideRequestSchema } from "@src/types/ride/schema/ride.request";
// import { validate } from "@utils/zod/validate";

// It's good practice to use an environment variable for the URL
const SOCKET_SERVER_URL =
  process.env.EXPO_PUBLIC_SOCKET_SERVER_URL || "http://10.0.2.2:4000";

class SocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private socketId: string | null = null;
  // clientList may not be relevant anymore from server, drivers won't typically list all clients.
  // private clientList: any[] = [];
  private currentRideInfo: {
    active_ride_room_id: string;
    rideId: string;
    riderDetails?: any;
  } | null = null;
  private eventListeners: Map<string, Function[]> = new Map(); // For more flexible event handling

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    // IMPORTANT: Changed server URL
    this.socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private triggerEvent(eventName: string, data?: any) {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach((listener) => listener(data));
    // Fallback for direct console logging if no specific listener is attached via .on()
    if (listeners.length === 0) {
      console.log(`Socket event received: ${eventName}`, data);
    }
  }

  public on(eventName: string, callback: Function) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)?.push(callback);
  }

  public off(eventName: string, callback: Function) {
    const listeners = this.eventListeners.get(eventName) || [];
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to server:", SOCKET_SERVER_URL);
      this.isConnected = true;
      if (this.socket?.id) {
        this.socketId = this.socket.id;
      }
      this.driverReady(); // Announce driver is ready
      this.triggerEvent("connect");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      this.isConnected = false;
      this.socketId = null;
      this.currentRideInfo = null;
      this.triggerEvent("disconnect", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.isConnected = false;
      this.triggerEvent("connect_error", error);
    });

    // New listeners for driver flow
    this.socket.on("driver_room_joined", (data) => {
      this.triggerEvent("driver_room_joined", data);
    });

    this.socket.on(
      "new_ride_to_bid_on",
      (data: {
        rideId: string;
        bidding_room_id: string;
        rideDetails: QuotationRequest;
      }) => {
        this.triggerEvent("new_ride_to_bid_on", data);
      }
    );

    this.socket.on("bid_submission_ack", (data) => {
      this.triggerEvent("bid_submission_ack", data);
    });

    this.socket.on("bid_error", (data) => {
      this.triggerEvent("bid_error", data);
    });

    this.socket.on("ride_confirmed_to_driver", (data) => {
      // data: { active_ride_room_id, rideId, rideDetails, acceptedBidAmount, acceptedBidCurrency, acceptedBidDetails }
      this.currentRideInfo = {
        active_ride_room_id: data.active_ride_room_id,
        rideId: data.rideId,
        riderDetails: undefined, // Server doesn't send riderInfo
      };
      // Driver should automatically join the active ride room upon confirmation
      this.joinRoom(data.active_ride_room_id);
      this.triggerEvent("ride_confirmed_to_driver", data);
    });

    this.socket.on("bidding_closed_ride_assigned", (data) => {
      // data: { bidding_room_id, rideId }
      this.triggerEvent("bidding_closed_ride_assigned", data);
    });

    this.socket.on("driver_location_updated", (data) => {
      // This is if the server is echoing driver's own location for some reason, or for other drivers if that logic is added.
      // Typically, driver sends location, rider receives this event.
      this.triggerEvent("driver_location_updated", data);
    });

    this.socket.on("ride_finalized", (data) => {
      // data: { rideId, status: "completed" }
      this.triggerEvent("ride_finalized", data);
      if (this.currentRideInfo && this.currentRideInfo.rideId === data.rideId) {
        if (this.currentRideInfo.active_ride_room_id) {
          // Leave the room if still in it
          this.leaveRoom(this.currentRideInfo.active_ride_room_id);
        }
        this.currentRideInfo = null;
      }
    });

    this.socket.on("ride_participant_disconnected", (data) => {
      // data: { rideId, disconnectedUser } -- useful if the rider disconnects mid-ride
      this.triggerEvent("ride_participant_disconnected", data);
      if (this.currentRideInfo && this.currentRideInfo.rideId === data.rideId) {
        // Potentially show a message to the driver
        console.warn(`Rider disconnected from your active ride ${data.rideId}`);
      }
    });

    // General error listener
    this.socket.on("error", (error) => {
      console.error("Socket server error:", error);
      this.triggerEvent("error", error);
    });

    // Removing obsolete listeners from the old dummy server
    // this.socket.on("ride_request_received", ...);
    // this.socket.on("new_ride_request", ...);
    // this.socket.on("ride_accepted", ...);
    // this.socket.on("client_list", ...);
  }

  public connect() {
    if (!this.socket) {
      this.initializeSocket();
    }
    if (this.socket && !this.isConnected) {
      console.log("(Driver) Attempting to connect to socket server...");
      this.socket.connect();
      // Emitting 'driver_ready' is now handled by announceDriverReady, typically called after successful connection.
    }
  }

  // New method to explicitly announce driver readiness
  public announceDriverReady() {
    if (this.socket && this.isConnected && this.socketId) {
      console.log(
        `(Driver) Announcing driver ready, socket ID: ${this.socketId}`
      );
      this.socket.emit("driver_ready");
      this.triggerEvent("driver_room_joined", {
        message: "Joined driver room, awaiting ride requests.",
      }); // Simulate event for UI if needed
    } else {
      console.warn(
        "(Driver) Cannot announce ready: Not connected or no socket ID."
      );
      this.triggerEvent("error", {
        message: "Cannot announce ready: Not connected.",
      });
    }
  }

  public disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
    }
  }

  // --- Start of New/Refactored Public Methods for Driver ---

  private driverReady() {
    // Made private, called on connect
    if (!this.socket || !this.isConnected) return;
    this.socket.emit("driver_ready");
    console.log("Emitted: driver_ready");
  }

  public submitBid(
    bidding_room_id: string,
    bidDetails: BidDetailsForSocket,
    driverInfo: DriverInfoForSocket
  ) {
    if (this.socket && this.isConnected) {
      const bidPayload = {
        bidding_room_id,
        bidDetails,
        driverInfo,
      };
      this.socket.emit("driver_submit_bid", bidPayload);
      console.log("(Driver) Emitted: driver_submit_bid", bidPayload);
      this.triggerEvent("bid_sent_to_server", {
        quotationRequestId: bidding_room_id,
      });
    } else {
      console.warn(
        "(Driver) Cannot submit bid: Not connected or no socket instance."
      );
      this.triggerEvent("bid_error", {
        quotationRequestId: bidding_room_id,
        message: "Cannot submit bid: Not connected.",
      });
    }
  }

  public sendLocation(location: any) {
    // active_ride_room_id comes from currentRideInfo
    if (
      !this.socket ||
      !this.isConnected ||
      !this.currentRideInfo?.active_ride_room_id
    ) {
      console.warn(
        "Cannot send location: Not connected or not in an active ride."
      );
      return;
    }
    this.socket.emit("driver_sends_location", {
      active_ride_room_id: this.currentRideInfo.active_ride_room_id,
      location,
    });
    // console.log("Emitted: driver_sends_location"); // Can be too noisy
  }

  public notifyRideCompleted() {
    // rideId & room get from currentRideInfo
    if (!this.socket || !this.isConnected || !this.currentRideInfo) {
      console.warn(
        "Cannot complete ride: Not connected or not in an active ride."
      );
      return;
    }
    this.socket.emit("ride_is_completed", {
      active_ride_room_id: this.currentRideInfo.active_ride_room_id,
      rideId: this.currentRideInfo.rideId,
    });
    console.log(
      "Emitted: ride_is_completed for ride:",
      this.currentRideInfo.rideId
    );
  }

  // Kept generic join/leave room as they are useful
  public joinRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit("join_room", roomId);
    console.log(`Emitted: join_room for ${roomId}`);
  }

  public leaveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit("leave_room", roomId);
    console.log(`Emitted: leave_room for ${roomId}`);
  }

  // --- End of New/Refactored Public Methods for Driver ---

  // Removing obsolete methods from old dummyServer interaction
  // public sendRideRequest(...) { ... }
  // public acceptRide(...) { ... }
  // public listClients(...) { ... }
  // public keepOneClient(...) { ... }
  // public joinRoomAndSendRequest(...) { ... }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socketId,
    };
  }

  public getCurrentRideInfo() {
    return this.currentRideInfo;
  }

  // getClientList may not be useful anymore
  // public getClientList() { ... }
}

export const socketClient = new SocketClient();
