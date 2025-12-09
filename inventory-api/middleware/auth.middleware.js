/**
 * AUTH MIDDLEWARE
 * 
 * This middleware protects API routes that require authentication.
 * 
 * How it works:
 * 1. Check if Authorization header exists
 * 2. Extract token from "Bearer {token}" format
 * 3. Verify token using JWT_SECRET
 * 4. If valid, attach user info to request and continue
 * 5. If invalid, return 401 error
 * 
 * Usage: Add to protected routes like:
 * router.get('/protected-route', authMiddleware, (req, res) => {
 *   // req.user contains: { id, email, role }
 * });
 */
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // ========== GET TOKEN FROM HEADER ==========
    // Expected format: "Authorization: Bearer {token}"
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // ========== PARSE TOKEN ==========
    // Split "Bearer {token}" into ["Bearer", "{token}"]
    const parts = authHeader.split(' ');
    
    // Verify format is exactly "Bearer {token}"
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Token format invalid' });
    }
    
    const token = parts[1];
    
    // ========== VERIFY TOKEN ==========
    // Check that token is valid and hasn't expired
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token invalid or expired' });
      }
      
      // ========== ATTACH USER TO REQUEST ==========
      // decoded contains: { id, email, role }
      // This allows later code to know who made the request
      req.user = decoded;
      
      // ========== CONTINUE TO NEXT MIDDLEWARE ==========
      next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};


// Optional: Admin only middleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
