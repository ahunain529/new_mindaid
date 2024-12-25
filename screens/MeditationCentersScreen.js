import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA3FzKFHiA7bUcmOaubinG6wqCZt8Dw7Yk';

const theme = {
  colors: {
    primary: '#6B48FF',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

export default function MeditationCentersScreen() {
  const [region, setRegion] = useState(null);
  const [meditationCenters, setMeditationCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to find meditation centers near you.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(initialRegion);
      setUserLocation(location.coords);
      searchNearbyMeditationCenters(location.coords);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location');
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyMeditationCenters = async (coords) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude},${coords.longitude}&radius=5000&keyword=meditation+center+yoga&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      if (data.results) {
        setMeditationCenters(data.results);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch meditation centers');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {meditationCenters.map((center, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: center.geometry.location.lat,
              longitude: center.geometry.location.lng,
            }}
            title={center.name}
            description={center.vicinity}
            onPress={() => setSelectedCenter(center)}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="leaf" size={24} color={theme.colors.primary} />
            </View>
          </Marker>
        ))}
        
        {selectedCenter && userLocation && (
          <MapViewDirections
            origin={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            destination={{
              latitude: selectedCenter.geometry.location.lat,
              longitude: selectedCenter.geometry.location.lng,
            }}
            apikey={GOOGLE_PLACES_API_KEY}
            strokeWidth={3}
            strokeColor={theme.colors.primary}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
}); 