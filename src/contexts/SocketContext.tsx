import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { socketClient } from "../services/socket/client/socketClient";
import { QuotationRequest } from "../types/quotation.types";
import {
  BidSubmitPayload,
  BidDetailsForSocket,
  DriverInfoForSocket,
} from "../types/bid.types";

interface Location {
  lat: number;
  lon: number;
  timestamp?: string;
}

interface DriverAppRideState {
  activeRideId?: string;
  activeRideRoomId?: string;
  status:
    | "idle"
    | "viewing_quotations"
    | "bidding_in_progress"
    | "bid_accepted_starting_ride"
    | "ride_in_progress"
    | "ride_completed"
    | "error";
  errorMessage?: string;
  confirmedRideDetails?: any;
  riderInfo?: any;
  acceptedBid?: { amount: number; currency: string };
}

export interface SocketContextState {
  isConnected: boolean;
  socketId: string | null;
  availableQuotations: QuotationRequest[];
  driverRideState: DriverAppRideState;
  connect: () => void;
  disconnect: () => void;
  announceDriverAvailability: (isReady: boolean) => void;
  submitDriverBid: (bidPayload: BidSubmitPayload) => void;
  sendLocation: (location: Location) => void;
  completeRide: () => void;
}

export const SocketContext = createContext<SocketContextState | undefined>(
  undefined
);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(
    socketClient.getConnectionStatus().isConnected
  );
  const [socketId, setSocketId] = useState<string | null>(
    socketClient.getConnectionStatus().socketId
  );
  const [availableQuotations, setAvailableQuotations] = useState<
    QuotationRequest[]
  >([]);
  const [driverRideState, setDriverRideState] = useState<DriverAppRideState>({
    status: "idle",
  });

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socketClient.getConnectionStatus().socketId);
      socketClient.announceDriverReady();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
      setDriverRideState((prevState) => {
        if (
          prevState.status === "bid_accepted_starting_ride" ||
          prevState.status === "ride_in_progress"
        ) {
          return {
            ...prevState,
            status: "error",
            errorMessage:
              "Disconnected during active ride. Please attempt to reconnect.",
          };
        } else if (prevState.status === "bidding_in_progress") {
          return {
            ...prevState,
            status: "error",
            errorMessage:
              "Disconnected while bidding. Please check connection and retry if possible.",
          };
        }
        return { status: "idle", errorMessage: "Disconnected" };
      });
    };

    const handleNewQuotation = (data: {
      rideId: string;
      bidding_room_id: string;
      rideDetails: QuotationRequest;
    }) => {
      const newQuotation: QuotationRequest = {
        ...data.rideDetails,
        id: data.rideDetails.id || data.rideId,
      };
      setAvailableQuotations((prev) => {
        const existingIndex = prev.findIndex((q) => q.id === newQuotation.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = newQuotation;
          return updated;
        }
        return [...prev, newQuotation];
      });
      // Only change to 'viewing_quotations' if currently 'idle' and not in an active ride process
      setDriverRideState((prev) => {
        if (prev.status === "idle") {
          return { ...prev, status: "viewing_quotations" };
        }
        return prev;
      });
    };

    const handleBidSubmissionAck = (data: {
      quotationRequestId: string;
      message?: string;
    }) => {
      console.log(
        "Bid submission acknowledged for:",
        data.quotationRequestId,
        data.message
      );
      setDriverRideState((prev) => ({ ...prev, status: "viewing_quotations" })); // Or other appropriate status
    };

    const handleBidError = (data: {
      quotationRequestId: string;
      message: string;
    }) => {
      console.error(
        "Bid submission error for:",
        data.quotationRequestId,
        data.message
      );
      // Potentially show an alert or update UI to reflect the error
      // For now, ensure status allows re-bidding or viewing quotations
      setDriverRideState((prev) => ({
        ...prev,
        status: "viewing_quotations", // Or an error status specific to bidding
        errorMessage:
          prev.status === "bidding_in_progress"
            ? data.message
            : prev.errorMessage, // only set error if it was during bidding
      }));
    };

    const handleRideConfirmed = (data: {
      active_ride_room_id: string;
      rideId: string;
      rideDetails: any;
      riderInfo: any;
      acceptedBidAmount?: number;
      acceptedBidCurrency?: string;
    }) => {
      console.log(
        "Ride confirmed to driver! Ride ID:",
        data.rideId,
        "Raw Data:",
        JSON.stringify(data)
      );
      const newState: DriverAppRideState = {
        status: "bid_accepted_starting_ride",
        activeRideId: data.rideId,
        activeRideRoomId: data.active_ride_room_id,
        confirmedRideDetails: data.rideDetails,
        riderInfo: data.riderInfo,
        acceptedBid:
          data.acceptedBidAmount && data.acceptedBidCurrency
            ? {
                amount: data.acceptedBidAmount,
                currency: data.acceptedBidCurrency,
              }
            : undefined,
        errorMessage: undefined,
      };
      setDriverRideState(newState);
      setAvailableQuotations([]); // Clear quotations as a ride is confirmed
    };

    const handleBiddingClosed = (data: {
      bidding_room_id: string;
      rideId: string;
    }) => {
      setAvailableQuotations((prev) =>
        prev.filter((q) => q.id !== data.rideId)
      );
      console.log(
        `Bidding closed for ${data.rideId}. Removing from available list.`
      );
    };

    socketClient.on("connect", handleConnect);
    socketClient.on("disconnect", handleDisconnect);
    socketClient.on("new_ride_to_bid_on", handleNewQuotation);
    socketClient.on("bid_submission_ack", handleBidSubmissionAck);
    socketClient.on("bid_error", handleBidError);
    socketClient.on("ride_confirmed_to_driver", handleRideConfirmed);
    socketClient.on("bidding_closed_ride_assigned", handleBiddingClosed);

    if (socketClient.getConnectionStatus().isConnected) {
      handleConnect(); // Ensure initial state is correct if already connected
    }

    return () => {
      socketClient.off("connect", handleConnect);
      socketClient.off("disconnect", handleDisconnect);
      socketClient.off("new_ride_to_bid_on", handleNewQuotation);
      socketClient.off("bid_submission_ack", handleBidSubmissionAck);
      socketClient.off("bid_error", handleBidError);
      socketClient.off("ride_confirmed_to_driver", handleRideConfirmed);
      socketClient.off("bidding_closed_ride_assigned", handleBiddingClosed);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

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

  const announceDriverAvailability = useCallback((isReady: boolean) => {
    if (isReady) {
      socketClient.announceDriverReady();
    } else {
      console.log(
        "Driver set to not ready - further server logic needed for this state."
      );
    }
  }, []);

  const submitDriverBid = useCallback((bidPayload: BidSubmitPayload) => {
    const {
      quotationRequestId,
      bidAmount,
      currency,
      estimatedArrivalTime,
      vehicleDetails,
      driverId, // This should ideally come from a secure auth state, using socketId as placeholder if needed
      driverName,
      driverRating,
    } = bidPayload;

    const bidDetailsForSocket: BidDetailsForSocket = {
      amount: bidAmount,
      currency: currency,
      eta: estimatedArrivalTime,
    };
    const driverInfoForSocket: DriverInfoForSocket = {
      driverId:
        driverId ||
        socketClient.getConnectionStatus().socketId ||
        "unknown-driver", // Fallback for driverId
      name: driverName,
      vehicle: vehicleDetails,
      rating: driverRating,
    };

    // Optimistically set state, or wait for ack. For now, set to bidding_in_progress.
    setDriverRideState((prev) => ({
      ...prev,
      status: "bidding_in_progress",
      errorMessage: undefined,
    }));
    socketClient.submitBid(
      quotationRequestId,
      bidDetailsForSocket,
      driverInfoForSocket
    );
  }, []); // socketId dependency removed as it is now part of socketClient

  const sendLocation = useCallback((location: Location) => {
    socketClient.sendLocation(location);
  }, []);

  const completeRide = useCallback(() => {
    if (driverRideState.activeRideId) {
      socketClient.notifyRideCompleted(); // Server should derive rideId from driver's socket
      setDriverRideState((prev) => ({ ...prev, status: "ride_completed" }));
    } else {
      console.error("No active ride to complete.");
    }
  }, [driverRideState.activeRideId]);

  // Log state changes for debugging
  useEffect(() => {
    console.log(
      "[SocketProvider] isConnected:",
      isConnected,
      "socketId:",
      socketId
    );
  }, [isConnected, socketId]);

  useEffect(() => {
    console.log(
      "[SocketProvider] availableQuotations changed:",
      JSON.stringify(availableQuotations)
    );
  }, [availableQuotations]);

  useEffect(() => {
    console.log(
      "[SocketProvider] driverRideState changed:",
      JSON.stringify(driverRideState)
    );
  }, [driverRideState]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        socketId,
        availableQuotations,
        driverRideState,
        connect,
        disconnect,
        announceDriverAvailability,
        submitDriverBid,
        sendLocation,
        completeRide,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
