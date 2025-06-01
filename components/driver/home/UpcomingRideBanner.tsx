import { TouchableOpacity, View } from "react-native";
import { UpcomingRideStyles as styles } from "./styles";
import { CommonStyles } from "../styles";
import { ChevronRight, Spline } from "lucide-react-native";
import { FC, useEffect, useState } from "react";
import CustomText from "../../ui/CustomText";
import { Colors } from "@/theme/colors";
import * as Location from "expo-location";
import { parseISO, format } from "date-fns";

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface UpcomingRideBannerProps {
  time: string;
  from: Location;
  to: Location;
  vehicle: string | undefined;
  fare: number;
  onPress?: () => void;
}

const UpcomingRideBanner: FC<UpcomingRideBannerProps> = ({
  fare,
  from,
  time,
  to,
  vehicle,
  onPress,
}) => {
  const [error, setError] = useState<string>("");
  const [fromAddress, setFromAddress] = useState<string>(
    "Loading pickup address..."
  );
  const [toAddress, setToAddress] = useState<string>(
    "Loading dropoff address..."
  );

  const getAddress = async ({ latitude, longitude }: Location) => {
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
          "[UpcomingRideBanner] Formatted address not found or empty in locationInfo:",
          loc
        );
        return null;
      }
      console.warn(
        "[UpcomingRideBanner] No locationInfo found for coordinates."
      );
      return null;
    } catch (err) {
      console.error("[UpcomingRideBanner] Error getting address:", err);
      setError("Unable to determine location");
      return null;
    }
  };

  useEffect(() => {
    (async function setAddress() {
      if (from && from.address) {
        setFromAddress(from.address);
      } else if (
        from &&
        typeof from.latitude === "number" &&
        typeof from.longitude === "number"
      ) {
        const fromRes = await getAddress(from);
        setFromAddress(fromRes || "Pickup address unavailable");
      } else {
        setFromAddress("Pickup location data missing");
      }

      if (to && to.address) {
        setToAddress(to.address);
      } else if (
        to &&
        typeof to.latitude === "number" &&
        typeof to.longitude === "number"
      ) {
        const toRes = await getAddress(to);
        setToAddress(toRes || "Dropoff address unavailable");
      } else {
        setToAddress("Dropoff location data missing");
      }
    })();
  }, [from, to]);

  const TIME = parseISO(time);
  const formattedTime = format(TIME, "hh:mm a");

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container]}
    >
      <View style={[styles.upper]}>
        <CustomText>Upcoming ride</CustomText>
      </View>
      <View style={[styles.middle]}>
        <View style={styles.splineContainer}>
          <Spline color={Colors.primary} style={CommonStyles.spline} />
        </View>
        <View
          style={[
            styles.location,
            !vehicle &&
              !fare && {
                width: "80%",
              },
          ]}
        >
          <CustomText variant="h7">
            {fromAddress
              ? fromAddress.length > 30
                ? fromAddress.slice(0, 30) + "..."
                : fromAddress
              : "Pickup..."}
          </CustomText>
          <CustomText variant="h7">
            {toAddress
              ? toAddress.length > 30
                ? toAddress.slice(0, 30) + "..."
                : toAddress
              : "Destination..."}
          </CustomText>
        </View>
        <View
          style={[
            styles.vehicleDetailsContainer,
            !vehicle &&
              !fare && {
                width: "0%",
              },
          ]}
        >
          {vehicle && (
            <CustomText variant="h7" style={[styles.vehicleType]}>
              {vehicle}
            </CustomText>
          )}
          {fare && (
            <CustomText style={{ color: Colors.primary }} variant="h7">
              ${fare}
              {/* {fare?.currency}{' '}{fare?.amount} */}
            </CustomText>
          )}
        </View>
      </View>
      <View style={[styles.bottom]}>
        <CustomText>Scheduled at {formattedTime}</CustomText>
        <ChevronRight color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

export default UpcomingRideBanner;
