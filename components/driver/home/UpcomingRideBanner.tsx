import { TouchableOpacity, View } from 'react-native'
import { UpcomingRideStyles as styles } from './styles'
import { CommonStyles } from '../styles'
import { ChevronRight, Spline } from "lucide-react-native"
import { FC, useEffect, useState } from 'react'
import CustomText from '../../ui/CustomText'
import { Colors } from '@/theme/colors'
import * as Location from 'expo-location';
import { useSocket } from '@/src/hooks/useSocket'

interface Location {
    latitude: number
    longitude: number
}

interface UpcomingRideBannerProps {
    time: string
    from: Location
    to: Location
    vehicle: string | undefined
    fare: number
    onPress?: () => void
}

const UpcomingRideBanner: FC<UpcomingRideBannerProps> = ({
    fare,
    from,
    time,
    to,
    vehicle,
    onPress
}) => {
    const [error, setError] = useState<string>("")
    const [fromAddress, setFromAddress] = useState<string>("")
    const [toAddress, setToAddress] = useState<string>("")

    const getAddress = async ({
        latitude,
        longitude
    }: Location) => {
        try {
            const locationInfo = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (locationInfo.length > 0) {
                const loc = locationInfo[0];
                const fullAddress = `${loc.formattedAddress}`;
                return fullAddress
            }
        } catch (err) {
            console.error("Error getting address:", err);
            setError("Unable to determine location");
        }
    };

    useEffect(() => {
        (async function setAddress() {
            const fromRes = await getAddress(from)
            if (!fromRes) {
                setFromAddress("Invalid Location")
                return
            }
            setFromAddress(fromRes)
            const toRes = await getAddress(to)
            if (!toRes) {
                setToAddress("Invalid Location")
                return
            }
            setToAddress(toRes)
        })()
    }, [from, to])

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[styles.container]}>
            <View style={[styles.upper]}>
                <CustomText>
                    Upcoming ride
                </CustomText>
            </View>
            <View style={[styles.middle]}>
                <View style={styles.splineContainer}>
                    <Spline
                        color={Colors.primary}
                        style={CommonStyles.spline}
                    />
                </View>
                <View style={styles.location}>
                    <CustomText
                        variant='h7'>
                        {fromAddress.length > 60 ? fromAddress.slice(0, 60)+"..." : fromAddress}
                    </CustomText>
                    <CustomText
                        variant='h7'>
                        {toAddress.length > 60 ? toAddress.slice(0, 60)+"..." : toAddress}
                    </CustomText>
                </View>
                <View style={styles.vehicleDetailsContainer}>
                    {vehicle && <CustomText
                        variant='h7'
                        style={[styles.vehicleType]}>
                        {vehicle}
                    </CustomText>}
                    <CustomText
                        style={{ color: Colors.primary }}
                        variant='h7'>
                        ${fare}
                        {/* {fare?.currency}{' '}{fare?.amount} */}
                    </CustomText>
                </View>
            </View>
            <View style={[styles.bottom]}>
                <CustomText>
                    Scheduled at {time}
                </CustomText>
                <ChevronRight color="#fff" />
            </View>
        </TouchableOpacity>
    )
}

export default UpcomingRideBanner