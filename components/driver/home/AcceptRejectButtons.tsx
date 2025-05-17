import { View } from 'react-native'
import { modalStyles as styles } from './styles';
import CustomButton from '@/components/ui/CustomButton'

export default function AcceptRejectButtons({ acceptFn,
    rejectFn,
    acceptTxt,
    rejectTxt,
    showEndRide
}: {
    acceptFn?: () => void
    rejectFn?: () => void
    acceptTxt: string
    rejectTxt: string
    showEndRide?: boolean
}) {
    return (
        <View style={styles.btnContainer}>
            {!showEndRide && <CustomButton
                style={{ width: "49%" }}
                onPress={acceptFn}
                variant='h8'
                size='small'>
                {acceptTxt} &rarr;
            </CustomButton>}
            <CustomButton
                style={!showEndRide ? { width: "49%" } : { width: "99%" }}
                onPress={rejectFn}
                variant='h8'
                size='small'
                status='danger'>
                {rejectTxt}
            </CustomButton>
        </View>
    )
}