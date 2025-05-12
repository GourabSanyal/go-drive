import { View } from 'react-native'
import UpcomingRideBanner from '../home/UpcomingRideBanner'
import { CommonStyles } from '../styles'
import PaymentHistory from './PaymentHistory'
import { DATA } from './styles'

export default function History() {
    return (
        <View style={[CommonStyles.container]}>
            <UpcomingRideBanner
                time="10:00 am"
                from="Bangalore Fort, Bangalore Division, Karnataka"
                to="Lalbagh Botanical Garden"
                vehicle="EV"
                fare={162}
            />
            <PaymentHistory
                data={DATA}
            />
        </View>
    )
}