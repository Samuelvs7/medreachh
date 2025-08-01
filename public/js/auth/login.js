// Import Firebase Authentication methods and config
import { 
    auth, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    onAuthStateChanged
} from './config.js';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Set up auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || '',
            photoURL: user.photoURL || ''
        };
        
        // Store user data in session storage
        sessionStorage.setItem('medreach_user', JSON.stringify(userData));
        
        // Redirect to dashboard if not already there
        if (!window.location.pathname.includes('dashboard')) {
            window.location.href = '/dashboard.html';
        }
    } else {
        // User is signed out
        sessionStorage.removeItem('medreach_user');
        
        // If on dashboard, redirect to login
        if (window.location.pathname.includes('dashboard')) {
            window.location.href = '/auth/login.html';
        }
    }
});

// DOM Elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    try {
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get the user's ID token
        const idToken = await user.getIdToken();
        
        // Get user data from our backend
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Store the token and user data in localStorage or sessionStorage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('medreach_token', idToken);
        storage.setItem('medreach_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: userData.user?.name || user.displayName || 'User',
            userType: userData.user?.userType || 'beneficiary',
            photoURL: user.photoURL || ''
        }));
        
        // Redirect to dashboard or home page
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle different error cases
        let errorMessage = 'Failed to sign in. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No user found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            default:
                errorMessage = error.message || 'An error occurred. Please try again.';
        }
        
        showError(errorMessage);
        
        // Reset button state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
});

// Check if user is already logged in
function checkAuthState() {
    const token = localStorage.getItem('medreach_token') || sessionStorage.getItem('medreach_token');
    if (token) {
        // User is already logged in, redirect to dashboard
        window.location.href = '/dashboard.html';
    }
}

// Handle Google Sign-In
async function handleGoogleSignIn() {
    const googleSignInBtn = document.getElementById('googleSignIn');
    if (!googleSignInBtn) return;
    
    const originalBtnText = googleSignInBtn.innerHTML;
    googleSignInBtn.disabled = true;
    googleSignInBtn.innerHTML = '<div class="spinner"></div> Signing in...';
    
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Get the user's ID token
        const idToken = await user.getIdToken();
        
        // Store the token and user data
        localStorage.setItem('medreach_token', idToken);
        localStorage.setItem('medreach_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'User',
            photoURL: user.photoURL || '',
            userType: 'beneficiary' // Default role
        }));
        
        // Send user data to our backend to create/update user in MongoDB
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    photoURL: user.photoURL
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to sync user with database');
            }
            
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
            
        } catch (dbError) {
            console.error('Database sync error:', dbError);
            // Even if database update fails, we can still proceed with login
            // as Firebase auth was successful
            window.location.href = '/dashboard.html';
        }
        
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        let errorMessage = 'Failed to sign in with Google';
        
        if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'An account already exists with the same email but different sign-in credentials.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, no need to show an error
            errorMessage = '';
        } else {
            errorMessage = error.message || 'An error occurred during Google Sign-In';
        }
        
        if (errorMessage) {
            showError(errorMessage);
        }
        
        // Reset button state
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = originalBtnText;
    }
}

// Add click event for Google Sign-In button
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    
    const googleSignInBtn = document.getElementById('googleSignIn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }
});
