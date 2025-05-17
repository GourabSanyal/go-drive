import { View } from 'react-native'
import Posts from './Posts'
import { CommonStyles } from '../styles'
import { CommunityStyles as styles } from './styles'
import SearchBar from './SearchBar'

export default function Community() {
  return (
    <View style={CommonStyles.container}>
      <SearchBar />
      <View style={styles.postsContainer}>
        <Posts />
      </View>
    </View>
  )
}