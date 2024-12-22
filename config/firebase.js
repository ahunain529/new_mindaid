import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCKvOtqaaw2_ofNokhlyqvzpOpxhNM_SXM",
    authDomain: "mentalhealth-e3117.firebaseapp.com",
    databaseURL: "https://mentalhealth-e3117-default-rtdb.firebaseio.com",
    projectId: "mentalhealth-e3117",
    storageBucket: "mentalhealth-e3117.firebasestorage.app",
    messagingSenderId: "656434403742",
    appId: "1:656434403742:web:3b52a5c65ae326bd321e8f",
    measurementId: "G-8W1GZDHM3Y"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth only if it hasn't been initialized
let auth;
try {
    auth = getAuth(app);
} catch (error) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

const database = getDatabase(app);

export { auth, database }; 