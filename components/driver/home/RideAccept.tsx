import { modalStyles, RideAcceptStyles as styles } from "./styles";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import HomeUserCard from "./HomeUserCard";
import ModalRideDetails from "./ModalRideDetails";
import AcceptRejectButtons from "./AcceptRejectButtons";
import { useRouter } from "expo-router";
import RideAcceptDetails from "./RideAcceptDetails";
import CallMsgButtons from "./CallMsgButtons";
import { Colors } from "@/theme/colors";
import Map from "./Map";
import PaymentReceived from "./PaymentReceived";
import CustomText from "@/components/ui/CustomText";
import { useSocket } from "@/src/hooks/useSocket";

interface DriverAppRideState {
  activeRideId?: string;
  activeRideRoomId?: string;
  status:
  | "idle"
  | "viewing_quotations"
  | "bidding_in_progress"
  | "bid_accepted_starting_ride"
  | "ride_in_progress"
  | "ride_completed"
  | "error";
  errorMessage?: string;
  riderInfo?: any;
  acceptedBid?: { amount: number; currency: string };
  confirmedRideDetails: {
    riderId: string;
    pickupLocation: LocationTypes;
    dropoffLocation: LocationTypes;
    requestedAt: string;
  };
}

interface LocationTypes {
  latitude: number;
  longitude: number;
  address: string;
}

export default function RideAccept({
  rideId,
  activeRideRoomId,
}: {
  rideId: string | string[];
  activeRideRoomId: string | string[];
}) {
  const router = useRouter();
  const [rideStarted, setRideStarted] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { completeRide, driverRideState } = useSocket()

  const handleSheetChanges = useCallback((index: number) => { }, []);

  const handleAcceptRide = () => setRideStarted(true);
  const handleEndRide = () => {
    if (rideStarted) {
      setRideCompleted(true);
    }
  };
  const handleFinishRide = () => {
    completeRide()
    router.navigate("/driver/(tabs)/home");
  }

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

  const calculatedDistance = useMemo(() => {
    if (
      driverRideState.status === "bid_accepted_starting_ride" &&
      driverRideState.confirmedRideDetails?.pickupLocation &&
      driverRideState.confirmedRideDetails?.dropoffLocation
    ) {
      const fromLoc = driverRideState.confirmedRideDetails.pickupLocation;
      const toLoc = driverRideState.confirmedRideDetails.dropoffLocation;
      const { meters, kilometers } = getDistance(
        fromLoc.latitude,
        fromLoc.longitude,
        toLoc.latitude,
        toLoc.longitude
      );
      return meters < 1000
        ? meters.toFixed(0) + " m"
        : kilometers.toFixed(2) + " km";
    }
    return "Calculating...";
  }, [driverRideState]);

  const calculateTimeToDestination = useMemo(() => {
    if (
      driverRideState.status === "bid_accepted_starting_ride" &&
      driverRideState.confirmedRideDetails?.pickupLocation &&
      driverRideState.confirmedRideDetails?.dropoffLocation
    ) {
      const fromLoc = driverRideState.confirmedRideDetails.pickupLocation;
      const toLoc = driverRideState.confirmedRideDetails.dropoffLocation;
      const { kilometers } = getDistance(
        fromLoc.latitude,
        fromLoc.longitude,
        toLoc.latitude,
        toLoc.longitude
      );
      const averageSpeed = 30; // Average speed in km/h
      const timeInHours = kilometers / averageSpeed;
      const timeInMinutes = Math.round(timeInHours * 60);
      return timeInMinutes < 60
        ? timeInMinutes + " min"
        : Math.floor(timeInMinutes / 60) + " hr " + (timeInMinutes % 60) + " min";
    }
    return "Calculating...";
  }, [driverRideState]);

  useEffect(() => {
    if (driverRideState.confirmedRideDetails) {
      console.log(
        "RideAccept confirmedPickup:",
        driverRideState.confirmedRideDetails.pickupLocation
      );
      console.log(
        "RideAccept confirmedDropoff:",
        driverRideState.confirmedRideDetails.dropoffLocation
      );
    }
  }, [driverRideState]);

  const pickupLocationDetails =
    driverRideState.confirmedRideDetails?.pickupLocation;
  const dropoffLocationDetails =
    driverRideState.confirmedRideDetails?.dropoffLocation;

  const pickupCoords: [number, number] | undefined = pickupLocationDetails
    ? [pickupLocationDetails.longitude, pickupLocationDetails.latitude]
    : undefined;

  const dropoffCoords: [number, number] | undefined = dropoffLocationDetails
    ? [dropoffLocationDetails.longitude, dropoffLocationDetails.latitude]
    : undefined;

  if (!pickupLocationDetails || !dropoffLocationDetails) {
    return (
      <View style={styles.container}>
        <CustomText>Loading ride details...</CustomText>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Map
        pickupCoordinates={pickupCoords}
        destinationCoordinates={dropoffCoords}
        onMapLoaded={() => console.log("DriverActiveRideScreen: Map loaded")}
      />
      <BottomSheet
        handleStyle={styles.handle}
        handleIndicatorStyle={{ backgroundColor: Colors.text }}
        snapPoints={rideCompleted ? ["35%", "100%"] : ["30%", "60%", "100%"]}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          {rideCompleted && (
            <PaymentReceived
              amount={driverRideState.acceptedBid?.amount || 0}
              paymentMethod="Solana Pay"
            />
          )}
          <View style={modalStyles.modalContainer}>
            <RideAcceptDetails
              distance={calculatedDistance}
              time={calculateTimeToDestination}
            />
            <HomeUserCard
              name={driverRideState.riderInfo?.name || "Rider"}
              rating={driverRideState.riderInfo?.rating || 4.5}
              userImage={
                driverRideState.riderInfo?.userImage ||
                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&w=1000&q=80"
              }
            />
            <CallMsgButtons />
            <ModalRideDetails
              fare={driverRideState.acceptedBid?.amount!}
              showDistance={false}
              showFare={true}
              from={pickupLocationDetails}
              to={dropoffLocationDetails}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
      <View style={styles.buttons}>
        {!rideCompleted && (
          <AcceptRejectButtons
            showEndRide
            rejectFn={handleFinishRide}
            rejectTxt="FINISH & GO HOME"
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}
