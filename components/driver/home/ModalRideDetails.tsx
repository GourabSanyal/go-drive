import CustomText from '@/components/ui/CustomText'
import { View } from 'react-native'
import { modalStyles as styles } from './styles';
import { CommonStyles } from '../styles';
import { Spline } from 'lucide-react-native';
import { Colors } from '@/theme/colors';

export interface ModalRideDetailsProps {
    from: string
    to: string
    showFare?: boolean
    showDistance?: boolean
}

export default function ModalRideDetails({
    from,
    to,
    showDistance = true,
    showFare = true
}: ModalRideDetailsProps) {
    return (
        <>
            {showFare && <View style={styles.cardDetails}>
                <CustomText variant='h7'>Estimated fare</CustomText>
                <CustomText style={{ color: Colors.primary }} variant='h7'>₹152</CustomText>
            </View>}
            {showDistance && <View style={styles.cardDetails}>
                <CustomText variant='h7'>Distance to pickup</CustomText>
                <CustomText style={{ color: Colors.primary }} variant='h7'>600m</CustomText>
            </View>}
            <View style={styles.cardDetails}>
                <Spline color={Colors.primary} style={[CommonStyles.spline, { width: "20%" }]} />
                <View style={{ width: "80%" }}>
                    <CustomText variant='h7'>
                        {from.slice(0, 25)}...
                    </CustomText>
                    <CustomText
                        variant='h7'>
                        {to.slice(0, 25)}...
                    </CustomText>
                </View>
            </View>
        </>
    )
}