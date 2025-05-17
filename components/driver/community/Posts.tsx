import { FlatList } from 'react-native'
import PostCard from './PostCard'
import { POSTS } from './styles'

export default function Posts() {
    return (
        <FlatList
            contentContainerStyle={{ paddingBottom: 40 }}
            data={POSTS}
            keyExtractor={item => item.fullname}
            renderItem={({ item }) => (
                <PostCard
                    userImage={item.userImage}
                    rating={item.rating}
                    fullname={item.fullname}
                    image={item.image}
                    commentCount={item.commentCount}
                    likeCount={item.likeCount}
                    text={item.text}
                />
            )}
        />
    )
}