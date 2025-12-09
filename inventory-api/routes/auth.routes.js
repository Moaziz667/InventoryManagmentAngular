/**
 * AUTHENTICATION ROUTES
 * 
 * Handles user login and registration with JWT tokens
 * All endpoints validate data and return consistent JSON responses
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, generateId } = require('../data/database');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * LOGIN ENDPOINT
 * POST /api/auth/login
 * 
 * Takes email and password, validates against database
 * Returns JWT token if valid, error if invalid
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ========== VALIDATION ==========
    // Check that both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // ========== FIND USER ==========
    // Search database for user with this email
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // ========== CHECK PASSWORD ==========
    // Use bcrypt to compare provided password with stored hash
    // bcrypt.compare() is slow on purpose (prevents brute force attacks)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // ========== GENERATE JWT TOKEN ==========
    // Create a token that expires after 24 hours
    // Token is signed with JWT_SECRET (server can verify it's real)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // ========== RETURN RESPONSE ==========
    // Return user data (but NOT password for security)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user (protected)
router.get('/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Update profile (protected)
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    const userIndex = db.users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = db.users[userIndex];
    
    // Update name
    if (name) user.name = name;
    
    // Update email (check for duplicates)
    if (email && email !== user.email) {
      const emailExists = db.users.find(u => u.email === email && u.id !== user.id);
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    
    // Update password
    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    db.users[userIndex] = user;
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

module.exports = router;
