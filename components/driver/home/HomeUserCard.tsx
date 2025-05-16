import { Image, Text, View } from 'react-native'
import { modalStyles as styles } from './styles';
import CustomText from '@/components/ui/CustomText';
import { CommunityStyles } from '../community/styles';

export interface HomeUserCardProps {
  userImage: string
  rating: number
  name: string
}

export default function HomeUserCard({ userImage, rating, name }: HomeUserCardProps) {
  return (
    <View style={styles.userCardContainer}>
      <Image
        style={styles.userImage}
        width={60}
        height={60}
        source={{ uri: userImage }}
      />
      <View>
        <CustomText>{name}</CustomText>
        <View style={CommunityStyles.ratingContainer}>
          {Array.from({ length: 5 }).map((star, index) => (
            <Text
              key={index}
              style={[CommunityStyles.star, index < Math.round(rating) ? CommunityStyles.filledStar : CommunityStyles.emptyStar]}>
              ★
            </Text>
          ))}
          <CustomText
            variant='h7'
            style={CommunityStyles.ratingText}>
            {rating.toFixed(1)}
          </CustomText>
        </View>
      </View>
    </View>
  )
}