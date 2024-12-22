import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '../config/firebase';
import { ref, onValue, update, get } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { signOut, updateEmail, updatePassword } from 'firebase/auth';
import CameraModal from '../components/CameraModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomSheet } from 'react-native-btr';

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ sessions: 0, hours: 0, entries: 0 });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    // Fetch user profile data
    const userRef = ref(database, `users/${userId}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData(data);
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile = {
          name: auth.currentUser?.email?.split('@')[0] || 'User',
          email: auth.currentUser?.email,
          photoURL: null,
          createdAt: Date.now(),
        };
        update(userRef, defaultProfile);
        setUserData(defaultProfile);
      }
      setLoading(false);
    });

    // Fetch statistics
    fetchStats();

    return () => unsubscribe();
  }, [userId]);

  const fetchStats = async () => {
    if (!userId) return;

    // Get journal entries count
    const entriesRef = ref(database, `journal_entries/${userId}`);
    const entriesSnapshot = await get(entriesRef);
    const entriesCount = entriesSnapshot.exists() ? Object.keys(entriesSnapshot.val()).length : 0;

    // Get meditation sessions count (assuming you're tracking them)
    const sessionsRef = ref(database, `meditation_sessions/${userId}`);
    const sessionsSnapshot = await get(sessionsRef);
    const sessionsCount = sessionsSnapshot.exists() ? Object.keys(sessionsSnapshot.val()).length : 0;

    // Calculate total meditation hours
    let totalHours = 0;
    if (sessionsSnapshot.exists()) {
      Object.values(sessionsSnapshot.val()).forEach(session => {
        totalHours += (session.duration || 0) / 60; // Convert minutes to hours
      });
    }

    setStats({
      sessions: sessionsCount,
      hours: Math.round(totalHours),
      entries: entriesCount,
    });
  };

  const handleEditProfile = (field) => {
    setEditField(field);
    setEditValue(userData[field] || '');
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!editValue.trim()) {
      Alert.alert('Error', 'Please enter a valid value');
      return;
    }

    try {
      const updates = {};
      updates[editField] = editValue;

      // Handle email update separately as it requires authentication
      if (editField === 'email') {
        await updateEmail(auth.currentUser, editValue);
      }

      // Update in database
      await update(ref(database, `users/${userId}`), updates);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleProfilePictureUpdate = () => {
    setIsBottomSheetVisible(true);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Save image URI to AsyncStorage
        await AsyncStorage.setItem(`profile_image_${userId}`, result.assets[0].uri);

        // Update profile photo URL in database
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, {
          photoURL: result.assets[0].uri
        });

        // Update local state
        setProfileImage(result.assets[0].uri);
        Alert.alert('Success', 'Profile photo updated successfully');
      }
    } catch (error) {
      console.error('Gallery pick error:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleProfilePhoto = async (photo) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Save image URI to AsyncStorage
      await AsyncStorage.setItem(`profile_image_${userId}`, photo.uri);

      // Update profile photo URL in database
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, {
        photoURL: photo.uri
      });

      // Update local state
      setProfileImage(photo.uri);
      Alert.alert('Success', 'Profile photo updated successfully');
    } catch (error) {
      console.error('Profile photo error:', error);
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };

  // Add this useEffect to load saved image on startup
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        const savedImage = await AsyncStorage.getItem(`profile_image_${userId}`);
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    loadProfileImage();
  }, []);

  const renderBottomSheet = () => (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.bottomSheetTitle}>Update Profile Picture</Text>
      
      <TouchableOpacity 
        style={styles.bottomSheetOption}
        onPress={() => {
          setIsBottomSheetVisible(false);
          setIsCameraVisible(true);
        }}
      >
        <Ionicons name="camera" size={24} color={theme.colors.primary} />
        <Text style={styles.bottomSheetOptionText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bottomSheetOption}
        onPress={() => {
          setIsBottomSheetVisible(false);
          handlePickImage();
        }}
      >
        <Ionicons name="images" size={24} color={theme.colors.primary} />
        <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.bottomSheetOption, styles.cancelOption]}
        onPress={() => setIsBottomSheetVisible(false)}
      >
        <Text style={[styles.bottomSheetOptionText, styles.cancelText]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={handleProfilePictureUpdate}
        >
          {userData?.photoURL || profileImage ? (
            <Image 
              source={{ uri: userData?.photoURL || profileImage }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={40} color="gray" />
            </View>
          )}
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.sessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.hours}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.entries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleEditProfile('name')}
        >
          <Ionicons name="person-outline" size={24} color={theme.colors.text} />
          <Text style={styles.menuText}>Edit Name</Text>
          <Ionicons name="chevron-forward" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleEditProfile('email')}
        >
          <Ionicons name="mail-outline" size={24} color={theme.colors.text} />
          <Text style={styles.menuText}>Change Email</Text>
          <Ionicons name="chevron-forward" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleEditProfile('password')}
        >
          <Ionicons name="lock-closed-outline" size={24} color={theme.colors.text} />
          <Text style={styles.menuText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editField === 'password' ? 'Change Password' : `Edit ${editField}`}
            </Text>
            
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter new ${editField}`}
              secureTextEntry={editField === 'password'}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={() => 
                  editField === 'password' 
                    ? handleChangePassword(editValue)
                    : handleUpdateProfile()
                }
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CameraModal
        visible={isCameraVisible}
        onClose={() => setIsCameraVisible(false)}
        onTakePhoto={handleProfilePhoto}
      />

      <BottomSheet
        visible={isBottomSheetVisible}
        onBackButtonPress={() => setIsBottomSheetVisible(false)}
        onBackdropPress={() => setIsBottomSheetVisible(false)}
      >
        {renderBottomSheet()}
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  profileImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 15,
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 15,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
  },
  actionSheetTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetOptionText: {
    fontSize: 16,
    marginLeft: 15,
    color: theme.colors.text,
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cancelText: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
}); 