import { View, ActivityIndicator } from 'react-native'
import { CommonStyles } from '../styles'
import PaymentHistory from './PaymentHistory'
import { HistoryStyles as styles } from './styles'
import { storage } from '@/src/utils/storage/mmkv'
import { collection, getDocs, getFirestore, query, where } from '@react-native-firebase/firestore'
import { useEffect, useState } from 'react'
import CustomText from '@/components/ui/CustomText'
import { Colors } from '@/theme/colors'

interface PaymentHistoryTypes {
    from: string
    to: string
    vehicleType: string
    time: string
    fare: number
}

export default function History() {
    const [loading, setLoading] = useState(false)
    const [historyData, setHistoryData] = useState<PaymentHistoryTypes[]>()

    const db = getFirestore()

    const getDriverHistory = async () => {
        try {
            setLoading(true)
            const userId = storage.getString('userId')
            if (!userId) {
                console.error('userId not found in storage')
                return
            }
            const q = query(collection(db, "rides"), where("userId", "==", userId))
            const driverDoc = await getDocs(q)
            if (driverDoc) {
                const transformedData: PaymentHistoryTypes[] = [];
                driverDoc.forEach(doc => {
                    const data = doc.data();
                    const timestamp = data.createdAt.toDate(); // Convert Firestore timestamp to Date
                    const formattedDate = timestamp.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    transformedData.push({
                        from: data.pickupLocation.address,
                        to: data.dropoffLocation.address,
                        vehicleType: "EV Deluxe", // Assuming a default value
                        time: formattedDate, // Use the formatted date
                        fare: data.fare
                    });
                });
                setHistoryData(transformedData);
                setLoading(false)
            } else {
                setLoading(false)
                console.error('Driver document not found')
            }
        } catch (error) {
            setLoading(false)
            console.error('Error fetching driver data:', error)
        }
    }

    useEffect(() => {
        getDriverHistory()
    }, [])

    if (loading || !historyData) return (
        <View style={CommonStyles.container}>
        <ActivityIndicator color={Colors.primary} />
        </View>
    )

    if (historyData?.length === 0) return (
        <View style={[styles.noRidesContainer, CommonStyles.container]}>
            <CustomText style={styles.noRidesText}>No Ride History.</CustomText>
            <CustomText style={styles.noRidesSubText}>
            Start accepting trips to view your history and payments here.
            </CustomText>
        </View>
    )

    return (
        <View style={[CommonStyles.container]}>
            {/* <View style={{ height: "25%" }}>
                 <UpcomingRideBanner
                    time="2025-05-16T09:27:20.727Z"
                    from={{ latitude: 23.96274, longitude: 23.9987 }}
                    to={{ latitude: 23.99274, longitude: 23.9987 }}
                    vehicle="EV"
                    fare={164}
                />
            </View> */}
            <PaymentHistory
                data={historyData}
            />
        </View>
    )
}