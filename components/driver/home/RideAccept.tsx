import { modalStyles, RideAcceptStyles as styles } from './styles'
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import HomeUserCard from './HomeUserCard';
import ModalRideDetails from './ModalRideDetails';
import AcceptRejectButtons from './AcceptRejectButtons';
import { useRouter } from 'expo-router';
import RideAcceptDetails from './RideAcceptDetails';
import CallMsgButtons from './CallMsgButtons';
import { Colors } from '@/theme/colors';
import Map from './Map';
import PaymentReceived from './PaymentReceived';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1Ijoicm9uaXQtZ2hvc2giLCJhIjoiY21hcXV1NHIzMDRidzJrc2ZyaXBydzVicyJ9.3AOl4Z8OgeNXq2On3wKgBw');

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
    confirmedRideDetails?: any;
    riderInfo?: any;
    acceptedBid?: { amount: number; currency: string };
}

export default function RideAccept({
    rideId,
    activeRideRoomId,
    driverRideState
}: {
    rideId: string | string[]
    activeRideRoomId: string | string[]
    driverRideState: DriverAppRideState
}) {
    const router = useRouter()
    const [rideStarted, setRideStarted] = useState(false)
    const [rideCompleted, setRideCompleted] = useState(false)
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [from, setFrom] = useState<string>("")
    const [to, setTo] = useState<string>("")
    const [distance, setDistance] = useState<string>()
    const [error, setError] = useState<string>("")

    const handleSheetChanges = useCallback((index: number) => { }, []);

    const handleAcceptRide = () => setRideStarted(true)
    const handleEndRide = () => {
        if (rideStarted) {
            setRideCompleted(true)
        }
    }
    const handleFinishRide = () => router.navigate("/driver/(tabs)/home")

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }

    function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Radius of the Earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;
        const distanceMeters = distanceKm * 1000;

        return {
            kilometers: distanceKm,
            meters: distanceMeters
        };
    }

    useEffect(() => {
        if (driverRideState.activeRideId === rideId) {
            // @ts-ignore
            setFrom(driverRideState.confirmedRideDetails.pickupLocation)
            console.log(driverRideState.confirmedRideDetails.pickupLocation)
            // @ts-ignore
            setTo(driverRideState.confirmedRideDetails.dropoffLocation)

            const { meters, kilometers } = getDistance(// @ts-ignore
                from.latitude, from.longitude, to.latitude, to.longitude
            )

            meters < 1000 ? setDistance(meters.toFixed(2) + " m") : setDistance(kilometers.toFixed(2) + " km")
        }
    }, [driverRideState])

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* <Map /> */}
            <View style={cstyles.page}>
                <View style={cstyles.container}>
                    <Mapbox.MapView style={cstyles.map} />
                </View>
            </View>
            <BottomSheet
                handleStyle={styles.handle}
                handleIndicatorStyle={{ backgroundColor: Colors.text }}
                snapPoints={rideCompleted ? ["35%", "100%"] : ["30%", '60%', '100%']}
                ref={bottomSheetRef}
                onChange={handleSheetChanges}>
                <BottomSheetView style={styles.contentContainer}>
                    {rideCompleted && <PaymentReceived
                        amount={142}
                        paymentMethod='MetaMask'
                    />}
                    <View style={modalStyles.modalContainer}>
                        <RideAcceptDetails
                            // @ts-ignore
                            distance={distance}
                            time='1200m'
                        />
                        <HomeUserCard
                            name='John Doe'
                            rating={4.4}
                            userImage='https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&w=1000&q=80'
                        />
                        <CallMsgButtons />
                        <ModalRideDetails
                            fare={162}
                            showDistance={false}
                            showFare={false}
                            // @ts-ignore
                            from={from}
                            // @ts-ignore
                            to={to}
                        />
                    </View>
                </BottomSheetView>
            </BottomSheet>
            <View style={styles.buttons}>
                {!rideCompleted ?
                    <AcceptRejectButtons
                        showEndRide={rideStarted}
                        rejectFn={handleEndRide}
                        acceptFn={handleAcceptRide}
                        acceptTxt='Start ride'
                        rejectTxt='End ride'
                    /> :
                    <AcceptRejectButtons
                        showEndRide={rideStarted}
                        rejectFn={handleFinishRide}
                        acceptTxt=''
                        rejectTxt='Finish ride'
                    />
                }
            </View>
        </GestureHandlerRootView>
    )
}

const cstyles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        height: 300,
        width: 300,
    },
    map: {
        flex: 1
    }
});