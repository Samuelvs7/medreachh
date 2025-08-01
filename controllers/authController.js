import { admin } from '../config/firebase.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Register a new user
const register = async (req, res) => {
  try {
    const { email, password, name, userType = 'beneficiary' } = req.body;
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(userRecord.uid, { userType });

    // Create user in MongoDB
    const newUser = new User({
      uid: userRecord.uid,
      email,
      name,
      userType,
    });

    await newUser.save();

    // Generate token
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email,
        name,
        userType,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // If user creation in MongoDB fails but Firebase user was created, delete the Firebase user
    if (error.code === 11000) { // Duplicate key error
      try {
        if (userRecord && userRecord.uid) {
          await admin.auth().deleteUser(userRecord.uid);
        }
      } catch (deleteError) {
        console.error('Error cleaning up Firebase user:', deleteError);
      }
      return res.status(400).json({
        error: 'Email already exists',
        code: 'auth/email-already-exists',
      });
    }
    
    res.status(400).json({
      error: error.message || 'Registration failed',
      code: error.code || 'auth/registration-failed',
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Get user from MongoDB
    const user = await User.findOne({ uid });
    
    if (!user) {
      // If user doesn't exist in MongoDB but exists in Firebase Auth
      // (this handles cases where user was created directly in Firebase Console)
      const firebaseUser = await admin.auth().getUser(uid);
      
      const newUser = new User({
        uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || '',
        userType: firebaseUser.customClaims?.userType || 'beneficiary',
      });
      
      await newUser.save();
      
      return res.json({
        message: 'Login successful',
        user: newUser.getProfile(),
        token: await admin.auth().createCustomToken(uid),
      });
    }
    
    // Generate a new token
    const token = await admin.auth().createCustomToken(uid);
    
    res.json({
      message: 'Login successful',
      user: user.getProfile(),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message || 'Login failed',
      code: error.code || 'auth/login-failed',
    });
  }
};

// Handle Google OAuth login/signup
const handleGoogleAuth = async (req, res) => {
  try {
    const { uid, email, name, photoURL } = req.body;
    
    // Check if user exists in MongoDB
    let user = await User.findOne({ uid });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        uid,
        email,
        name,
        photoURL: photoURL || '',
        userType: 'beneficiary', // Default role
      });
      
      await user.save();
      
      // Set custom claims for role-based access
      await admin.auth().setCustomUserClaims(uid, { userType: 'beneficiary' });
    }
    
    // Generate token
    const token = await admin.auth().createCustomToken(uid);
    
    res.json({
      message: 'Authentication successful',
      user: user.getProfile(),
      token,
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({
      error: error.message || 'Google authentication failed',
      code: error.code || 'auth/google-auth-failed',
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Get user from MongoDB
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: user.getProfile(),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: 'Failed to get current user',
      details: error.message 
    });
  }
};

export {
  register,
  login,
  handleGoogleAuth,
  getCurrentUser,
};
