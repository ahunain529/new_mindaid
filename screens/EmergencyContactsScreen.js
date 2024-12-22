import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { auth, database } from '../config/firebase';
import { ref, set, onValue, remove } from 'firebase/database';

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

const EmergencyContactItem = React.memo(({ item, onCall, onRemove }) => (
  <View style={styles.contactCard}>
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{item.name}</Text>
      <Text style={styles.contactNumber}>{item.phoneNumber}</Text>
    </View>
    <View style={styles.contactActions}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.callButton]}
        onPress={() => onCall(item.phoneNumber)}
      >
        <Ionicons name="call" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, styles.removeButton]}
        onPress={() => onRemove(item.id)}
      >
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  </View>
));

const PhoneContactItem = React.memo(({ item, onSelect }) => (
  <TouchableOpacity 
    style={styles.phoneContactItem}
    onPress={() => onSelect(item)}
  >
    <View style={styles.contactIcon}>
      <Text style={styles.contactInitial}>
        {item.name.charAt(0).toUpperCase()}
      </Text>
    </View>
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{item.name}</Text>
      <Text style={styles.contactNumber}>
        {item.phoneNumbers[0].number}
      </Text>
    </View>
  </TouchableOpacity>
));

export default function EmergencyContactsScreen() {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadEmergencyContacts();
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });
        if (data.length > 0) {
          const validContacts = data.filter(contact => 
            contact.phoneNumbers && contact.phoneNumbers.length > 0
          );
          setPhoneContacts(validContacts);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = phoneContacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumbers[0].number.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(phoneContacts);
    }
  }, [searchQuery, phoneContacts]);

  const loadEmergencyContacts = () => {
    if (!userId) return;

    const contactsRef = ref(database, `emergency_contacts/${userId}`);
    onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contactsArray = Object.entries(data).map(([id, contact]) => ({
          id,
          ...contact,
        }));
        setEmergencyContacts(contactsArray);
      } else {
        setEmergencyContacts([]);
      }
    });
  };

  const addEmergencyContact = async (contact) => {
    try {
      const contactsRef = ref(database, `emergency_contacts/${userId}/${contact.id}`);
      await set(contactsRef, {
        name: contact.name,
        phoneNumber: contact.phoneNumbers[0].number,
        timestamp: Date.now(),
      });
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add emergency contact');
    }
  };

  const removeEmergencyContact = async (contactId) => {
    try {
      const contactRef = ref(database, `emergency_contacts/${userId}/${contactId}`);
      await remove(contactRef);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove emergency contact');
    }
  };

  const callContact = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    Alert.alert(
      'Call Emergency Contact',
      'Do you want to call this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call',
          onPress: () => {
            const telUrl = `tel:${formattedNumber}`;
            Linking.openURL(telUrl).catch(err => 
              Alert.alert('Error', 'Could not make the call')
            );
          }
        }
      ]
    );
  };

  const renderEmergencyContact = ({ item }) => (
    <EmergencyContactItem 
      item={item}
      onCall={callContact}
      onRemove={removeEmergencyContact}
    />
  );

  const renderPhoneContact = ({ item }) => (
    <PhoneContactItem 
      item={item}
      onSelect={addEmergencyContact}
    />
  );

  const getItemLayout = (data, index) => ({
    length: 76, // Approximate height of each item
    offset: 76 * index,
    index,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {emergencyContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people" size={50} color={theme.colors.primary} />
          <Text style={styles.emptyStateText}>No emergency contacts added</Text>
          <Text style={styles.emptyStateSubtext}>
            Add contacts that you can quickly reach in case of emergency
          </Text>
        </View>
      ) : (
        <FlatList
          data={emergencyContacts}
          renderItem={renderEmergencyContact}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contactsList}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Contact</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Ionicons name="close-circle" size={20} color="gray" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredContacts}
              renderItem={renderPhoneContact}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.phoneContactsList}
              getItemLayout={getItemLayout}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              ListEmptyComponent={() => (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptySearchText}>No contacts found</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactsList: {
    padding: 20,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    color: 'gray',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  callButton: {
    backgroundColor: theme.colors.accent,
  },
  removeButton: {
    backgroundColor: theme.colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    height: '80%',
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 5,
  },
  phoneContactsList: {
    paddingTop: 10,
    flexGrow: 1,
  },
  phoneContactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  emptySearch: {
    alignItems: 'center',
    padding: 20,
  },
  emptySearchText: {
    fontSize: 16,
    color: 'gray',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  contactInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 