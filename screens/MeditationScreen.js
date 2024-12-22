import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

export default function MeditationScreen() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadMusicFiles();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadMusicFiles = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow access to your media library');
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 50, // Limit to 50 songs
      });

      setSongs(media.assets);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load music files');
      setLoading(false);
    }
  };

  const playSound = async (uri, id) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      if (currentPlayingId === id && isPlaying) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentPlayingId(id);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      }
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleForward = async () => {
    if (sound) {
      const newPosition = Math.min(position + 10000, duration);
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleBackward = async () => {
    if (sound) {
      const newPosition = Math.max(0, position - 10000);
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleNext = async () => {
    const currentIndex = songs.findIndex(song => song.id === currentPlayingId);
    if (currentIndex < songs.length - 1) {
      const nextSong = songs[currentIndex + 1];
      await playSound(nextSong.uri, nextSong.id);
    }
  };

  const handlePrevious = async () => {
    const currentIndex = songs.findIndex(song => song.id === currentPlayingId);
    if (currentIndex > 0) {
      const previousSong = songs[currentIndex - 1];
      await playSound(previousSong.uri, previousSong.id);
    }
  };

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.songCard,
        currentPlayingId === item.id && styles.playingSongCard
      ]}
      onPress={() => playSound(item.uri, item.id)}
    >
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.filename.replace(/\.[^/.]+$/, "")}
        </Text>
        <Text style={styles.songDuration}>
          {formatTime(item.duration)}
        </Text>
      </View>
      <Ionicons
        name={currentPlayingId === item.id && isPlaying ? "pause-circle" : "play-circle"}
        size={32}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meditation Music</Text>
        <Text style={styles.headerSubtitle}>
          {songs.length} songs available
        </Text>
      </View>

      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.songList,
          currentPlayingId && { paddingBottom: 100 } // Add padding when player is visible
        ]}
        showsVerticalScrollIndicator={false}
      />

      {currentPlayingId && (
        <View style={styles.playerContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progress, 
                { width: `${(position / duration) * 100}%` }
              ]} 
            />
          </View>
          
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.playerControls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handlePrevious}
            >
              <Ionicons name="play-skip-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleBackward}
            >
              <Ionicons name="play-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, styles.playPauseButton]}
              onPress={handlePlayPause}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleForward}
            >
              <Ionicons name="play-forward" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleNext}
            >
              <Ionicons name="play-skip-forward" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.nowPlayingText} numberOfLines={1}>
            {songs.find(s => s.id === currentPlayingId)?.filename.replace(/\.[^/.]+$/, "")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
  },
  songList: {
    padding: 20,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  playingSongCard: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  songInfo: {
    flex: 1,
    marginRight: 10,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  songDuration: {
    fontSize: 14,
    color: 'white',
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeText: {
    fontSize: 12,
    color: 'gray',
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  controlButton: {
    padding: 10,
  },
  playPauseButton: {
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 5,
  },
}); 