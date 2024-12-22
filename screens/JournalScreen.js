import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, database, storage } from '../config/firebase';
import { ref, push, onValue, remove } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import CameraModal from '../components/CameraModal';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

const moodOptions = [
  {emoji: '', text: ''},
  { emoji: '😊', text: 'Great' },
  { emoji: '🙂', text: 'Good' },
  { emoji: '😐', text: 'Okay' },
  { emoji: '😔', text: 'Down' },
  { emoji: '😢', text: 'Sad' },
];

export default function JournalScreen() {
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [image, setImage] = useState(null);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const userId = auth.currentUser?.uid;
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const entriesRef = ref(database, `journal_entries/${userId}`);
    const unsubscribe = onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.entries(data).map(([id, entry]) => ({
          id,
          ...entry,
        }));
        setEntries(entriesArray.reverse());
      } else {
        setEntries([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);
      setSound(uri);
      Alert.alert('Success', 'Voice note recorded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  }

  const playSound = async (audioUri, entryId) => {
    try {
      if (currentSound) {
        await currentSound.unloadAsync();
      }

      if (playingAudioId === entryId) {
        setPlayingAudioId(null);
        setCurrentSound(null);
        return;
      }

      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setCurrentSound(audioSound);
      setPlayingAudioId(entryId);

      audioSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          setPlayingAudioId(null);
          setCurrentSound(null);
        }
      });

      await audioSound.playAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to play audio');
      setPlayingAudioId(null);
      setCurrentSound(null);
    }
  };

  const addEntry = async () => {
    if (!selectedMood) {
      Alert.alert('Please select your mood first');
      return;
    }

    if (newEntry.trim() && newTitle.trim() && userId) {
      const entriesRef = ref(database, `journal_entries/${userId}`);
      await push(entriesRef, {
        title: newTitle,
        content: newEntry,
        mood: moodOptions[selectedMood],
        image: image,
        audioUri: sound,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
      });
      
      setModalVisible(false);
      setNewEntry('');
      setNewTitle('');
      setSelectedMood(null);
      setImage(null);
      setSound(null);
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      Alert.alert(
        'Delete Entry',
        'Are you sure you want to delete this entry?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              if (userId) {
                const entryRef = ref(database, `journal_entries/${userId}/${entryId}`);
                await remove(entryRef);
                // Stop audio if it's playing
                if (playingAudioId === entryId && currentSound) {
                  await currentSound.unloadAsync();
                  setPlayingAudioId(null);
                  setCurrentSound(null);
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const handleImage = async (photo) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Generate a unique key for the image
      const imageKey = `journal_image_${userId}_${Date.now()}`;
      
      // Save image URI to AsyncStorage
      await AsyncStorage.setItem(imageKey, photo.uri);

      // Set the image URI directly
      setImage(photo.uri);
    } catch (error) {
      console.error('Journal image error:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const renderEntry = ({ item }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View>
          <Text style={styles.entryDate}>{item.date}</Text>
          {item.mood && (
            <Text style={styles.moodEmoji}>{item.mood.emoji}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteEntry(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.entryTitle}>{item.title}</Text>
      <Text style={styles.entryContent}>{item.content}</Text>
      {item.image && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.entryImage}
            resizeMode="contain"
          />
        </View>
      )}
      {item.audioUri && (
        <TouchableOpacity 
          style={styles.audioButton}
          onPress={() => playSound(item.audioUri, item.id)}
        >
          <Ionicons 
            name={playingAudioId === item.id ? "pause" : "play"} 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={styles.audioButtonText}>
            {playingAudioId === item.id ? "Playing..." : "Play Voice Note"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const cleanupOldImages = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const imageKeys = keys.filter(key => key.startsWith('journal_image_'));
      // Keep only last 50 images
      if (imageKeys.length > 50) {
        const oldestKeys = imageKeys.sort().slice(0, imageKeys.length - 50);
        await AsyncStorage.multiRemove(oldestKeys);
      }
    } catch (error) {
      console.error('Error cleaning up old images:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={64} color={theme.colors.primary} />
            <Text style={styles.emptyStateText}>Start your journaling journey</Text>
            <Text style={styles.emptyStateSubtext}>
              Write down your thoughts and feelings
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Journal Entry</Text>

            <Text style={styles.moodPrompt}>How are you feeling?</Text>
            <View style={styles.moodContainer}>
              {moodOptions.map((mood, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.moodOption,
                    selectedMood === index && styles.selectedMood,
                  ]}
                  onPress={() => setSelectedMood(index)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodText}>{mood.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.titleInput}
              placeholder="Entry Title"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={styles.contentInput}
              placeholder="Write your thoughts..."
              multiline
              value={newEntry}
              onChangeText={setNewEntry}
            />

            <View style={styles.mediaButtons}>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => setIsCameraVisible(true)}
              >
                <Ionicons name="camera" size={24} color={theme.colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={pickImage}
              >
                <Ionicons name="image" size={24} color={theme.colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.mediaButton,
                  isRecording && { backgroundColor: theme.colors.secondary }
                ]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons 
                  name={isRecording ? "stop" : "mic"} 
                  size={24} 
                  color={isRecording ? "white" : theme.colors.primary} 
                />
              </TouchableOpacity>
            </View>

            {isRecording && (
              <View style={styles.recordingIndicator}>
                <Ionicons name="radio" size={20} color={theme.colors.secondary} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
            )}

            {sound && !isRecording && (
              <View style={styles.recordingIndicator}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.recordingText, { color: theme.colors.primary }]}>
                  Voice note recorded
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedMood(null);
                  setImage(null);
                  setSound(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={addEntry}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: image }} 
            style={styles.previewImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImage(null)}
          >
            <Ionicons name="close-circle" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
      )}

      <CameraModal
        visible={isCameraVisible}
        onClose={() => setIsCameraVisible(false)}
        onTakePhoto={handleImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  entryCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  entryDate: {
    color: 'gray',
    fontSize: 14,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 8,
  },
  entryContent: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    height: 200,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 20,
  },
  entryImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  audioButtonText: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  moodPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 15,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedMood: {
    backgroundColor: theme.colors.primary,
  },
  moodText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  mediaButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  recordingText: {
    color: theme.colors.secondary,
    marginLeft: 8,
    fontSize: 14,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  entryDate: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imagePreview: {
    position: 'relative',
    marginVertical: 10,
    alignSelf: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16/9,
    marginVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    overflow: 'hidden',
  },
  entryImage: {
    width: '100%',
    height: '100%',
  },
  imagePreviewContainer: {
    width: '100%',
    aspectRatio: 16/9,
    marginVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
}); 