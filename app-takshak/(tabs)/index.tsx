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
import { QuotationRequest } from "../../src/types/quotation.types";
import { BidSubmitPayload } from "../../src/types/bid.types";
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
    announceDriverAvailability,
    submitDriverBid,
    availableQuotations,
    driverRideState,
  } = useSocket();

  const [selectedQuotation, setSelectedQuotation] =
    useState<QuotationRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [estimatedArrivalTime, setEstimatedArrivalTime] =
    useState<string>("5 mins");
  const [submissionStatus, setSubmissionStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (isConnected && socketId) {
      announceDriverAvailability(true);
    }
  }, [isConnected, socketId, announceDriverAvailability]);

  useEffect(() => {
    if (
      driverRideState.status === "bid_accepted_starting_ride" &&
      driverRideState.activeRideId &&
      driverRideState.activeRideRoomId
    ) {
      console.log("Driver App: Ride confirmed via hook state, navigating...");
      router.push({
        pathname: "/DriverActiveRideScreen",
        params: {
          rideId: driverRideState.activeRideId,
          activeRideRoomId: driverRideState.activeRideRoomId,
        },
      });
    } else if (
      driverRideState.status === "ride_completed" ||
      driverRideState.status === "error"
    ) {
      if (router.canGoBack()) {
        // Check if current route is DriverActiveRideScreen to avoid navigating from other screens unnecessarily
        // This check might be too simplistic depending on your navigation structure.
        // A more robust way might involve checking the current route name from navigation state if available.
        // For now, if it can go back and state is completed/error, it implies it might be on active ride screen.
        // Consider if (currentRouteName === 'DriverActiveRideScreen') router.replace('/(tabs)/');
      }
    } else if (driverRideState.status === "bidding_in_progress") {
      setSubmissionStatus("Submitting bid...");
      setIsSubmitting(true);
    } else if (
      driverRideState.status === "viewing_quotations" &&
      isSubmitting
    ) {
      setIsSubmitting(false);
    }
  }, [driverRideState, router, isSubmitting]);

  const handleSelectRide = (ride: QuotationRequest) => {
    setSelectedQuotation(ride);
    setBidAmount("");
    setSubmissionStatus("");
  };

  const handleSubmitBid = async () => {
    if (!selectedQuotation || !bidAmount) {
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

    const bidPayload: BidSubmitPayload = {
      quotationRequestId: selectedQuotation.id,
      driverId: socketId,
      bidAmount: numericBidAmount,
      currency: "USD",
      estimatedArrivalTime: estimatedArrivalTime,
      // TODO: Replace hardcoded driver details with actual authenticated driver profile data
      vehicleDetails: "Toyota Camry - ABC 123",
      driverName: "John Doe (Driver)",
      driverRating: 4.8,
    };

    try {
      await submitDriverBid(bidPayload);
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

  const renderRideItem = ({ item }: { item: QuotationRequest }) => {
    console.log(
      `Driver App: renderRideItem for id ${item.id}, Details:`,
      JSON.stringify(item)
    );

    const {
      pickupLocation,
      dropoffLocation,
      userName,
      requestedAt,
      fareOffer,
    } = item;

    return (
      <TouchableOpacity
        style={[
          styles.rideItem,
          selectedQuotation?.id === item.id && styles.selectedRideItem,
        ]}
        onPress={() => handleSelectRide(item)}
      >
        <Text style={styles.rideTextBold}>Ride ID: ...{item.id.slice(-6)}</Text>
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
        {userName && (
          <Text style={styles.rideTextSubtle}>Requester: {userName}</Text>
        )}
        {fareOffer && (
          <Text style={styles.rideTextSubtle}>
            Rider Offer: {fareOffer.amount} {fareOffer.currency}
          </Text>
        )}
        <Text style={styles.rideTextSubtle}>
          Requested: {new Date(requestedAt).toLocaleTimeString()}
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
      {availableQuotations.length === 0 && !selectedQuotation && (
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
      {selectedQuotation && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.bidSectionBox}
        >
          <Text style={styles.selectedRideTitle}>
            Bidding on Ride: ...{selectedQuotation.id.slice(-6)}
          </Text>
          <Text style={styles.detailTextStrong}>
            From:{" "}
            {selectedQuotation.pickupLocation?.address
              ? selectedQuotation.pickupLocation.address
              : "N/A"}
          </Text>
          <Text style={styles.detailTextStrong}>
            To:{" "}
            {selectedQuotation.dropoffLocation?.address
              ? selectedQuotation.dropoffLocation.address
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
            onPress={() => setSelectedQuotation(null)}
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
        data={availableQuotations}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
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
