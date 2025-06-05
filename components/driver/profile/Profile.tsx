import { ScrollView, View } from 'react-native'
import UserCard from './UserCard'
import VehicleDetails, { VehicleDetailsProps } from './VehicleDetails'
import BalanceCard from './BalanceCard'
import SettingsMenu from './SettingsMenu'
import { CommonStyles } from '../styles'
import { profileStyles as styles } from './styles'
import { useState, useEffect } from 'react'
import { collection, getDocs, getFirestore, query, where } from '@react-native-firebase/firestore'
import { storage } from '@/src/utils/storage/mmkv'

const Profile = () => {
  const [imageUrl, setImageUrl] = useState()
  const [name, setName] = useState()
  const db = getFirestore()
  
  const getDriverData = async () => {
    try {
      const userId = storage.getString('userId')
      if (!userId) {
        console.error('userId not found in storage')
        return
      }
      const q = query(collection(db, "drivers"), where("userId", "==", userId))
      const driverDoc = await getDocs(q)
      if (driverDoc) {
        driverDoc.forEach(doc => {
          setImageUrl(doc.data().photo)
          setName(doc.data().name)
        })
      } else {
        console.error('Driver document not found')
      }
    } catch (error) {
      console.error('Error fetching driver data:', error)
    }
  }

  useEffect(() => {
    getDriverData()
  }, [])

  return (
    <ScrollView style={CommonStyles.container}>
      <View style={styles.container}>
        <UserCard
          contact='+1 74017410'
          fullname={name}
          rating={4.8}
          userImage={imageUrl}
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