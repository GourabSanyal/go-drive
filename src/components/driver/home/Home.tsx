import { CommonStyles } from '../styles'
import UpcomingRideBanner from './UpcomingRideBanner'
import QuickActionGrid from './QuickActionGrid'
import LocationPicker from './LocationPicker'
import { View } from 'react-native'
import HomeModal from './HomeModal'

export default function Home() {
  return (
    <View
      style={CommonStyles.container}>
      <UpcomingRideBanner
        time="10:00 am"
        from="Bangalore Fort, Bangalore Division, Karnataka"
        to="Lalbagh Botanical Garden"
        vehicle="EV"
        fare={162}
      />
      <QuickActionGrid />
      <LocationPicker />
      <HomeModal
        from='Bangalore Fort, Bangalore, Karnataka, India'
        to='Lalbagh Botanical Garden, Bangalore, Karnataka, India'
        rating={4.4}
        userImage='https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&w=1000&q=80'
      />
    </View>
  )
}