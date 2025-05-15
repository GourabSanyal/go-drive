import { z } from "zod";

// this will be saved to the db and will be used to display the ride details
export const RideSchema = z.object({
  id: z.string(),
  userId: z.string(),
  driverId: z.string(),
  pickupLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  dropoffLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  pickupTime: z.string(),
  dropoffTime: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(["pending", "accepted", "rejected", "completed"]),
  fare: z.object({
    baseFare: z.number(),
    finalFare: z.number(),
    breakdown: z.object({
      baseCost: z.number(),
      serviceFee: z.number(),
      taxes: z.number(),
    }),
  }),   
});