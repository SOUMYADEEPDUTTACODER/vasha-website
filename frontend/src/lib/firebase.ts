import { initializeApp } from 'firebase/app';
import { getAuth, PhoneAuthProvider, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA45EAtYvLeloIeBi1be62ieLg2-QOl6i0",
  authDomain: "vashaweb-4d36b.firebaseapp.com",
  projectId: "vashaweb-4d36b",
  storageBucket: "vashaweb-4d36b.firebasestorage.app",
  messagingSenderId: "712929356968",
  appId: "1:712929356968:web:18247558267beb2d79269d",
  measurementId: "G-7KRFMT8Z57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const phoneAuthProvider = new PhoneAuthProvider(auth);
export const googleProvider = new GoogleAuthProvider();

export default app;
