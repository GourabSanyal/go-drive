import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocket } from "../src/hooks/useSocket";
import { primaryColor, errorColor } from "../src/theme/colors";
import DriverMap from "../components/DriverMap";

const screenHeight = Dimensions.get("window").height;

const DriverActiveRideScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { driverRideState, isConnected, sendLocation, completeRide } =
    useSocket();

  const currentRideState = driverRideState;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rideIdFromParams = params.rideId as string | undefined;
  const activeRideRoomIdFromParams = params.activeRideRoomId as
    | string
    | undefined;

  useEffect(() => {
    if (!rideIdFromParams || !activeRideRoomIdFromParams) {
      console.error("DriverActiveRideScreen: Missing required params!");
      Alert.alert("Error", "Ride details not found. Navigating back.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setIsLoading(false);
      return;
    }

    console.log("DriverActiveRideScreen mounted with params:", params);

    if (currentRideState) {
      console.log(
        "DriverActiveRideScreen currentRideState on mount/update:",
        JSON.stringify(currentRideState)
      );
      if (
        currentRideState.activeRideId &&
        currentRideState.activeRideId !== rideIdFromParams &&
        currentRideState.status !== "ride_completed" &&
        currentRideState.status !== "error"
      ) {
        Alert.alert(
          "Ride Status Changed",
          "This ride is no longer active or you've been assigned a different one. Navigating back.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        setIsLoading(false);
        return;
      }

      if (
        currentRideState.status === "bid_accepted_starting_ride" ||
        currentRideState.status === "ride_in_progress"
      ) {
        if (currentRideState.activeRideId === rideIdFromParams) {
          setIsLoading(false);
          setError(null);
        } else if (
          currentRideState.status === "bid_accepted_starting_ride" &&
          !currentRideState.activeRideId
        ) {
          console.log(
            "DriverActiveRideScreen: currentRideState status is bid_accepted_starting_ride, but activeRideId not yet set or doesn't match params. Waiting for sync."
          );
          setIsLoading(true);
        }
      } else if (
        currentRideState.status === "idle" ||
        currentRideState.status === "viewing_quotations" ||
        currentRideState.status === "bidding_in_progress"
      ) {
        console.warn(
          `DriverActiveRideScreen: Unexpected ride status: ${currentRideState.status} for ride ${rideIdFromParams}. Waiting for correct state or navigating back if stale.`
        );
        setIsLoading(true);
      } else if (
        currentRideState.status === "ride_completed" &&
        currentRideState.activeRideId === rideIdFromParams
      ) {
        setIsLoading(false);
      } else if (currentRideState.status === "error") {
        console.warn(
          `DriverActiveRideScreen: Received error state for ride ${rideIdFromParams}: ${currentRideState.errorMessage}`
        );
        setIsLoading(false);
        setError(currentRideState.errorMessage || "An unknown error occurred.");
      }
    } else {
      console.log(
        "DriverActiveRideScreen: currentRideState is not yet available from useSocket. Loading..."
      );
      setIsLoading(true);
    }
  }, [currentRideState, rideIdFromParams, activeRideRoomIdFromParams, router]);

  useEffect(() => {
    if (currentRideState && currentRideState.status === "ride_completed") {
      if (currentRideState.activeRideId === rideIdFromParams) {
        Alert.alert(
          "Ride Completed",
          "The ride has been completed successfully!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/" as any),
            },
          ]
        );
      }
    }
  }, [currentRideState, rideIdFromParams, router]);

  const handleSendLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        Alert.alert("Success", "Location sent successfully");
      },
      (error) => {
        Alert.alert("Error", "Failed to get location: " + error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const handleCompleteRide = () => {
    Alert.alert(
      "Complete Ride",
      "Are you sure you want to mark this ride as completed?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          onPress: () => {
            completeRide();
          },
        },
      ]
    );
  };

  if (!rideIdFromParams || !activeRideRoomIdFromParams) {
    return (
      <View style={styles.centered}>
        <Text>Missing ride information.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text>Loading active ride details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/" as any)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (
    !currentRideState ||
    currentRideState.activeRideId !== rideIdFromParams ||
    (currentRideState.status !== "bid_accepted_starting_ride" &&
      currentRideState.status !== "ride_in_progress" &&
      currentRideState.status !== "ride_completed")
  ) {
    if (
      currentRideState &&
      currentRideState.status === "ride_completed" &&
      currentRideState.activeRideId === rideIdFromParams
    ) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text>Finalizing ride completion...</Text>
        </View>
      );
    }
    console.warn(
      "DriverActiveRideScreen: Invalid state or mismatched rideId. Displaying fallback UI.",
      JSON.stringify(currentRideState),
      "Params rideId:",
      rideIdFromParams
    );
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          There was an issue loading your ride details, the ride is no longer
          active, or the state is unexpected.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/" as any)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { confirmedRideDetails, riderInfo } = currentRideState;

  console.log(
    "[DriverActiveRideScreen] Rendering. Current currentRideState:",
    JSON.stringify(currentRideState),
    "isLoading:",
    isLoading
  );

  // Prepare coordinates for the map
  const pickupCoords: [number, number] | undefined =
    confirmedRideDetails?.pickupLocation
      ? [
          confirmedRideDetails.pickupLocation.longitude,
          confirmedRideDetails.pickupLocation.latitude,
        ]
      : undefined;

  const dropoffCoords: [number, number] | undefined =
    confirmedRideDetails?.dropoffLocation
      ? [
          confirmedRideDetails.dropoffLocation.longitude,
          confirmedRideDetails.dropoffLocation.latitude,
        ]
      : undefined;

  // TODO: Get actual driver's current location, e.g., from UserLocation component or state
  // For now, DriverMap's UserLocation component will show the puck.
  // If you want to pass a specific marker for driver's location:
  // const [driverCurrentLocation, setDriverCurrentLocation] = useState<[number, number] | undefined>();

  return (
    <View style={styles.screenContainer}>
      <View style={styles.mapContainer}>
        <DriverMap
          pickupCoordinates={pickupCoords}
          destinationCoordinates={dropoffCoords}
          // driverLocation={driverCurrentLocation} // Pass this if you manage driver's location state here
          onMapLoaded={() => console.log("DriverActiveRideScreen: Map loaded")}
        />
      </View>
      <ScrollView
        style={styles.detailsScrollViewContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.title}>Active Ride</Text>
        <Text style={styles.subtitle}>Ride ID: {rideIdFromParams}</Text>

        <View style={styles.rideInfoContainer}>
          <Text style={styles.sectionTitle}>Ride Details:</Text>
          <Text style={styles.infoText}>
            From: {confirmedRideDetails?.pickupLocation?.address || "N/A"}
          </Text>
          <Text style={styles.infoText}>
            To: {confirmedRideDetails?.dropoffLocation?.address || "N/A"}
          </Text>
          <Text style={styles.infoText}>
            Fare:{" "}
            {currentRideState.acceptedBid
              ? `${currentRideState.acceptedBid.amount.toFixed(2)} ${
                  currentRideState.acceptedBid.currency
                }`
              : confirmedRideDetails?.fareOffer?.amount
              ? `${confirmedRideDetails.fareOffer.amount.toFixed(2)} ${
                  confirmedRideDetails.fareOffer.currency
                }`
              : "N/A"}
          </Text>
        </View>

        {riderInfo && (
          <View style={styles.rideInfoContainer}>
            <Text style={styles.sectionTitle}>Rider Information:</Text>
            <Text style={styles.infoText}>Name: {riderInfo.name || "N/A"}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendLocation}
            disabled={
              !isConnected || currentRideState.status !== "ride_in_progress"
            }
          >
            <Text style={styles.buttonText}>Send Location Update</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={handleCompleteRide}
            disabled={
              !isConnected || currentRideState.status !== "ride_in_progress"
            }
          >
            <Text style={styles.buttonText}>Complete Ride</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  mapContainer: {
    height: screenHeight * 0.4,
    width: "100%",
  },
  detailsScrollViewContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  container: {
    backgroundColor: "#f0f0f0",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: primaryColor,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    color: "#666",
  },
  rideInfoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 16,
  },
  button: {
    backgroundColor: primaryColor,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 4,
    color: "#444",
  },
  errorText: {
    color: errorColor,
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
});

export default DriverActiveRideScreen;
