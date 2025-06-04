import { CommonStyles } from '../styles'
import { HomeStyles as styles } from './styles'
import UpcomingRideBanner from './UpcomingRideBanner'
import { Alert, FlatList, View } from 'react-native'
import { RelativePathString, useRouter } from 'expo-router'
import { useSocket } from '@/src/hooks/useSocket'
import { useEffect, useState } from 'react'
import { QuotationRequest } from '@/src/types/quotation.types'
import { BidSubmitPayload } from '@/src/types/bid.types'
import CustomText from '@/components/ui/CustomText'
import HomeModal from './HomeModal'
import * as Location from "expo-location"
import { storage } from '@/src/utils/storage/mmkv'
import firestore, { addDoc, collection, getFirestore } from "@react-native-firebase/firestore"
import { DriverAppRideState } from '@/src/contexts/SocketContext'
import { getAuth } from '@react-native-firebase/auth'

export default function Home() {
  const router = useRouter();

  const {
    isConnected,
    socketId,
    announceDriverAvailability,
    submitDriverBid,
    availableQuotations,
    driverRideState,
    sendLocation
  } = useSocket();

  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState<string>("5 mins");
  const [submissionStatus, setSubmissionStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [driverLocation, setDriverLocation] = useState<any>()
  const db = getFirestore()

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(res => {
      res.status !== "granted" && Alert.alert('Permission denied', 'Allow GoCabs to use your location to continue.')
    });

    if (isConnected && socketId) {
      announceDriverAvailability(true);
    }
  }, [isConnected, socketId, announceDriverAvailability]);

  const saveRideDataToFirestore = async (rideData: QuotationRequest, rideState: DriverAppRideState) => {
    try {
      console.log("🫱🫱started saving...")
      const userId = storage.getString("userId")
      const docRef = await addDoc(collection(db, 'rideDetails'), {
        rideId: rideState.activeRideId,
        dropoffLocation: rideData.dropoffLocation,
        pickupLocation: rideData.pickupLocation,
        selectedRiderInfo: rideState.riderInfo,
        status: rideState.status,
        amount: rideData.bidAmount,
        userId
      });
      console.log("Ride data saved with ID: ", docRef.id);
    } catch (error) {
      console.error("Error saving ride data: ", error);
    }
  };

  useEffect(() => {
    if (
      driverRideState.status === "bid_accepted_starting_ride" &&
      driverRideState.activeRideId &&
      driverRideState.activeRideRoomId
    ) {
      console.log("Driver App: Ride confirmed via hook state, navigating...");
      saveRideDataToFirestore(selectedQuotation!, driverRideState)

      router.push({
        pathname: "/driver/(home)/ride-accept" as RelativePathString,
        params: {
          rideId: driverRideState.activeRideId,
          activeRideRoomId: driverRideState.activeRideRoomId,
        },
      });
      setShowInfoModal(false)
      Location.getCurrentPositionAsync({}).then(res => {
        sendLocation({
          lat: res.coords.latitude,
          lon: res.coords.longitude,
          timestamp: Date.now().toLocaleString()
        })
      })

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
    setShowInfoModal(true)
    setBidAmount("");
    setSubmissionStatus("");
  };

  const handleRejectBid = () => {
    setSelectedQuotation(null)
    setShowInfoModal(false)
    setBidAmount("");
    setSubmissionStatus("");
  }

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

    const driverName = storage.getString("name");
    const bidPayload: BidSubmitPayload = {
      quotationRequestId: selectedQuotation.id,
      driverId: socketId,
      bidAmount: numericBidAmount,
      currency: "INR",
      estimatedArrivalTime: estimatedArrivalTime,
      // TODO: Replace hardcoded driver details with actual authenticated driver profile data
      vehicleDetails: "Toyota Camry - ABC 123",
      driverName: driverName!,
      driverRating: 4.8,
    };

    try {
      await submitDriverBid(bidPayload);
    } catch (error) {
      console.error("Driver App: Error in submitBid call:", error);
      setSubmissionStatus(
        `Failed to submit bid: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsSubmitting(false);
    }
  };

  return (
    <View style={CommonStyles.container}>
      {availableQuotations.length === 0 && !selectedQuotation ?
        <View style={styles.noRidesContainer}>
          <CustomText style={styles.noRidesText}>No available ride requests.</CustomText>
          <CustomText style={styles.noRidesSubText}>
            New requests will appear here automatically.
          </CustomText>
        </View> :
        <View style={{ height: 1000 }}>
          <FlatList
            data={availableQuotations}
            renderItem={({ item }) => (
              <View style={{ height: 200, marginBottom: 20 }}>
                <UpcomingRideBanner
                  onPress={() => handleSelectRide(item)}
                  time={item.requestedAt}
                  from={item.pickupLocation}
                  to={item.dropoffLocation}
                  vehicle={item.vehicleType}
                  fare={item.bidAmount!}
                />
              </View>
            )}
          />
        </View>}
      <HomeModal
        submissionStatus={submissionStatus}
        fare={selectedQuotation?.fareOffer?.amount!}
        setBidAmount={setBidAmount}
        bidAmount={bidAmount}
        isSubmitting={isSubmitting}
        name={selectedQuotation?.userName!}
        handleSubmitBid={handleSubmitBid}
        handleRejectRide={handleRejectBid}
        showModal={showInfoModal}
        from={selectedQuotation?.pickupLocation!}
        to={selectedQuotation?.dropoffLocation!}
        rating={4.4}
        userImage='https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&w=1000&q=80'
      />
      {/* <QuickActionGrid /> */}
      {/* <LocationPicker /> */}
    </View>
  )
}