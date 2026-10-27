import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes: verifies JWT in HttpOnly cookie or Authorization header
 */
export async function protect(req, res, next) {
  try {
    let token = null;

    // Check HttpOnly cookie first
    const cookieName = process.env.COOKIE_NAME || '7sports_token';
    if (req.cookies && req.cookies[cookieName]) {
      token = req.cookies[cookieName];
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      // Fallback for API clients / testing tools sending Bearer token
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || '7sports_college_demo_jwt_secret_key_2026_sports';
    const decoded = jwt.verify(token, secret);

    // Fetch user without password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please sign in again.',
      });
    }
    next(error);
  }
}

/**
 * Middleware for role-based authorization
 * Usage: authorize('admin')
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions to access this resource.',
      });
    }
    next();
  };
}
