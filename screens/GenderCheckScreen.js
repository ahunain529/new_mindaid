import React, { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenderCheck from '../components/GenderCheck';
import { useNavigation } from '@react-navigation/native';

const GenderCheckScreen = () => {
  const [modalVisible, setModalVisible] = useState(true);
  const navigation = useNavigation();

  const handleGenderSelect = async (gender) => {
    setModalVisible(false);
    
    try {
      await AsyncStorage.setItem('userGender', gender);
      
      if (gender === 'male') {
        Alert.alert(
          "Notice",
          "Period tracker will not be available for male users",
          [{ text: "OK", onPress: () => navigation.navigate('Home') }]
        );
      } else {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error saving gender:', error);
      Alert.alert('Error', 'Failed to save gender preference');
    }
  };

  return (
    <GenderCheck
      isVisible={modalVisible}
      onSelect={handleGenderSelect}
      onClose={() => {
        setModalVisible(false);
        navigation.navigate('Home');
      }}
    />
  );
};

export default GenderCheckScreen; 