import CustomButton from '@/components/ui/CustomButton';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { Modal, Portal } from 'react-native-paper';
import { modalStyles as styles } from './styles';
import { NativeSyntheticEvent, ScrollView, TextInput, TextInputChangeEventData, View } from 'react-native';
import HomeUserCard, { HomeUserCardProps } from './HomeUserCard';
import ModalRideDetails, { ModalRideDetailsProps } from './ModalRideDetails';
import { useRouter } from 'expo-router';
import AcceptRejectButtons from './AcceptRejectButtons';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { Colors } from '@/theme/colors';

export interface HomeModalProps extends HomeUserCardProps, ModalRideDetailsProps {
  showModal?: boolean
  handleRejectRide: () => void
  handleSubmitBid: () => void
  setBidAmount: Dispatch<SetStateAction<string>>
  bidAmount: string
  isSubmitting: boolean
  fare: number
  submissionStatus: string
}

const HomeModal: FC<HomeModalProps> = ({
  rating,
  userImage,
  from,
  to,
  showModal = false,
  handleRejectRide,
  handleSubmitBid,
  name,
  setBidAmount,
  bidAmount,
  isSubmitting,
  fare,
  submissionStatus
}) => {
  const router = useRouter()
  const [rideAccepted, setRideAccepted] = useState(false)

  const handleAcceptRide = () => setRideAccepted(true)

  const handleInputChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
    setBidAmount(e.nativeEvent.text)
  }

  const keyboard = useAnimatedKeyboard()
  const animatedKeyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value / 2 }]
  }))

  return (
    <Portal>
      <Modal
        visible={showModal}
        onDismiss={handleRejectRide}
        contentContainerStyle={styles.modalContainer}>
        <Animated.ScrollView style={styles.container}>
          <View style={styles.modalContainer}>
            <HomeUserCard
              name={name}
              userImage={userImage}
              rating={rating}
            />
            <ModalRideDetails
              from={from}
              to={to}
              fare={fare}
              showDistance
              showFare={false}
            />
            {rideAccepted ? <Animated.View style={[{
              gap: 10,
              marginTop: 10,
              backgroundColor: "#111",
              padding: 10,
              borderRadius: 10
            }, animatedKeyboardStyle]}>
              <TextInput
                onChange={handleInputChange}
                style={{
                  borderWidth: 1,
                  borderColor: "#fff",
                  borderRadius: 8,
                  color: "#fff",
                  paddingHorizontal: 10,
                  fontFamily: "MontserratMedium",
                  height: 40
                }}
                placeholderTextColor="#fff"
                placeholder='Enter your bid amount'
              />
              <CustomButton
                disabled={isSubmitting || !bidAmount || submissionStatus === "Submitting bid..."}
                onPress={handleSubmitBid}
                size='small'
                variant='h8'>
                {/* {isSubmitting ? "Submitting" : "Submit your bid"} */}
                {submissionStatus === "Submitting bid..." || isSubmitting ? "Submitting..." : "Submit your bid"}
              </CustomButton>
            </Animated.View> :
              <AcceptRejectButtons
                acceptFn={handleAcceptRide}
                rejectFn={handleRejectRide}
                acceptTxt='Accept Ride'
                rejectTxt='Reject Ride'
              />}
          </View>
        </Animated.ScrollView>
      </Modal>
    </Portal>
  );
}

export default HomeModal