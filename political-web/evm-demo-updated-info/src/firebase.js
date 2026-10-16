import { initializeApp } from "firebase/app";
import { getDatabase, goOffline, goOnline } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAbGClXWdAPbHmBoU8qQvFlRluyXaJ9Jm8",
    authDomain: "evm-demo-295a3.firebaseapp.com",
    databaseURL: "https://evm-demo-295a3-default-rtdb.firebaseio.com",
    projectId: "evm-demo-295a3",
    storageBucket: "evm-demo-295a3.firebasestorage.app",
    messagingSenderId: "421922796108",
    appId: "1:421922796108:web:af290739fbf5680f967ae9",
    measurementId: "G-LL4YL0G6EW"
  };

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);

// Enable offline persistence for faster loading
try {
    // Enable offline persistence
    if (typeof window !== 'undefined') {
        // Set up connection state monitoring
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored, going online');
            goOnline(db);
        });

        window.addEventListener('offline', () => {
            console.log('📴 Connection lost, going offline');
            goOffline(db);
        });
    }
} catch (error) {
    console.warn('Firebase offline persistence setup failed:', error);
}
