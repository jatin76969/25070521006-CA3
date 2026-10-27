/**
 * Centralized Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409; // Conflict

    // Check which collection and key caused the conflict
    if (err.keyPattern && err.keyPattern.timeSlot) {
      message = 'This time slot was just booked by another user. Please select an alternate slot.';
    } else if (err.keyPattern && err.keyPattern.email) {
      statusCode = 400;
      message = 'An account with this email address already exists.';
    } else if (err.keyPattern && err.keyPattern.bookingReference) {
      message = 'Booking reference conflict. Please submit your booking again.';
    } else {
      message = 'A conflicting record already exists in the database.';
    }
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = errors.join('. ');
  }

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter '${err.path}'`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired.';
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Error Details]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Route Not Found handler
 */
export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`,
  });
}
