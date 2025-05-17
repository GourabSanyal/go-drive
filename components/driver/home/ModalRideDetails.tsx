import CustomText from '@/components/ui/CustomText'
import { View } from 'react-native'
import { modalStyles as styles } from './styles';
import { CommonStyles } from '../styles';
import { Spline } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
import { useEffect, useState } from 'react';
import * as Location from "expo-location"

export interface ModalRideDetailsProps {
    from: LocationTypes
    to: LocationTypes
    showFare?: boolean
    showDistance?: boolean
    fare: number
}

interface LocationTypes {
    latitude: number
    longitude: number
}

export default function ModalRideDetails({
    from,
    to,
    showDistance = true,
    showFare = true,
    fare
}: ModalRideDetailsProps) {
    const [fromAddress, setFromAddress] = useState<string>("")
    const [toAddress, setToAddress] = useState<string>("")
    const [distance, setDistance] = useState<string>()
    const [error, setError] = useState<string>("")

    const getAddress = async ({
        latitude,
        longitude
    }: LocationTypes) => {
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
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }

    function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Radius of the Earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;
        const distanceMeters = distanceKm * 1000;

        return {
            kilometers: distanceKm,
            meters: distanceMeters
        };
    }

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

            const { meters, kilometers } = getDistance(
                from.latitude, from.longitude, to.latitude, to.longitude
            )

            meters < 1000 ? setDistance(meters.toFixed(2) + " m") : setDistance(kilometers.toFixed(2) + " km")
        })()
    }, [from, to])

    return (
        <>
            {showFare || fare && <View style={styles.cardDetails}>
                <CustomText variant='h7'>Estimated fare</CustomText>
                <CustomText style={{ color: Colors.primary }} variant='h7'>${fare}</CustomText>
            </View>}
            {showDistance && <View style={styles.cardDetails}>
                <CustomText variant='h7'>Distance to pickup</CustomText>
                <CustomText style={{ color: Colors.primary }} variant='h7'>
                    {distance}
                </CustomText>
            </View>}
            <View style={styles.cardDetails}>
                <Spline color={Colors.primary} style={[CommonStyles.spline, { width: "20%" }]} />
                <View style={{ width: "80%" }}>
                    <CustomText variant='h7'>
                        {fromAddress.slice(0, 20)}...
                    </CustomText>
                    <CustomText
                        variant='h7'>
                        {toAddress.slice(0, 20)}...
                    </CustomText>
                </View>
            </View>
        </>
    )
}