import RideAccept from "@/components/driver/home/RideAccept";
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
  const { rideId, activeRideRoomId } = useLocalSearchParams();
 

  return (
    <RideAccept
      rideId={rideId}
      activeRideRoomId={activeRideRoomId}
    />
  )
}