import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GenderCheck = ({ isVisible, onSelect, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Select Your Gender</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.femaleButton]}
            onPress={() => onSelect('female')}
          >
            <Ionicons name="female" size={24} color="white" />
            <Text style={styles.buttonText}>Female</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.maleButton]}
            onPress={() => onSelect('male')}
          >
            <Ionicons name="male" size={24} color="white" />
            <Text style={styles.buttonText}>Male</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2D3436',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginVertical: 8,
  },
  femaleButton: {
    backgroundColor: '#FF6B6B',
  },
  maleButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default GenderCheck; 