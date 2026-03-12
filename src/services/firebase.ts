import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth, Persistence, ReactNativeAsyncStorage } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { getReactNativePersistence } = require('@firebase/auth') as {
  getReactNativePersistence: (storage: ReactNativeAsyncStorage) => Persistence;
};

const firebaseConfig = {
  apiKey:            'AIzaSyBQoXidEXrH5NOkjzawgbm0FORkQV1vFpo',
  authDomain:        'devotional-app-dcdaf.firebaseapp.com',
  projectId:         'devotional-app-dcdaf',
  storageBucket:     'devotional-app-dcdaf.firebasestorage.app',
  messagingSenderId: '1072445897574',
  appId:             '1:1072445897574:web:38544a1882ec36de79a6a7',
  measurementId:     'G-1DY648BWXM',
};

// Guard against hot-reload re-initialization
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Use AsyncStorage persistence so auth state survives app restarts
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

// Firestore — using default in-memory cache (works with Firebase JS SDK in RN).
// Writes are queued by the SDK when offline and auto-sent when connectivity returns.
db = getFirestore(app);

export { auth, db };
export default app;
