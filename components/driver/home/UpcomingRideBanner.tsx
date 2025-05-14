import { View } from 'react-native'
import { UpcomingRideStyles as styles } from './styles'
import { CommonStyles } from '../styles'
import { ChevronRight, Spline } from "lucide-react-native"
import { FC, useState } from 'react'
import CustomText from '../../ui/CustomText'
import { Colors } from '@/theme/colors'

interface UpcomingRideBannerProps {
    time: string
    from: string
    to: string
    vehicle: string
    fare: number
}

const UpcomingRideBanner: FC<UpcomingRideBannerProps> = ({
    fare,
    from,
    time,
    to,
    vehicle
}) => {
    const [showDestination, setShowDestination] = useState(true)

    return (
        <View style={[
            styles.container,
            showDestination ?
                { height: "22%" } :
                { height: "12%" }
        ]}>
            <View style={[
                styles.upper,
                showDestination ?
                    { height: "30%" } :
                    { height: "50%" }
            ]}>
                <CustomText variant='h5'>
                    Upcoming ride
                </CustomText>
            </View>
            <View style={[
                styles.middle,
                showDestination ?
                    { display: "flex", height: "40%" } :
                    { display: "none" }
            ]}>
                <View style={styles.splineContainer}>
                    <Spline
                        color={Colors.primary}
                        style={CommonStyles.spline}
                    />
                </View>
                <View style={styles.location}>
                    <CustomText
                        variant='h7'>
                        {from.slice(0, 18)}...
                    </CustomText>
                    <CustomText
                        variant='h7'>
                        {to.slice(0, 18)}...
                    </CustomText>
                </View>
                <View style={styles.vehicleDetailsContainer}>
                    <CustomText
                        variant='h7'
                        style={[styles.vehicleType]}>
                        {vehicle}
                    </CustomText>
                    <CustomText
                        style={{ color: Colors.primary }}
                        variant='h7'>
                        ₹{fare}
                    </CustomText>
                </View>
            </View>
            <View style={[
                styles.bottom,
                showDestination ?
                    { height: "30%" } :
                    { height: "50%" }
            ]}>
                <CustomText
                    variant='h5'>
                    Scheduled at {time}
                </CustomText>
                <ChevronRight color="#fff" />
            </View>
        </View>
    )
}

export default UpcomingRideBanner