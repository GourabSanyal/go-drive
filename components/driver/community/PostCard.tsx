import React, { FC, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare, Heart, Share2, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { CommunityStyles as styles } from "./styles"
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/theme/colors';

interface PostProps {
  userImage: string
  fullname: string
  rating: number
  text: string
  image: string | undefined
  commentCount: number,
  likeCount: number
}

const PostCard: FC<PostProps> = ({
  userImage,
  fullname,
  rating,
  text,
  image,
  commentCount,
  likeCount
}) => {
  const [liked, setLiked] = useState(false)
  const handleLike = () => setLiked(!liked)
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: userImage }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{fullname}</Text>
            <View style={styles.ratingContainer}>
              {Array.from({ length: 5 }).map((star, index) => (
                <Text
                  key={index}
                  style={[styles.star, index < Math.round(rating) ? styles.filledStar : styles.emptyStar]}>
                  ★
                </Text>
              ))}
              <CustomText
                variant='h7'
                style={styles.ratingText}>
                {rating.toFixed(1)}
              </CustomText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bioContainer}>
        <CustomText variant='h7' style={styles.bioText}>
          {text}
          <CustomText variant='h7' style={styles.hashtagText}> #gomobility #evcabs</CustomText>
        </CustomText>
      </View>

      {image &&
        <Image
          source={{ uri: image }}
          style={styles.contentImage}
        />}

      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.98}
          style={styles.actionButton}>
          <MessageSquare size={20} color="#fff" />
          <Text style={styles.actionText}>{commentCount} comments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLike}
          activeOpacity={0.98}
          style={styles.actionButton}>
          <Heart size={20} color={`${liked ? Colors.primary : "#fff"}`} />

          <Text style={styles.actionText}>{likeCount} likes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.98}
          style={styles.actionButton}>
          <Share2 size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.98}
          style={styles.actionButton}>
          <Bookmark size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.98}
          style={styles.actionButton}>
          <MoreHorizontal size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />
    </View>
  );
}

export default PostCard