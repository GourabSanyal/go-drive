// Payload for the driver submitting a bid
export interface BidSubmitPayload {
  quotationRequestId: string; // This will be the bidding_room_id
  driverId: string; // From authenticated driver
  bidAmount: number;
  currency: string; // e.g., "USD", "INR"
  estimatedArrivalTime: string; // e.g., "5 mins"
  vehicleDetails: string; // e.g., "Toyota Camry - ABC 123"
  driverName: string; // Driver's name
  driverRating: number; // Driver's rating
  // Potentially driverCurrentLocation: { latitude: number, longitude: number } if needed by server for this bid
}

// This can represent the structure of bidDetails and driverInfo for socketClient.submitBid
export interface BidDetailsForSocket {
  amount: number;
  currency: string;
  eta: string;
}

export interface DriverInfoForSocket {
  driverId: string;
  name: string;
  vehicle: string;
  rating: number;
  // Add other driver-specific info if needed by the server with the bid
}

// The DriverBid type currently in useSocket.ts - needs to be aligned/reviewed
// export interface DriverBid {
//   bidAmount: number;
//   // other fields if any from the existing DriverBid type
// }
