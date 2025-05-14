import { View, Text, Image, TouchableOpacity } from 'react-native'
import { QuickActionCardStyles as CardStyles, QuickActionGridStyles as styles } from './styles'
import CustomText from '../../ui/CustomText'
import { RelativePathString } from 'expo-router'
import { FC } from 'react'
import Card1Img from "@/assets/images/quick-action/card1.png"
import Card2Img from "@/assets/images/quick-action/card2.png"
import Card3Img from "@/assets/images/quick-action/card3.png"
import Card4Img from "@/assets/images/quick-action/card4.png"
import Card5Img from "@/assets/images/quick-action/card5.png"
import Card6Img from "@/assets/images/quick-action/card6.png"

export default function QuickActionGrid() {

    const FIRST = [{
        title: "classic ride",
        image: Card1Img
    }, {
        title: "logistics services",
        image: Card2Img
    }, {
        title: "rental services",
        image: Card3Img
    }]

    const SECOND = [{
        title: "airport services",
        image: Card4Img
    }, {
        title: "prime ride",
        image: Card5Img
    }, {
        title: "event services",
        image: Card6Img
    }]

    return (
        <View style={styles.container}>
            <View style={styles.gridContainer}>
                {FIRST.map((item, i) => {
                    return (
                        <QuickActionCard
                            key={i}
                            title={item.title}
                            image={item.image as RelativePathString}
                        />
                    )
                })}
            </View>
            <View style={styles.gridContainer}>
                {SECOND.map((item, i) => {
                    return (
                        <QuickActionCard
                            key={i}
                            title={item.title}
                            image={item.image as RelativePathString}
                        />
                    )
                })}
            </View>
        </View>
    )
}

interface CardProps {
    title: string
    image: any
    onPress?: () => void
}

const QuickActionCard: FC<CardProps> = ({
    image,
    title,
    onPress
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.96}
            style={CardStyles.container}>
            <View style={CardStyles.imageContainer}>
                <Image
                    style={CardStyles.image}
                    source={image}
                />
            </View>
            <CustomText variant='h7' style={CardStyles.text}>
                {title}
            </CustomText>
        </TouchableOpacity>
    )
}