import CustomText from '@/components/ui/CustomText'
import { FlatList, View } from 'react-native'
import Building from "@/assets/images/history/building.svg"
import { DATA, HistoryStyles as styles } from './styles'

interface CardProps {
    from: string
    to: string
    vehicleType: string
    time: string // Date
    fare: number
}

export default function PaymentHistory({ data }: {
    data: CardProps[]
}) {
    // const dbTimestamp = "2025-04-17T19:48:54.662";
    // const date = new Date(dbTimestamp);

    // const options: Intl.DateTimeFormatOptions = {
    //     hour: "numeric",
    //     minute: "2-digit",
    //     hour12: true,
    //     day: "2-digit",
    //     month: "short",
    // };

    // const formattedDateTime = date.toLocaleString("en-US", options);

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                keyExtractor={item => item.time}
                renderItem={({ item }) => (
                    <View style={styles.cardContainer}>
                        <Building width="11%" />
                        <View style={styles.rideDetails}>
                            <CustomText variant='h7'>
                                {item.from} → {item.to}
                            </CustomText>
                            <CustomText
                                style={{ opacity: 0.7 }}
                                variant='h8'>
                                {item.vehicleType}, {item.time}
                            </CustomText>
                        </View>
                        <CustomText
                            style={styles.fare}
                            variant='h5'>₹{item.fare}</CustomText>
                    </View>
                )}
            />
        </View>
    )
}