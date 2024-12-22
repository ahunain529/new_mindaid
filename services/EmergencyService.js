import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Alert } from 'react-native';
import { database, auth } from '../config/firebase';
import { ref, get } from 'firebase/database';

class EmergencyService {
  async sendEmergencyMessage() {
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to send emergency messages');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get emergency contacts
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const contactsRef = ref(database, `emergency_contacts/${userId}`);
      const snapshot = await get(contactsRef);
      const contacts = snapshot.val() || {};

      // Check if there are any emergency contacts
      const phoneNumbers = Object.values(contacts).map(contact => contact.phoneNumber);
      if (phoneNumbers.length === 0) {
        Alert.alert('No Contacts', 'Please add emergency contacts first');
        return;
      }

      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'SMS is not available on this device');
        return;
      }

      // Prepare and send message
      const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `EMERGENCY SOS: I need immediate help! My current location is: ${googleMapsUrl}`;

      const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
      
      if (result === 'sent') {
        Alert.alert('Success', 'Emergency SOS sent to your contacts');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency SOS');
      console.error(error);
    }
  }
}

export default new EmergencyService();