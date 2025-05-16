import { ScrollView, View } from 'react-native'
import UserCard from './UserCard'
import VehicleDetails, { VehicleDetailsProps } from './VehicleDetails'
import BalanceCard from './BalanceCard'
import SettingsMenu from './SettingsMenu'
import { CommonStyles } from '../styles'
import { profileStyles as styles } from './styles'


const Profile = () => {
  return (
    <ScrollView style={CommonStyles.container}>
      <View style={styles.container}>
        <UserCard
          contact='+1 74017410'
          fullname='Arjun Kumar'
          rating={4.8}
          userImage="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&w=1000&q=80"
        />
        <VehicleDetails
          isVehicleNumberPlate
          vehicleName='Honda Amaze'
          vehicleType='Sedan'
        />
        <BalanceCard
          balance={1400}
        />
        <SettingsMenu />
      </View>
    </ScrollView>
  )
}
export default Profile