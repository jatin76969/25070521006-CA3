import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to send token response via HttpOnly cookie
function sendTokenResponse(user, statusCode, res) {
  const secret = process.env.JWT_SECRET || '7sports_college_demo_jwt_secret_key_2026_sports';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn,
  });

  const cookieName = process.env.COOKIE_NAME || '7sports_token';
  const isProduction = process.env.NODE_ENV === 'production';

  // Secure HttpOnly cookie settings for local development
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction, // false on localhost http
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  res.status(statusCode).json({
    success: true,
    message: statusCode === 201 ? 'Account registered successfully' : 'Signed in successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    },
    token, // Also provided for testing environments that prefer Authorization header
  });
}

/**
 * @desc Register user
 * @route POST /api/auth/register
 * @access Public
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // PUBLIC SIGNUP ALWAYS CREATES REGULAR USER - NEVER ADMIN
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user', // Forced regular user
      phone: phone ? phone.trim() : '',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check user with password included
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Logout user / clear HttpOnly cookie
 * @route POST /api/auth/logout
 * @access Public
 */
export async function logout(req, res) {
  const cookieName = process.env.COOKIE_NAME || '7sports_token';
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
}

/**
 * @desc Get current authenticated user
 * @route GET /api/auth/me
 * @access Private
 */
export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}
