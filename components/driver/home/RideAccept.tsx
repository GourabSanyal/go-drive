import { modalStyles, RideAcceptStyles as styles } from './styles'
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
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
import { useSocket } from '@/src/hooks/useSocket';

export default function RideAccept() {
    const router = useRouter()
    const { isConnected,  notifyRideCompleted } = useSocket()
    const [rideStarted, setRideStarted] = useState(false)
    const [rideCompleted, setRideCompleted] = useState(false)
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleSheetChanges = useCallback((index: number) => {

    }, []);

    const handleAcceptRide = () => setRideStarted(true)
    const handleEndRide = () => {
        if (rideStarted) {
            setRideCompleted(true)
        }
    }
    const handleFinishRide = () => router.replace("/driver/home")

    return (
        <GestureHandlerRootView style={styles.container}>
            <Map />
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
                            distance="800m"
                            time='12m'
                        />
                        <HomeUserCard
                            rating={4.4}
                            userImage='https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&w=1000&q=80'
                        />
                        <CallMsgButtons />
                        <ModalRideDetails
                            showDistance={false}
                            showFare={false}
                            from='Bangalore Fort, Bangalore, Karnataka, India'
                            to='Lalbagh Botanical Garden, Bangalore, Karnataka, India'
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
                        acceptTxt='Accept ride'
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
