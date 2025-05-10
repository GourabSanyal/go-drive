import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  RideRequest,
  DriverBid,
  BidSubmissionAckData,
  BidErrorData,
  BiddingClosedRideAssignedData,
  RideConfirmedToDriverData,
  RideFinalizedData,
  NewRideToBidOnEventData,
  RideDetailsInternal,
} from "../../src/types/socket";
import {
  primaryColor,
  errorColor,
  backgroundPrimary,
  textPrimary,
  textSecondary,
  inputBackground,
  inputBorderColor,
  cardBackground,
  successColor,
} from "../../src/theme/colors";
import { useSocket } from "../../src/hooks/useSocket";
import { socketClient } from "../../src/services/socket/client/socketClient";

const MODAL_INFO_TEXT = `When a new ride request is available, it will appear here.
You can then select a ride and submit your bid.
If your bid is selected, you'll be notified and taken to the active ride screen.`;

export default function DriverDashboardScreen() {
  const router = useRouter();
  const {
    isConnected,
    socketId,
    connect: connectSocket,
    disconnect: disconnectSocket,
    announceDriverReady,
    submitBid,
  } = useSocket();

  const [availableRideRequests, setAvailableRideRequests] = useState<
    RideRequest[]
  >([]);
  const [selectedRide, setSelectedRide] = useState<RideRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [submissionStatus, setSubmissionStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (isConnected && socketId) {
      announceDriverReady();
    }
  }, [isConnected, socketId, announceDriverReady]);

  useEffect(() => {
    const handleNewRideToBidOn = (data: NewRideToBidOnEventData) => {
      console.log(
        "Driver App: Received new_ride_to_bid_on (structured):",
        JSON.stringify(data)
      );

      const newRideForState: RideRequest = {
        rideId: data.rideId,
        bidding_room_id: data.bidding_room_id,
        rideDetails: data.rideDetails,
      };

      console.log(
        "Driver App: Storing new object in state (with nested rideDetails):",
        JSON.stringify(newRideForState)
      );

      setAvailableRideRequests((prevRequests) => {
        const existingIndex = prevRequests.findIndex(
          (r) => r.rideId === newRideForState.rideId
        );
        if (existingIndex !== -1) {
          const updatedRequests = [...prevRequests];
          updatedRequests[existingIndex] = newRideForState;
          console.log(
            "Driver App: Updating existing ride in state:",
            JSON.stringify(updatedRequests)
          );
          return updatedRequests;
        }
        const newRequests = [...prevRequests, newRideForState];
        console.log(
          "Driver App: Adding new ride to state:",
          JSON.stringify(newRequests)
        );
        return newRequests;
      });
      setSubmissionStatus("");
    };

    const handleBidSubmissionAck = (ack: BidSubmissionAckData) => {
      console.log("Driver App: Bid submission acknowledged:", ack);
      setSubmissionStatus(`Bid submitted: ${ack.message}`);
      setIsSubmitting(false);
      setSelectedRide(null);
      setBidAmount("");
    };

    const handleBidError = (error: BidErrorData) => {
      console.error("Driver App: Bid submission error:", error);
      setSubmissionStatus(`Bid Error: ${error.message}`);
      setIsSubmitting(false);
    };

    const handleBiddingClosedRideAssigned = (
      data: BiddingClosedRideAssignedData
    ) => {
      console.log("Driver App: Bidding closed for ride:", data.rideId);
      setAvailableRideRequests((prevRequests) =>
        prevRequests.filter((r) => r.rideId !== data.rideId)
      );
      if (selectedRide?.rideId === data.rideId) {
        setSelectedRide(null);
        setBidAmount("");
        setSubmissionStatus(data.message);
      }
    };

    const handleRideConfirmedToDriver = (data: RideConfirmedToDriverData) => {
      console.log("Driver App: Ride confirmed to driver:", data);
      if (data.message) {
        setSubmissionStatus(data.message);
      }
      router.push({
        pathname: "/DriverActiveRideScreen",
        params: {
          rideId: data.rideId,
          active_ride_room_id: data.active_ride_room_id,
          riderId: data.riderId,
          rideDetails: JSON.stringify(data.rideDetails || {}),
        },
      });
    };

    const handleRideFinalized = (data: RideFinalizedData) => {
      console.log("Driver App: Ride finalized by server:", data);
      setSubmissionStatus(data.message);
      setAvailableRideRequests((prevRequests) =>
        prevRequests.filter((r) => r.rideId !== data.rideId)
      );
      if (selectedRide?.rideId === data.rideId) {
        setSelectedRide(null);
      }
    };

    socketClient.on("new_ride_to_bid_on", handleNewRideToBidOn);
    socketClient.on("bid_submission_ack", handleBidSubmissionAck);
    socketClient.on("bid_error", handleBidError);
    socketClient.on(
      "bidding_closed_ride_assigned",
      handleBiddingClosedRideAssigned
    );
    socketClient.on("ride_confirmed_to_driver", handleRideConfirmedToDriver);
    socketClient.on("ride_finalized", handleRideFinalized);

    return () => {
      socketClient.off("new_ride_to_bid_on", handleNewRideToBidOn);
      socketClient.off("bid_submission_ack", handleBidSubmissionAck);
      socketClient.off("bid_error", handleBidError);
      socketClient.off(
        "bidding_closed_ride_assigned",
        handleBiddingClosedRideAssigned
      );
      socketClient.off("ride_confirmed_to_driver", handleRideConfirmedToDriver);
      socketClient.off("ride_finalized", handleRideFinalized);
    };
  }, [selectedRide, router]);

  const handleSelectRide = (ride: RideRequest) => {
    setSelectedRide(ride);
    setBidAmount("");
    setSubmissionStatus("");
  };

  const handleSubmitBid = async () => {
    if (!selectedRide || !bidAmount) {
      setSubmissionStatus("Please select a ride and enter a bid amount.");
      return;
    }
    const numericBidAmount = parseFloat(bidAmount);
    if (isNaN(numericBidAmount) || numericBidAmount <= 0) {
      setSubmissionStatus("Please enter a valid positive bid amount.");
      return;
    }

    if (!isConnected || !socketId) {
      setSubmissionStatus("Not connected. Please connect first.");
      Alert.alert("Connection Error", "Not connected. Please connect first.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus("Submitting bid...");

    const bidDetails: DriverBid = {
      rideId: selectedRide.rideId,
      driverId: socketId,
      bidAmount: numericBidAmount,
    };

    try {
      await submitBid(
        selectedRide.rideId,
        selectedRide.bidding_room_id,
        bidDetails
      );
    } catch (error) {
      console.error("Driver App: Error in submitBid call:", error);
      setSubmissionStatus(
        `Failed to submit bid: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsSubmitting(false);
    }
  };

  const renderRideItem = ({ item }: { item: RideRequest }) => {
    console.log(
      `Driver App: renderRideItem for rideId ${item.rideId}, Details:`,
      JSON.stringify(item.rideDetails)
    );

    const { pickupLocation, dropoffLocation, bidAmount } = item.rideDetails;

    return (
      <TouchableOpacity
        style={[
          styles.rideItem,
          selectedRide?.rideId === item.rideId && styles.selectedRideItem,
        ]}
        onPress={() => handleSelectRide(item)}
      >
        <Text style={styles.rideTextBold}>
          Ride ID: ...{item.rideId.slice(-6)}
        </Text>
        <Text style={styles.rideText}>
          Pickup:{" "}
          {pickupLocation?.address
            ? pickupLocation.address
            : pickupLocation?.address === ""
            ? "Empty String"
            : "Address Undefined/Missing"}
        </Text>
        <Text style={styles.rideText}>
          Dropoff:{" "}
          {dropoffLocation?.address
            ? dropoffLocation.address
            : dropoffLocation?.address === ""
            ? "Empty String"
            : "Address Undefined/Missing"}
        </Text>
        <Text style={styles.rideTextSubtle}>
          Rider's Initial Offer: ${bidAmount?.toFixed(2) || "N/A"}
        </Text>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerFooterContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={styles.infoIconContainer}
        >
          <FontAwesome name="info-circle" size={26} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.connectionStatusBox}>
        <Text style={styles.connectionText}>
          Status:{" "}
          <Text
            style={{
              color: isConnected ? successColor : errorColor,
              fontWeight: "bold",
            }}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Text>
        </Text>
        <Text style={styles.connectionTextSmall}>
          Socket ID: {socketId || "N/A"}
        </Text>
        {!isConnected && (
          <TouchableOpacity
            style={[styles.buttonStyle, styles.connectButtonMargin]}
            onPress={connectSocket}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonTextStyle}>Connect</Text>
          </TouchableOpacity>
        )}
        {isConnected && (
          <TouchableOpacity
            style={[
              styles.buttonStyle,
              styles.disconnectButtonBackground,
              styles.connectButtonMargin,
            ]}
            onPress={disconnectSocket}
          >
            <Text style={styles.buttonTextStyle}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>
      {availableRideRequests.length === 0 && !selectedRide && (
        <View style={styles.noRidesContainer}>
          <FontAwesome
            name="car"
            size={48}
            color={textSecondary}
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.noRidesText}>No available ride requests.</Text>
          <Text style={styles.noRidesSubText}>
            New requests will appear here automatically.
          </Text>
        </View>
      )}
    </View>
  );

  const ListFooter = () => (
    <View style={styles.headerFooterContainer}>
      {selectedRide && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.bidSectionBox}
        >
          <Text style={styles.selectedRideTitle}>
            Bidding on Ride: ...{selectedRide.rideId.slice(-6)}
          </Text>
          <Text style={styles.detailTextStrong}>
            From:{" "}
            {selectedRide.rideDetails.pickupLocation?.address
              ? selectedRide.rideDetails.pickupLocation.address
              : "N/A"}
          </Text>
          <Text style={styles.detailTextStrong}>
            To:{" "}
            {selectedRide.rideDetails.dropoffLocation?.address
              ? selectedRide.rideDetails.dropoffLocation.address
              : "N/A"}
          </Text>

          <TextInput
            style={styles.inputField}
            placeholder="Enter your bid (e.g., 15.50)"
            placeholderTextColor={textSecondary}
            value={bidAmount}
            onChangeText={setBidAmount}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              styles.buttonStyle,
              isSubmitting && styles.disabledButtonLook,
            ]}
            onPress={handleSubmitBid}
            disabled={isSubmitting || !bidAmount}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={textPrimary} />
            ) : (
              <Text style={styles.buttonTextStyle}>
                Submit Bid for ${parseFloat(bidAmount || "0").toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonStyle,
              styles.cancelButtonBackground,
              { marginTop: 8 },
            ]}
            onPress={() => setSelectedRide(null)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonTextStyle}>Cancel</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}
      {submissionStatus ? (
        <Text
          style={[
            styles.submissionStatusText,
            submissionStatus.includes("Error") ||
            submissionStatus.includes("Failed") ||
            submissionStatus.includes("expired")
              ? styles.errorTextBackground
              : styles.successTextBackground,
          ]}
        >
          {submissionStatus}
        </Text>
      ) : null}
      {showInfoModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitleText}>How It Works</Text>
            <Text style={styles.modalBodyText}>{MODAL_INFO_TEXT}</Text>
            <TouchableOpacity
              style={[styles.buttonStyle, styles.modalCloseButton]}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.buttonTextStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={availableRideRequests}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.rideId}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listLayoutContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: backgroundPrimary,
  },
  listLayoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerFooterContainer: {
    paddingVertical: 10,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: textPrimary,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue-Bold" : "Roboto-Bold",
  },
  infoIconContainer: {
    padding: 8,
  },
  connectionStatusBox: {
    backgroundColor: cardBackground,
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: inputBorderColor,
  },
  connectionText: {
    fontSize: 17,
    color: textPrimary,
    marginBottom: 6,
    fontFamily:
      Platform.OS === "ios" ? "HelveticaNeue-Medium" : "Roboto-Medium",
  },
  connectionTextSmall: {
    fontSize: 13,
    color: textSecondary,
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue-Light" : "Roboto-Light",
  },
  noRidesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    marginTop: 20,
    backgroundColor: cardBackground,
    borderRadius: 12,
  },
  noRidesText: {
    textAlign: "center",
    fontSize: 19,
    fontWeight: "600",
    color: textPrimary,
    fontFamily:
      Platform.OS === "ios" ? "HelveticaNeue-Medium" : "Roboto-Medium",
  },
  noRidesSubText: {
    textAlign: "center",
    fontSize: 15,
    color: textSecondary,
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue" : "Roboto",
  },
  rideItem: {
    backgroundColor: cardBackground,
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: inputBorderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedRideItem: {
    borderColor: primaryColor,
    borderWidth: 2,
    shadowColor: primaryColor,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  rideTextBold: {
    fontSize: 17,
    fontWeight: "bold",
    color: textPrimary,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue-Bold" : "Roboto-Bold",
  },
  rideText: {
    fontSize: 15,
    color: textSecondary,
    marginBottom: 5,
    lineHeight: 21,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue" : "Roboto",
  },
  rideTextSubtle: {
    fontSize: 14,
    color: textSecondary,
    fontStyle: "italic",
    marginTop: 6,
    fontFamily:
      Platform.OS === "ios" ? "HelveticaNeue-Italic" : "Roboto-Italic",
  },
  bidSectionBox: {
    marginTop: 10,
    padding: 22,
    backgroundColor: cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: inputBorderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedRideTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: primaryColor,
    marginBottom: 16,
    textAlign: "center",
    fontFamily:
      Platform.OS === "ios" ? "HelveticaNeue-Medium" : "Roboto-Medium",
  },
  detailTextStrong: {
    fontSize: 16,
    color: textPrimary,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue" : "Roboto",
  },
  inputField: {
    backgroundColor: inputBackground,
    color: textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: inputBorderColor,
    marginBottom: 18,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue" : "Roboto",
  },
  buttonStyle: {
    backgroundColor: primaryColor,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  connectButtonMargin: {
    marginTop: 12,
  },
  disconnectButtonBackground: {
    backgroundColor: errorColor,
  },
  cancelButtonBackground: {
    backgroundColor: textSecondary,
  },
  buttonTextStyle: {
    color: textPrimary,
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue-Bold" : "Roboto-Bold",
  },
  disabledButtonLook: {
    backgroundColor: "#555555",
    opacity: 0.7,
  },
  submissionStatusText: {
    marginTop: 18,
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontFamily:
      Platform.OS === "ios" ? "HelveticaNeue-Medium" : "Roboto-Medium",
  },
  errorTextBackground: {
    color: "#FFFFFF",
    backgroundColor: errorColor,
  },
  successTextBackground: {
    color: "#FFFFFF",
    backgroundColor: successColor,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalView: {
    backgroundColor: cardBackground,
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 15,
    width: "90%",
    maxWidth: 380,
    alignItems: "center",
    borderWidth: 1,
    borderColor: inputBorderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: textPrimary,
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue-Bold" : "Roboto-Bold",
  },
  modalBodyText: {
    fontSize: 16,
    color: textSecondary,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue" : "Roboto",
  },
  modalCloseButton: {
    width: "100%",
    marginTop: 10,
    backgroundColor: primaryColor,
  },
});
