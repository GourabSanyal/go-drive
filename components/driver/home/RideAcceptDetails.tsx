import CustomText from '@/components/ui/CustomText'
import { View } from 'react-native'
import { FC } from 'react'
import { RideAcceptStyles as styles } from './styles'
import { Colors } from '@/theme/colors'

interface RideAcceptDetailsProps {
    distance: string
    time: string
}

const RideAcceptDetails: FC<RideAcceptDetailsProps> = ({
    distance,
    time
}) => {
    return (
        <View style={styles.rideDetailsContainer}>
            <View style={[styles.rideDetails, {
                borderBottomWidth: 1,
                borderBottomColor: Colors.primary
            }]}>
                <CustomText variant='h7'>Distance to pickup</CustomText>
                <CustomText
                    style={{ color: Colors.primary }}
                    variant='h7'>
                    {time}
                </CustomText>
            </View>
            <View style={styles.rideDetails}>
                <CustomText variant='h7'>Estimated time</CustomText>
                <CustomText
                    style={{ color: Colors.primary }}
                    variant='h7'>
                    {distance}
                </CustomText>
            </View>
        </View>
    )
}

export default RideAcceptDetails