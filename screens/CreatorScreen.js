import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const CreatorScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meet the Creator</Text>
        <Text style={styles.subtitle}>The mind behind the app</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/dr.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
        <Image
          source={require('../assets/ruks2.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.creatorName}>ALI HUNAIN & RUKHSHAN KHAN</Text>
        <Text style={styles.creatorName}>Developed for : Sir Waseem</Text>
        <Text style={styles.role}>MindAid App Developers</Text>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            Welcome to MindAid! This app was created with the vision of making mental
            health support more accessible and engaging for everyone.
          </Text>
          
          <Text style={styles.descriptionText}>
            As a mental health sufferer, I understand the importance of having
            reliable tools and resources at your fingertips. This app combines
            professional expertise with user-friendly features to support your
            mental wellness journey.
          </Text>

          <Text style={styles.descriptionText}>
            From meditation sessions to mood tracking, every feature has been
            carefully designed to help you maintain and improve your mental well-being.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10+</Text>
            <Text style={styles.statLabel}>Features</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Secure</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FF',
  },
  header: {
    padding: 20,
    backgroundColor: '#6B48FF',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 15,
    margin: 5,
  },
  contentContainer: {
    padding: 20,
  },
  creatorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#6B48FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  descriptionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  descriptionText: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B48FF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default CreatorScreen; 