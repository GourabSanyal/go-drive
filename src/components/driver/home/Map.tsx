import { useEffect, useState } from 'react';
import { View, Alert } from 'react-native'
import { locationStyles as styles } from './styles';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Map() {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [lng, setLng] = useState<number>()
    const [lat, setLat] = useState<number>()
    const [region, setRegion] = useState<Region | null>(null);
    const [geoData, setGeoData] = useState<Location.LocationGeocodedAddress>()

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow Lume to use your location to continue.');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});

            const coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            };
            setLocation(coords);
            setLng(coords.longitude)
            setLat(coords.latitude)
            setRegion({
                ...coords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            });
        })();
    }, []);

    const handleMapPress = async (e: MapPressEvent) => {
        const coords = e.nativeEvent.coordinate;
        setLocation(coords);
        setLng(coords.longitude)
        setLat(coords.latitude)
        const geoData: Location.LocationGeocodedAddress[] = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude
        })

        setGeoData(geoData[0])
    };

    return (
        <View style={styles.mapContainer}>
            {region && (
                <MapView
                    style={styles.map}
                    initialRegion={region}
                    onPress={handleMapPress}
                >
                    {location && (
                        <Marker
                            draggable
                            coordinate={location}
                            onDragEnd={e => setLocation(e.nativeEvent.coordinate)}
                        />
                    )}
                </MapView>
            )}
        </View>
    )
}