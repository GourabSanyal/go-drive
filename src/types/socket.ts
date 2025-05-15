// Defines a simple structure for coordinates
export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// This interface holds the actual details of a ride request
export interface RideDetailsInternal {
  pickupLocation: { latitude: number; longitude: number; address?: string };
  dropoffLocation: { latitude: number; longitude: number; address?: string };
  riderId?: string;
  fare?: number;
  status?: string;
  bidAmount?: number; // Initial offer from rider
  name?: string; // Rider's name
  phone?: string; // Rider's phone
  createdAt?: string;
  updatedAt?: string;
  fareDetails?: {
    baseFare: number;
    finalFare?: number;
    breakdown?: any;
  };
  // Any other fields sent by server as part of ride details
}

// Main RideRequest type, now with nested rideDetails
export interface RideRequest {
  rideId: string;
  bidding_room_id: string;
  rideDetails: RideDetailsInternal; // All substantive details are here
}

// Type for the actual data payload of the 'new_ride_to_bid_on' event
export interface NewRideToBidOnEventData {
  rideId: string;
  bidding_room_id: string;
  rideDetails: RideDetailsInternal; // This matches the structure from the server
}

export interface DriverBid {
  rideId: string;
  driverId: string;
  bidAmount: number;
  driverName?: string;
  driverLocation?: LocationCoords;
}

export interface BidSubmissionAckData {
  rideId: string;
  bidId: string;
  message: string;
  timestamp: Date;
}

export interface BidErrorData {
  rideId?: string;
  message: string;
}

export interface BiddingClosedRideAssignedData {
  rideId: string;
  message: string;
}

export interface RideConfirmedToDriverData {
  rideId: string;
  riderId: string;
  driverId: string;
  negotiatedFare: number;
  active_ride_room_id: string;
  message?: string;
  rideDetails: RideDetailsInternal; // Using the new RideDetailsInternal type
  // Removed redundant pickupLocation and dropoffLocation as they are in rideDetails
}

export interface RideFinalizedData {
  rideId: string;
  message: string;
  finalFare?: number;
}

// Removed TemporaryRideDetailsHolder as RideDetailsInternal replaces it.
// Old NewRideToBidOnData (which was = RideRequest) is effectively replaced by NewRideToBidOnEventData.
