import CustomText from '@/components/ui/CustomText'
import { View } from 'react-native'
import { RideAcceptStyles as styles } from './styles'
import Call from "@/assets/images/ride-accept/call.svg"
import Message from "@/assets/images/ride-accept/msg.svg"

export default function CallMsgButtons() {
    return (
        <View style={styles.CallMsgBtnContainer}>
            <View style={styles.CallMsgBtn}>
                <Call width={24} height={24} />
                <CustomText>
                    Call
                </CustomText>
            </View>
            <View style={styles.CallMsgBtn}>
                <Message width={24} height={24} />
                <CustomText>
                    Message
                </CustomText>
            </View>
        </View>
    )
}