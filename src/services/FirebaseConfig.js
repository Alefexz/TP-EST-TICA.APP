import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence, 
  getAuth 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Lê as variáveis do arquivo .env automaticamente
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// --- DIAGNÓSTICO DE ERRO (Para você ver no console se funcionou) ---
if (!firebaseConfig.apiKey) {
  console.error("❌ ERRO CRÍTICO: Chaves do Firebase NÃO encontradas!");
  console.log("O Expo não conseguiu ler o arquivo .env.");
  console.log("Tente reiniciar o servidor com: npx expo start --clear");
} else {
  console.log("✅ Firebase Configurado! Projeto:", firebaseConfig.projectId);
}

let app;
let auth;

try {
  // Padrão Singleton para evitar recriar o app
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    
    if (Platform.OS === 'web') {
      // Na Web, usamos a persistência nativa do navegador
      auth = getAuth(app);
      auth.setPersistence(browserLocalPersistence);
    } else {
      // No Mobile, usamos o AsyncStorage
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
  } else {
    app = getApp();
    auth = getAuth(app);
  }
} catch (error) {
  console.error("Erro na inicialização do Firebase:", error);
}

const db = getFirestore(app);

export { auth, db };