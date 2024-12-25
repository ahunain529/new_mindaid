import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Text,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = new Animated.Value(0);
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      icon: 'game-controller-outline',
      name: 'Games',
      route: 'Game',
      color: '#FF6B6B',
    },
    {
      icon: 'calendar-outline',
      name: 'Period',
      route: 'Period',
      color: '#4ECDC4',
    },
    {
      icon: 'leaf-outline',
      name: 'Meditate',
      route: 'Meditate',
      color: '#6B48FF',
    },
  ];

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}
      
      <View style={styles.container} pointerEvents="box-none">
        {menuItems.map((item, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 60 * (index + 1)],
          });

          return (
            <Animated.View
              key={item.name}
              style={[
                styles.menuItem,
                {
                  transform: [{ translateY }],
                  opacity: animation,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: item.color }]}
                onPress={() => {
                  navigation.navigate(item.route);
                  toggleMenu();
                }}
              >
                <Ionicons name={item.icon} size={24} color="white" />
              </TouchableOpacity>
              <Animated.View style={[styles.menuLabel, { opacity: animation }]}>
                <Text style={styles.menuText}>{item.name}</Text>
              </Animated.View>
            </Animated.View>
          );
        })}

        <TouchableOpacity
          style={styles.fab}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={rotation}>
            <Ionicons name="add" size={32} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: STATUSBAR_HEIGHT + 10,
    right: 30,
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fab: {
    backgroundColor: '#6B48FF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuLabel: {
    position: 'absolute',
    right: 50,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuText: {
    color: '#2D3436',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FloatingMenu; 