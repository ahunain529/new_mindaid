import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app); 