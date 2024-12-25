import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '../config/firebase';
import { ref, set, get } from 'firebase/database';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MenstruationTrackerScreen = () => {
  const [cycleData, setCycleData] = useState({
    lastPeriodDate: null,
    cycleLength: 28,
    periodLength: 5,
    symptoms: {},
    markedDates: {},
  });

  const userId = auth.currentUser?.uid;

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    if (!userId) return;

    try {
      const userRef = ref(database, `menstruation/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCycleData(data);
        if (data.lastPeriodDate) {
          updatePredictedDates(data.lastPeriodDate, data.cycleLength);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load your data');
    }
  };

  const saveUserData = async (newData) => {
    if (!userId) return;

    try {
      await set(ref(database, `menstruation/${userId}`), newData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save your data');
      console.error('Save error:', error);
    }
  };

  const updatePredictedDates = (startDate, cycleLength = 28) => {
    const newMarkedDates = {};
    const start = new Date(startDate);
    
    // Mark actual period days
    for (let i = 0; i < cycleData.periodLength; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      newMarkedDates[dateString] = {
        selected: true,
        selectedColor: '#FF6B6B',
      };
    }

    // Predict next 3 cycles
    for (let i = 1; i <= 3; i++) {
      const predictedStart = new Date(start);
      predictedStart.setDate(start.getDate() + (cycleLength * i));
      
      for (let j = 0; j < cycleData.periodLength; j++) {
        const date = new Date(predictedStart);
        date.setDate(predictedStart.getDate() + j);
        const dateString = date.toISOString().split('T')[0];
        newMarkedDates[dateString] = {
          selected: true,
          selectedColor: 'rgba(255, 107, 107, 0.5)', // Lighter color for predictions
        };
      }
    }

    const newData = {
      ...cycleData,
      lastPeriodDate: startDate,
      markedDates: newMarkedDates,
    };

    setCycleData(newData);
    saveUserData(newData);
  };

  const handleDateSelect = (date) => {
    updatePredictedDates(date.dateString, cycleData.cycleLength);
  };

  const updateSymptoms = (date, symptom, intensity) => {
    const newSymptoms = {
      ...cycleData.symptoms,
      [date]: {
        ...(cycleData.symptoms[date] || {}),
        [symptom]: intensity,
      },
    };

    const newData = {
      ...cycleData,
      symptoms: newSymptoms,
    };

    setCycleData(newData);
    saveUserData(newData);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Period Tracker</Text>
        <Text style={styles.headerSubtitle}>Track your menstrual cycle</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={cycleData.markedDates}
          theme={{
            todayTextColor: '#6B48FF',
            selectedDayBackgroundColor: '#6B48FF',
            calendarBackground: 'transparent',
            textSectionTitleColor: '#2D3436',
            dayTextColor: '#2D3436',
            arrowColor: '#6B48FF',
            monthTextColor: '#2D3436',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      <View style={styles.symptomsContainer}>
        <Text style={styles.sectionTitle}>Today's Symptoms</Text>
        {['cramps', 'mood', 'flow'].map(symptom => (
          <View key={symptom} style={styles.symptomRow}>
            <Text style={styles.symptomText}>
              {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
            </Text>
            <View style={styles.intensityButtons}>
              {[1, 2, 3, 4, 5].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.intensityButton,
                    cycleData.symptoms[new Date().toISOString().split('T')[0]]?.[symptom] === level && 
                    styles.selectedIntensity
                  ]}
                  onPress={() => updateSymptoms(new Date().toISOString().split('T')[0], symptom, level)}
                >
                  <Text style={[
                    styles.intensityText,
                    cycleData.symptoms[new Date().toISOString().split('T')[0]]?.[symptom] === level && 
                    styles.selectedIntensityText
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="calendar" size={24} color="#6B48FF" />
          <Text style={styles.infoLabel}>Last Period</Text>
          <Text style={styles.infoValue}>
            {cycleData.lastPeriodDate 
              ? new Date(cycleData.lastPeriodDate).toLocaleDateString() 
              : 'Not set'}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="time" size={24} color="#6B48FF" />
          <Text style={styles.infoLabel}>Cycle Length</Text>
          <Text style={styles.infoValue}>{cycleData.cycleLength} days</Text>
        </View>
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.sectionTitle}>Legend</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Actual Period</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: 'rgba(255, 107, 107, 0.5)' }]} />
            <Text style={styles.legendText}>Predicted</Text>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 15,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  symptomsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
  },
  symptomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  symptomText: {
    fontSize: 16,
    color: '#2D3436',
    width: 80,
  },
  intensityButtons: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  selectedIntensity: {
    backgroundColor: '#6B48FF',
  },
  intensityText: {
    color: '#2D3436',
    fontSize: 16,
  },
  selectedIntensityText: {
    color: 'white',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    flex: 0.48,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginTop: 5,
  },
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 14,
    color: '#2D3436',
    marginLeft: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});

export default MenstruationTrackerScreen; 