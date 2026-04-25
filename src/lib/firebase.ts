import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || "(default)"
};

let app: any;
let auth: any;
let db: any;

try {
    if (!firebaseConfig.apiKey) {
        throw new Error("VITE_FIREBASE_API_KEY is missing! Please set your environment variables and rebuild.");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
} catch (error: any) {
    console.error("Firebase Initialization Error:", error);
    // Provide a fail-safe mock to prevent crashing the whole app
    const mockApp = { name: '[DEFAULT]', options: {} };
    auth = { 
        app: mockApp,
        currentUser: null, 
        onAuthStateChanged: (cb: any) => { cb(null); return () => {}; } 
    };
    db = { app: mockApp };
}

export { auth, db };
export default app;
