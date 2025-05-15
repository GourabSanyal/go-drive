import { z } from "zod";

export const VehicleStatusSchema = z.object({
  batteryLevel: z.number(),
  estimatedRange: z.number(), // add check here to handle range logic in main app
});
