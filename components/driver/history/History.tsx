import { View } from 'react-native'
import UpcomingRideBanner from '../home/UpcomingRideBanner'
import { CommonStyles } from '../styles'
import PaymentHistory from './PaymentHistory'
import { DATA } from './styles'

export default function History() {
    return (
        <View style={[CommonStyles.container]}>
            <View style={{ height: "25%" }}>

                <UpcomingRideBanner
                    time="10:00 am"
                    from={{ latitude: 23.96274, longitude: 23.9987 }}
                    to={{ latitude: 23.99274, longitude: 23.9987 }}
                    vehicle="EV"
                    fare={164}
                />
            </View>
            <PaymentHistory
                data={DATA}
            />
        </View>
    )
}