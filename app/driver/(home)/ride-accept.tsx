import RideAccept from "@/components/driver/home/RideAccept";
import { useSocket } from "@/src/hooks/useSocket";
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
  const { rideId, activeRideRoomId } = useLocalSearchParams();
  const { driverRideState } = useSocket()

  return (
    <RideAccept
      rideId={rideId}
      activeRideRoomId={activeRideRoomId}
      driverRideState={driverRideState}
    />
  )
}