import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F7F7FF',
    text: '#2D3436',
  }
};

// List of psychologists in Karachi
const doctors = [
  {
    id: 1,
    name: 'Dr. Uzma Ambareen',
    qualification: 'MBBS, FCPS (Psychiatry)',
    specialization: 'Depression, Anxiety, OCD',
    location: 'National Medical Centre, Karachi',
    experience: '15+ years',
    phone: '+92-21-34930051',
    email: 'contact@nmc.com',
    timing: 'Mon-Sat: 5:00 PM - 9:00 PM',
    fee: 'Rs. 3000',
    image: require('../assets/dr.jpg'),
  },
  {
    id: 2,
    name: 'Dr. Syed Ali Wasif',
    qualification: 'MBBS, FCPS (Psychiatry), MRCPsych (UK)',
    specialization: 'Anxiety, Depression, PTSD',
    location: 'South City Hospital, Karachi',
    experience: '12+ years',
    phone: '+92-21-35374072',
    email: 'info@sch.com',
    timing: 'Mon-Fri: 2:00 PM - 6:00 PM',
    fee: 'Rs. 3500',
    image: require('../assets/dr.jpg'),
  },
  {
    id: 3,
    name: 'Dr. Farah Iqbal',
    qualification: 'PhD Clinical Psychology',
    specialization: 'Family Therapy, Child Psychology',
    location: 'OMI Hospital, Karachi',
    experience: '10+ years',
    phone: '+92-21-34821504',
    email: 'contact@omi.com',
    timing: 'Mon-Sat: 3:00 PM - 8:00 PM',
    fee: 'Rs. 2500',
    image: require('../assets/dr.jpg'),
  },
  // Add more doctors as needed
];

const DoctorCard = ({ doctor }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${doctor.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${doctor.email}`);
  };

  const handleLocation = () => {
    const query = encodeURIComponent(doctor.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={doctor.image} style={styles.doctorImage} />
        <View style={styles.headerInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.qualification}>{doctor.qualification}</Text>
          <View style={styles.experienceContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.experience}>{doctor.experience} Experience</Text>
          </View>
        </View>
      </View>

      <View style={styles.specialization}>
        <Text style={styles.sectionTitle}>Specialization</Text>
        <Text style={styles.specializationText}>{doctor.specialization}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>{doctor.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>{doctor.timing}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>Consultation Fee: {doctor.fee}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
          <Ionicons name="mail" size={20} color="white" />
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLocation}>
          <Ionicons name="location" size={20} color="white" />
          <Text style={styles.actionText}>Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function DoctorsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mental Health Professionals</Text>
        <Text style={styles.headerSubtitle}>Find the best psychologists in Karachi</Text>
      </View>

      {doctors.map(doctor => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  qualification: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  experience: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 4,
  },
  specialization: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 5,
  },
  specializationText: {
    fontSize: 14,
    color: 'gray',
  },
  infoSection: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 10,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  actionText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
}); 