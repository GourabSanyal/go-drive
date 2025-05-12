import CustomButton from '@/components/ui/CustomButton';
import { FC, useState } from 'react';
import { Modal, Portal } from 'react-native-paper';
import { modalStyles as styles } from './styles';
import { ScrollView, View } from 'react-native';
import HomeUserCard, { HomeUserCardProps } from './HomeUserCard';
import ModalRideDetails, { ModalRideDetailsProps } from './ModalRideDetails';
import { useRouter } from 'expo-router';
import AcceptRejectButtons from './AcceptRejectButtons';

export interface HomeModalProps extends HomeUserCardProps, ModalRideDetailsProps { }

const HomeModal: FC<HomeModalProps> = ({
  rating,
  userImage,
  from,
  to
}) => {
  const router = useRouter()
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const handleAcceptRide = () => {
    router.push("/driver/(home)/ride-accept")
    hideModal()
  }

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}>
          <ScrollView style={styles.container}>
            <View style={styles.modalContainer}>
              <HomeUserCard
                userImage={userImage}
                rating={rating}
              />
              <ModalRideDetails
                from={from}
                to={to}
              />
              <AcceptRejectButtons
                acceptFn={handleAcceptRide}
                rejectFn={hideModal}
                acceptTxt='Accept Ride'
                rejectTxt='Reject Ride'
              />
            </View>
          </ScrollView>
        </Modal>
      </Portal>
      {/* TODO: Delele this later */}
      <CustomButton
        status='danger'
        style={{ marginTop: 30, position: "absolute", top: 0, right: 0, zIndex: 10 }}
        onPress={showModal}>
        Show Modal
      </CustomButton>
      <CustomButton
        status='danger'
        style={{ marginTop: 30, position: "absolute", top: 80, right: 0, zIndex: 10 }}
        onPress={() => router.push("/driver/(home)/upcoming-rides")}>
        Rides Screen
      </CustomButton>
    </>
  );
}

export default HomeModal