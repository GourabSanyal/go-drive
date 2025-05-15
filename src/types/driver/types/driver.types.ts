import { z } from "zod";

import { DriverRegistrationSchema } from "../schema/driver.registration";
import { DriverLocationSchema } from "../schema/driver.location";
import { VehicleStatusSchema } from "../schema/driver.vehicleStatus";
import { DriverRatingSchema } from "../schema/driver.rating";

export type DriverRegistration = z.infer<typeof DriverRegistrationSchema>;
export type DriverLocation = z.infer<typeof DriverLocationSchema>;
export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;
export type DriverRating = z.infer<typeof DriverRatingSchema>;
