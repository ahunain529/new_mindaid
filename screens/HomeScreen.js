import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_PLACES_API_KEY = 'AIzaSyA3FzKFHiA7bUcmOaubinG6wqCZt8Dw7Yk';
const GEMINI_API_KEY = 'AIzaSyBlbgVMq6W849PT9WAnHZZghMKtIq8RtAY'; // Replace with your Gemini API key

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

export default function HomeScreen() {
  const [region, setRegion] = useState(null);
  const [meditationCenters, setMeditationCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

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

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    try {
      setIsChatLoading(true);
      const userMessage = chatInput.trim();
      setChatMessages(prev => [...prev, { text: userMessage, isUser: true }]);
      setChatInput('');

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `As a meditation and mental health assistant: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botMessage = response.text();

      setChatMessages(prev => [...prev, { text: botMessage, isUser: false }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to get response from AI');
    } finally {
      setIsChatLoading(false);
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

      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => setIsChatVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>

      {isChatVisible && (
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Meditation Assistant</Text>
              <TouchableOpacity 
                onPress={() => setIsChatVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatMessages}>
              {chatMessages.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageContainer,
                    message.isUser ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              ))}
              {isChatLoading && (
                <ActivityIndicator color={theme.colors.primary} style={styles.chatLoading} />
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Ask about meditation..."
                multiline
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={sendMessage}
              >
                <Ionicons name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  chatButton: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chatContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    height: '80%',
    padding: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 5,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'purple',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatLoading: {
    marginVertical: 10,
  },
}); 