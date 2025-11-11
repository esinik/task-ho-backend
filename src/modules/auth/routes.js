import { Router } from 'express';
import { User } from './model.js';
import { generateToken, generateResetToken } from './jwt.js';
import { authMiddleware } from './middleware.js';
import crypto from 'crypto';

export const router = Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password and name are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const user = new User({ email, password, name });
  await user.save();

  const token = generateToken(user._id);
  const userDto = {
    id: user._id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  res.json({ user: userDto, token });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user._id);
  const userDto = {
    id: user._id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  res.json({ user: userDto, token });
});

// Get current user (requires auth middleware)
router.get('/me', authMiddleware, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const userDto = {
    id: user._id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  res.json({ user: userDto });
});

// Change password (requires auth middleware)
router.post('/change-password', authMiddleware, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password changed successfully' });
});

// Request password reset
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({ message: 'If the email exists, a reset token will be generated' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  // In a real app, you would send this token via email
  // For now, we'll return it in the response (for development only)
  res.json({ 
    message: 'Reset token generated',
    resetToken, // Remove this in production!
    email: user.email
  });
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ error: 'Email, reset token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = await User.findOne({ 
    email,
    resetToken,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.json({ message: 'Password reset successfully' });
});

// Update profile (requires auth middleware)
router.patch('/profile', authMiddleware, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, email } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    user.email = email;
  }

  user.updatedAt = Date.now();
  await user.save();

  const userDto = {
    id: user._id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  res.json({ user: userDto });
});
