import { z } from "zod";

export const DriverRegistrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  regnumber: z.string(),
  vehiclemodel: z.string().optional(),
  vehicletype: z.string().optional(),
});
