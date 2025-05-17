import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchLocationStyles as styles } from './styles';
import CustomText from '@/components/ui/CustomText';

interface SearchResultTypes {
  id: string;
  name: string;
  distance: string;
}

const SAMPLE_LOCATIONS = [
  { id: '1', name: 'Lehigh Botanical Garden, Bethlehem', distance: '1.2 km' },
  { id: '2', name: 'Lehigh University Campus, Bethlehem', distance: '1.5 km' },
  { id: '3', name: 'Lehigh Center Plaza, Philadelphia', distance: '2.8 km' },
  { id: '4', name: 'Bethlehem Town Center, Lehigh', distance: '3.0 km' },
];

export default function SearchLocation() {
  const [screen, setScreen] = useState('location');
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultTypes[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = SAMPLE_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectLocation = (location: { name: string }) => {
    if (activeInput === 'pickup') {
      setPickupLocation(location.name);
    } else {
      setDestination(location.name);
    }
    setScreen('location');
  };

  const handleInputFocus = (inputType: string) => {
    setActiveInput(inputType);
    setScreen('search');
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderLocationScreen = () => (
    <View style={styles.container}>
      <View style={styles.card}>

        <View style={styles.searchContainer}>
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="radio-button-on" size={20} color="#4CD964" />
            </View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => handleInputFocus('pickup')}
            >
              <CustomText style={pickupLocation ? styles.inputText : styles.placeholderText}>
                {pickupLocation || "Enter Pickup"}
              </CustomText>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={20} color="#FF3B30" />
            </View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => handleInputFocus('destination')}
            >
              <CustomText style={destination ? styles.inputText : styles.placeholderText}>
                {destination || "Enter Destination"}
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>

        {pickupLocation && destination && (
          <TouchableOpacity style={styles.confirmButton}>
            <CustomText style={styles.confirmButtonText}>Find Rides For This Route</CustomText>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSearchScreen = () => (
    <View style={styles.container}>
      <View style={styles.card}>

        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholderTextColor="gray"
            style={styles.searchInput}
            placeholder={activeInput === 'pickup' ? "Your pickup location..." : "Where do you want to go?"}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>

        {searchResults.length === 0 && searchQuery.length > 0 ? (
          <View style={styles.noResultsContainer}>
            <CustomText style={styles.noResultsText}>No locations found</CustomText>
          </View>
        ) : (
          <FlatList
            data={searchQuery.length > 0 ? searchResults : SAMPLE_LOCATIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.locationItem}
                onPress={() => handleSelectLocation(item)}
              >
                <Ionicons
                  name={activeInput === 'pickup' ? "radio-button-on" : "location"}
                  size={20}
                  color={activeInput === 'pickup' ? "#4CD964" : "#FF3B30"}
                />
                <View style={styles.locationInfo}>
                  <CustomText style={styles.locationName}>{item.name}</CustomText>
                  <CustomText style={styles.locationDistance}>{item.distance}</CustomText>
                </View>
              </TouchableOpacity>
            )}
            style={styles.locationList}
          />
        )}
      </View>
    </View>
  );

  return screen === 'location' ? renderLocationScreen() : renderSearchScreen();
}