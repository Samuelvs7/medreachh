// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyCq4nLP5-gNoTHUXLb_L7qJv6lhzorqzo8",
    authDomain: "medreach-4ecf8.firebaseapp.com",
    projectId: "medreach-4ecf8",
    storageBucket: "medreach-4ecf8.firebasestorage.app",
    messagingSenderId: "443679613981",
    appId: "1:443679613981:web:6fe06c137635eefefe92f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export auth and other Firebase services
export { 
    auth,
    app,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
};
