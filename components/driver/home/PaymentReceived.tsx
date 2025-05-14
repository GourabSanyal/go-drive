import { View } from 'react-native'
import { PaymentReceivedStyles as styles } from "./styles"
import CustomText from '@/components/ui/CustomText'
import { FC } from 'react'
import { Colors } from '@/theme/colors'

interface PaymentReceivedProps {
  amount: number
  paymentMethod: string
}

const PaymentReceived: FC<PaymentReceivedProps> = ({ amount, paymentMethod }) => {
  return (
    <View style={styles.container}>
      <CustomText variant='h3'>
        Collect Payment
      </CustomText>
      <CustomText variant='h4' style={{ color: Colors.primary }}>
        ₹{amount}
      </CustomText>
      <CustomText variant='h5' style={{ textAlign: "center" }}>
        Payment with{"\n"}
        {paymentMethod}
      </CustomText>
    </View>
  )
}

export default PaymentReceived