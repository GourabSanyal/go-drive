import { View, Text } from 'react-native'
import React from 'react'
import UpcomingRideBanner from './UpcomingRideBanner'
import { UpcomingRideStyles } from './styles'
import { CommonStyles } from '../styles'

export default function UpcomingRide() {
    return (
        <View style={[CommonStyles.container, { gap: 20 }]}>
            <UpcomingRideBanner
                time="10:00 am"
                from="Bangalore Fort, Bangalore Division, Karnataka"
                to="Lalbagh Botanical Garden"
                vehicle="EV"
                fare={162}
            />
            <UpcomingRideBanner
                time="10:00 am"
                from="Bangalore Fort, Bangalore Division, Karnataka"
                to="Lalbagh Botanical Garden"
                vehicle="EV"
                fare={162}
            />
            <UpcomingRideBanner
                time="10:00 am"
                from="Bangalore Fort, Bangalore Division, Karnataka"
                to="Lalbagh Botanical Garden"
                vehicle="EV"
                fare={162}
            />
        </View>
    )
}