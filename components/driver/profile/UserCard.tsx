import CustomText from '@/components/ui/CustomText'
import { Image, Text, View } from 'react-native'
import { CommunityStyles } from '../community/styles'
import { userCardStyles as styles } from './styles'
import { FC } from 'react'

export interface UserCardProps {
    fullname: string | undefined
    contact: string
    rating: number
    userImage: string | undefined
}

const UserCard: FC<UserCardProps> = ({
    contact,
    fullname,
    rating,
    userImage
}) => {
    return (
        <View style={styles.userCardContainer}>
            <View>
                <CustomText variant='h2'>{fullname && fullname}</CustomText>
                <CustomText variant='h7'>{contact}</CustomText>
                <View style={CommunityStyles.ratingContainer}>
                    {Array.from({ length: 5 }).map((star, index) => (
                        <Text
                            key={index}
                            style={[styles.star, index < Math.round(rating) ? CommunityStyles.filledStar : CommunityStyles.emptyStar]}>
                            ★
                        </Text>
                    ))}
                    <CustomText
                        variant='h6'
                        style={[CommunityStyles.ratingText, { marginTop: 5 }]}>
                        {rating.toFixed(1)}
                    </CustomText>
                </View>
            </View>
            <View>
                <Image
                    width={100}
                    height={100}
                    style={styles.userImage}
                    source={{ uri: userImage }}
                />
            </View>
        </View>
    )
}

export default UserCard