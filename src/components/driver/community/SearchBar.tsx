import { View, TextInput, TouchableOpacity, NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SearchbarStyles as styles } from './styles';
import { useState } from 'react';

export default function SearchBar() {
  const [searchText, setSearchText] = useState("")

  const handleInputChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
    setSearchText(e.nativeEvent.text)
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.searchIcon}>
          <Feather name="search" size={24} color="#fff" />
        </TouchableOpacity>

        <TextInput
          onChange={handleInputChange}
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#fff"
          selectionColor="#fff"
        />

        <TouchableOpacity
          activeOpacity={1}
          style={styles.micIcon}>
          <Feather name="mic" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}