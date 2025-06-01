import CustomText from "@/components/ui/CustomText";
import { View } from "react-native";
import { modalStyles as styles } from "./styles";
import { CommonStyles } from "../styles";
import { Spline } from "lucide-react-native";
import { Colors } from "@/theme/colors";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface ModalRideDetailsProps {
  from: LocationTypes;
  to: LocationTypes;
  showFare?: boolean;
  showDistance?: boolean;
  fare: number;
}

interface LocationTypes {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function ModalRideDetails({
  from,
  to,
  showDistance = true,
  showFare = true,
  fare,
}: ModalRideDetailsProps) {
  const [fromAddress, setFromAddress] = useState<string>("Loading address...");
  const [toAddress, setToAddress] = useState<string>("Loading address...");
  const [distance, setDistance] = useState<string>();
  const [error, setError] = useState<string>("");

  const getAddress = async ({ latitude, longitude }: LocationTypes) => {
    try {
      const locationInfo = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (locationInfo.length > 0) {
        const loc = locationInfo[0];
        if (
          loc &&
          typeof loc.formattedAddress === "string" &&
          loc.formattedAddress.trim().length > 0
        ) {
          return loc.formattedAddress;
        }
        console.warn(
          "[ModalRideDetails] Formatted address not found or empty in locationInfo:",
          loc
        );
        return null;
      }
      console.warn("[ModalRideDetails] No locationInfo found for coordinates.");
      return null;
    } catch (err) {
      console.error("[ModalRideDetails] Error getting address:", err);
      setError("Unable to determine location");
      return null;
    }
  };

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const distanceMeters = distanceKm * 1000;

    return {
      kilometers: distanceKm,
      meters: distanceMeters,
    };
  }

  useEffect(() => {
    (async function setAddress() {
      console.log(
        "[ModalRideDetails] useEffect - from prop:",
        JSON.stringify(from)
      );
      console.log(
        "[ModalRideDetails] useEffect - to prop:",
        JSON.stringify(to)
      );

      // Handle Pickup Address
      if (
        from &&
        typeof from.latitude === "number" &&
        typeof from.longitude === "number"
      ) {
        if (
          typeof from.address === "string" &&
          from.address.trim().length > 0
        ) {
          setFromAddress(from.address);
          console.log(
            "[ModalRideDetails] Used direct from.address:",
            from.address
          );
        } else {
          console.log(
            "[ModalRideDetails] from.address not usable, calling getAddress for pickup."
          );
          const fromRes = await getAddress(from);
          setFromAddress(fromRes || "Pickup address unavailable");
        }
      } else {
        setFromAddress("Pickup location data missing");
      }

      // Handle Dropoff Address
      if (
        to &&
        typeof to.latitude === "number" &&
        typeof to.longitude === "number"
      ) {
        if (typeof to.address === "string" && to.address.trim().length > 0) {
          setToAddress(to.address);
          console.log("[ModalRideDetails] Used direct to.address:", to.address);
        } else {
          console.log(
            "[ModalRideDetails] to.address not usable, calling getAddress for dropoff."
          );
          const toRes = await getAddress(to);
          setToAddress(toRes || "Dropoff address unavailable");
        }
      } else {
        setToAddress("Dropoff location data missing");
      }

      if (
        from &&
        typeof from.latitude === "number" &&
        typeof from.longitude === "number" &&
        to &&
        typeof to.latitude === "number" &&
        typeof to.longitude === "number"
      ) {
        const { meters, kilometers } = getDistance(
          from.latitude,
          from.longitude,
          to.latitude,
          to.longitude
        );
        meters < 1000
          ? setDistance(meters.toFixed(2) + " m")
          : setDistance(kilometers.toFixed(2) + " km");
      } else {
        setDistance(undefined); // Or some placeholder like "Distance unavailable"
      }
    })();
  }, [from, to]);

  return (
    <>
      {showFare ||
        (fare && (
          <View style={styles.cardDetails}>
            <CustomText variant="h7">Estimated fare</CustomText>
            <CustomText style={{ color: Colors.primary }} variant="h7">
              ${fare}
            </CustomText>
          </View>
        ))}
      {showDistance && (
        <View style={styles.cardDetails}>
          <CustomText variant="h7">Distance to pickup</CustomText>
          <CustomText style={{ color: Colors.primary }} variant="h7">
            {distance}
          </CustomText>
        </View>
      )}
      <View style={styles.cardDetails}>
        <Spline
          color={Colors.primary}
          style={[CommonStyles.spline, { width: "20%" }]}
        />
        <View style={{ width: "80%" }}>
          <CustomText variant="h7">
            {fromAddress ? fromAddress.slice(0, 30) : "Pickup..."}
            {fromAddress && fromAddress.length > 30 ? "..." : ""}
          </CustomText>
          <CustomText variant="h7">
            {toAddress ? toAddress.slice(0, 30) : "Destination..."}
            {toAddress && toAddress.length > 30 ? "..." : ""}
          </CustomText>
        </View>
      </View>
    </>
  );
}
