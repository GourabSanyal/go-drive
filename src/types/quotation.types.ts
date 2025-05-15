export interface QuotationLocation {
  latitude: number;
  longitude: number;
  address: string;
}

// This is what the driver app receives as a ride request to bid on
// Corresponds to QuotationRequestPayload from rider app + an ID from backend
export interface QuotationRequest {
  id: string; // quotationId, also used as bidding_room_id
  userId: string; // Rider's user ID
  userName?: string; // Rider's name
  userFcmToken?: string; // Rider's FCM token
  pickupLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  requestedAt: string; // ISO timestamp
  fareOffer?: {
    // Rider's initial offer
    amount: number;
    currency: string;
  };
  preferredPaymentMethod?: "metamask" | "credit" | "debit" | "cash";
  vehicleType?: string;
  // Any other details from the original QuotationRequestPayload relevant to driver
}
