import { z } from "zod";

export const DriverRatingSchema = z.object({
  rating: z.number(),
});
