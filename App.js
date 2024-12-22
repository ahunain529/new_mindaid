import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  StyleSheet, 
  View, 
  StatusBar,
  AppState,
  Platform
} from 'react-native';
import { 
  Ionicons, 
  FontAwesome5 
} from '@expo/vector-icons';
import { auth } from './config/firebase';
import AuthScreen from './screens/AuthScreen';

// Screen imports
import HomeScreen from './screens/HomeScreen';
import JournalScreen from './screens/JournalScreen';
import MeditationScreen from './screens/MeditationScreen';
import ProfileScreen from './screens/ProfileScreen';
import EmergencyContactsScreen from './screens/EmergencyContactsScreen';
import GameScreen from './screens/GameScreen';
import DoctorsScreen from './screens/DoctorsScreen';

import EmergencyService from './services/EmergencyService';
import AnimatedSplash from './components/AnimatedSplash';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const theme = {
  colors: {
    primary: '#6B48FF',    // Vibrant purple
    secondary: '#FF6B6B',  // Coral pink
    accent: '#4ECDC4',     // Turquoise
    background: '#F7F7FF', // Light lavender
    text: '#2D3436',       // Dark gray
  }
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Meditate') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Game') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'Doctors') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Emergency') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen 
        name="Meditate" 
        component={MeditationScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen 
        name="Game" 
        component={GameScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen 
        name="Doctors" 
        component={DoctorsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyContactsScreen}
        options={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null;
  }

  if (showSplash) {
    return <AnimatedSplash onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      {user ? (
        <>
          <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
          <TabNavigator />
        </>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
