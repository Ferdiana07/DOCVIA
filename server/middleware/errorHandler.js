/**
 * Centralized Error Handler
 * -------------------------
 * Express calls this middleware automatically when next(error) is called
 * anywhere in the app. It translates errors into consistent JSON responses.
 *
 * The format is always:
 * { success: false, message: "..." }
 *
 * Stack traces are only shown in development, never in production.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose: validation error (schema-level)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // Mongoose: invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found.`;
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File size must be 5 MB or less.'
      : 'The uploaded file could not be processed.';
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Request body contains invalid JSON.';
  }

  if (message === 'Origin is not allowed by CORS.') {
    statusCode = 403;
  }

  // JWT errors (should be caught in middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please login again.';
  }

  const response = {
    success: false,
    message,
  };

  // In development, include the stack trace for debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
