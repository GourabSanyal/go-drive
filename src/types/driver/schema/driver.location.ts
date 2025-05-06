import { z } from "zod";


export const DriverLocationSchema = z.object({
    latitude: z.string(),
    longitude: z.string(),
  });