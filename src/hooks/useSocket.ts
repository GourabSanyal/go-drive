import { useEffect, useState, useCallback } from "react";
import { socketClient } from "../services/socket/client/socketClient";
import { DriverBid, RideRequest } from "../types/socket";

interface Location {
  lat: number;
  lon: number;
  timestamp?: string;
}

interface RideDetails {
  pickupLocation?: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  dropoffLocation?: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  fare?: {
    baseFare?: number;
  };
}

interface CurrentRideState {
  rideId?: string;
  status:
    | "idle"
    | "pending_bids"
    | "driver_selected"
    | "in_progress"
    | "completed";
  rideDetails?: RideDetails;
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(
    socketClient.getConnectionStatus().isConnected
  );
  const [socketId, setSocketId] = useState<string | null>(
    socketClient.getConnectionStatus().socketId
  );
  const [currentRideState, setCurrentRideState] = useState<CurrentRideState>({
    status: "idle",
  });

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socketClient.getConnectionStatus().socketId);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
    };
    const handleRideProgress = (data: CurrentRideState) => {
      setCurrentRideState(data);
    };

    socketClient.on("connect", handleConnect);
    socketClient.on("disconnect", handleDisconnect);

    socketClient.on("ride_progress_update", handleRideProgress);

    if (socketClient.getConnectionStatus().isConnected) {
      handleConnect();
    }

    return () => {
      socketClient.off("connect", handleConnect);
      socketClient.off("disconnect", handleDisconnect);
      socketClient.off("ride_progress_update", handleRideProgress);
    };
  }, []);

  const connect = useCallback(() => {
    if (!socketClient.getConnectionStatus().isConnected) {
      socketClient.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketClient.getConnectionStatus().isConnected) {
      socketClient.disconnect();
    }
  }, []);

  const announceDriverReady = useCallback(() => {
    socketClient.announceDriverReady();
  }, []);

  const submitBid = useCallback(
    async (rideId: string, biddingRoomId: string, bidDetails: DriverBid) => {
      socketClient.submitBid(rideId, biddingRoomId, bidDetails);
    },
    []
  );

  const sendLocation = useCallback((location: Location) => {
    socketClient.sendLocation(location);
  }, []);

  const notifyRideCompleted = useCallback(() => {
    socketClient.notifyRideCompleted();
  }, []);

  return {
    isConnected,
    socketId,
    connect,
    disconnect,
    announceDriverReady,
    submitBid,
    sendLocation,
    notifyRideCompleted,
    currentRideState,
  };
};
