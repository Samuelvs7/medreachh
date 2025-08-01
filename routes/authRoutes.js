import express from 'express';
const router = express.Router();
import { auth, checkRole } from '../middleware/auth.js';
import { 
  register, 
  login, 
  getCurrentUser, 
  handleGoogleAuth 
} from '../controllers/authController.js';

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', handleGoogleAuth);

// Protected routes
router.get('/me', auth, getCurrentUser);

// Admin-only routes
router.get('/admin', auth, checkRole(['admin']), (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

export default router;
