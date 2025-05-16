import { DriverRegistration } from "@/src/types";
import { atom } from "recoil";

export const driverState = atom<DriverRegistration | null>(
    key: "driverState",
    default: null,
);