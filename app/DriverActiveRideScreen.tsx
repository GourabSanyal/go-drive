import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocket } from "../src/hooks/useSocket";
import { primaryColor, errorColor } from "../src/theme/colors";

const DriverActiveRideScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentRideState, isConnected, sendLocation, notifyRideCompleted } =
    useSocket();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.rideId || !params.activeRideRoomId) {
      console.error("DriverActiveRideScreen: Missing required params!");
      Alert.alert("Error", "Ride details not found. Navigating back.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }

    console.log("DriverActiveRideScreen mounted with params:", params);

    // Validate that we're tracking the correct ride
    if (currentRideState.rideId && currentRideState.rideId !== params.rideId) {
      Alert.alert(
        "Ride Status Changed",
        "This ride is no longer active. Navigating back.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [currentRideState, router, params]);

  // Effect to handle ride completion
  useEffect(() => {
    if (currentRideState.status === "completed") {
      Alert.alert(
        "Ride Completed",
        "The ride has been completed successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [currentRideState.status, router]);

  const handleSendLocation = () => {
    // Get current location from device
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
            notifyRideCompleted();
          },
        },
      ]
    );
  };

  if (!params.rideId || !params.activeRideRoomId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text>Loading ride details...</Text>
      </View>
    );
  }

  if (
    currentRideState.rideId &&
    currentRideState.rideId !== params.rideId &&
    currentRideState.status !== "idle"
  ) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          This ride is no longer active or has been superseded.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Active Ride</Text>
      <Text style={styles.subtitle}>Ride ID: {params.rideId}</Text>

      <View style={styles.rideInfoContainer}>
        <Text style={styles.sectionTitle}>Ride Details:</Text>
        <Text style={styles.infoText}>
          From: {currentRideState.rideDetails?.pickupLocation?.address || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          To: {currentRideState.rideDetails?.dropoffLocation?.address || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          Fare: {currentRideState.rideDetails?.fare?.baseFare || "N/A"}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendLocation}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Send Location Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={handleCompleteRide}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Complete Ride</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
