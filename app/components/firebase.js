import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // For Realtime Database
import { getFirestore } from 'firebase/firestore'; // For Firestore
import { getStorage } from 'firebase/storage'; // For Firebase Storage (if needed)

const firebaseConfig = {
  apiKey: "AIzaSyBDyUjlmWwSBoWe2iNl7hT36IR1sPepLtE",
  authDomain: "ai-manager-1086e.firebaseapp.com",
  projectId: "ai-manager-1086e",
  storageBucket: "ai-manager-1086e.firebasestorage.app",
  messagingSenderId: "655998079831",
  appId: "1:655998079831:web:a0cf122adcdb4f0b25e412",
  measurementId: "G-TZ4Z0KB009"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const database = getDatabase(app);  // Realtime Database
const firestore = getFirestore(app); // Firestore
const storage = getStorage(app);     // Firebase Storage (if required)

// Export services for use in other files
export { auth, database, firestore, storage };
