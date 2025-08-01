// Import Firebase Authentication methods and config
import { 
    auth, 
    createUserWithEmailAndPassword, 
    updateProfile,
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
        
        // If on dashboard, redirect to register
        if (window.location.pathname.includes('dashboard')) {
            window.location.href = '/auth/register.html';
        }
    }
});

// DOM Elements
const registerForm = document.getElementById('registerForm');
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
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const userType = document.getElementById('userType').value;
    
    // Basic validation
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (!userType) {
        showError('Please select a user type');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with display name
        await updateProfile(user, {
            displayName: name
        });
        
        // Get the user's ID token
        const idToken = await user.getIdToken();
        
        // Send user data to our backend API
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                email: user.email,
                name: name,
                userType: userType
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }
        
        // Store the token and user data in localStorage
        localStorage.setItem('medreach_token', idToken);
        localStorage.setItem('medreach_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: name,
            userType: userType
        }));
        
        // Redirect to dashboard
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle different error cases
        let errorMessage = 'Failed to create account. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled.';
                break;
            default:
                errorMessage = error.message || 'An error occurred. Please try again.';
        }
        
        showError(errorMessage);
        
        // Reset button state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
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

// Handle Google Sign-Up
async function handleGoogleSignUp() {
    const googleSignUpBtn = document.getElementById('googleSignUp');
    if (!googleSignUpBtn) return;
    
    const originalBtnText = googleSignUpBtn.innerHTML;
    googleSignUpBtn.disabled = true;
    googleSignUpBtn.innerHTML = '<div class="spinner"></div> Signing up...';
    
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
                throw new Error('Failed to create/update user in database');
            }
            
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
            
        } catch (dbError) {
            console.error('Database error:', dbError);
            // Even if database update fails, we can still proceed with login
            // as Firebase auth was successful
            window.location.href = '/dashboard.html';
        }
        
    } catch (error) {
        console.error('Google Sign-Up Error:', error);
        let errorMessage = 'Failed to sign up with Google';
        
        if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'An account already exists with the same email but different sign-in credentials.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, no need to show an error
            errorMessage = '';
        } else {
            errorMessage = error.message || 'An error occurred during Google Sign-Up';
        }
        
        if (errorMessage) {
            showError(errorMessage);
        }
        
        // Reset button state
        googleSignUpBtn.disabled = false;
        googleSignUpBtn.innerHTML = originalBtnText;
    }
}

// Add click event for Google Sign-Up button
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    
    const googleSignUpBtn = document.getElementById('googleSignUp');
    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', handleGoogleSignUp);
    }
});
